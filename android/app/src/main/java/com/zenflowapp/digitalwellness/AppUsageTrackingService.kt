package com.zenflowapp.digitalwellness

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.app.usage.UsageEvents
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import java.util.*

class AppUsageTrackingService : Service() {
    private lateinit var usageStatsManager: UsageStatsManager
    private var isTracking = false

    companion object {
        private const val NOTIFICATION_ID = 1
        private const val CHANNEL_ID = "AppUsageTracking"
        private const val CHANNEL_NAME = "App Usage Tracking"
    }

    override fun onCreate() {
        super.onCreate()
        usageStatsManager = getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            "START_TRACKING" -> startTracking()
            "STOP_TRACKING" -> stopTracking()
        }
        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                CHANNEL_NAME,
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Tracks app usage for ZenFlow"
                setShowBadge(false)
            }
            
            val notificationManager = getSystemService(NotificationManager::class.java)
            notificationManager.createNotificationChannel(channel)
        }
    }

    private fun startTracking() {
        if (isTracking) return
        
        isTracking = true
        
        val notification = createNotification()
        startForeground(NOTIFICATION_ID, notification)
        
        // Start tracking in background thread
        Thread {
            while (isTracking) {
                try {
                    val usageData = getCurrentAppUsage()
                    // Send data to React Native
                    sendUsageDataToRN(usageData)
                    Thread.sleep(30000) // Check every 30 seconds
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            }
        }.start()
    }

    private fun stopTracking() {
        isTracking = false
        stopForeground(true)
        stopSelf()
    }

    private fun createNotification(): Notification {
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("ZenFlow")
            .setContentText("Tracking app usage")
            .setSmallIcon(R.mipmap.ic_launcher)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setOngoing(true)
            .build()
    }

    private fun getCurrentAppUsage(): Map<String, Any> {
        val endTime = System.currentTimeMillis()
        val startTime = endTime - (24 * 60 * 60 * 1000) // Last 24 hours
        
        val usageStats = usageStatsManager.queryUsageStats(
            UsageStatsManager.INTERVAL_DAILY,
            startTime,
            endTime
        )
        
        val appUsage = mutableMapOf<String, Long>()
        
        for (stat in usageStats) {
            if (stat.totalTimeInForeground > 0) {
                appUsage[stat.packageName] = stat.totalTimeInForeground
            }
        }
        
        return mapOf(
            "timestamp" to endTime,
            "appUsage" to appUsage,
            "totalScreenTime" to appUsage.values.sum()
        )
    }

    private fun sendUsageDataToRN(usageData: Map<String, Any>) {
        // This would send data to React Native via EventEmitter
        // For now, we'll store it in SharedPreferences
        val prefs = getSharedPreferences("ZenFlowUsage", Context.MODE_PRIVATE)
        prefs.edit().apply {
            putString("lastUsageData", usageData.toString())
            putLong("lastUpdateTime", System.currentTimeMillis())
            apply()
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        stopTracking()
    }
} 