package com.zenflowapp.digitalwellness

import android.app.AppOpsManager
import android.content.Context
import android.content.Intent
import android.os.Process
import android.provider.Settings
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import android.util.Log

class AppUsageModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "AppUsageModule"
    }

    @ReactMethod
    fun checkUsageStatsPermission(promise: Promise) {
        try {
            val appOps = reactApplicationContext.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
            val mode = appOps.checkOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                Process.myUid(),
                reactApplicationContext.packageName
            )
            
            val hasPermission = mode == AppOpsManager.MODE_ALLOWED
            promise.resolve(hasPermission)
        } catch (e: Exception) {
            promise.reject("PERMISSION_CHECK_ERROR", e)
        }
    }

    @ReactMethod
    fun requestUsageStatsPermission(promise: Promise) {
        try {
            val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            reactApplicationContext.startActivity(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("PERMISSION_REQUEST_ERROR", e)
        }
    }

    @ReactMethod
    fun startUsageTracking(promise: Promise) {
        try {
            val intent = Intent(reactApplicationContext, AppUsageTrackingService::class.java)
            intent.action = "START_TRACKING"
            
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                reactApplicationContext.startForegroundService(intent)
            } else {
                reactApplicationContext.startService(intent)
            }
            
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("START_TRACKING_ERROR", e)
        }
    }

    @ReactMethod
    fun stopUsageTracking(promise: Promise) {
        try {
            val intent = Intent(reactApplicationContext, AppUsageTrackingService::class.java)
            intent.action = "STOP_TRACKING"
            reactApplicationContext.startService(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("STOP_TRACKING_ERROR", e)
        }
    }

    @ReactMethod
    fun getUsageStats(days: Int, promise: Promise) {
        try {
            Log.d("AppUsageModule", "📱 Getting usage stats for $days days")
            
            val usageStatsManager = reactApplicationContext.getSystemService(Context.USAGE_STATS_SERVICE) as android.app.usage.UsageStatsManager
            val endTime = System.currentTimeMillis()
            val startTime = endTime - (days * 24 * 60 * 60 * 1000L)
            
            Log.d("AppUsageModule", "📅 Time range: ${java.util.Date(startTime)} to ${java.util.Date(endTime)}")
            
            val usageStats = usageStatsManager.queryUsageStats(
                android.app.usage.UsageStatsManager.INTERVAL_DAILY,
                startTime,
                endTime
            )
            
            Log.d("AppUsageModule", "📊 Raw usage stats count: ${usageStats.size}")
            
            // Log all raw stats first
            for (stat in usageStats) {
                Log.d("AppUsageModule", "📱 RAW STAT: package=${stat.packageName}, " +
                    "timeInForeground=${stat.totalTimeInForeground}ms, " +
                    "lastTimeUsed=${java.util.Date(stat.lastTimeUsed)}, " +
                    "firstTimeStamp=${java.util.Date(stat.firstTimeStamp)}, " +
                    "lastTimeStamp=${java.util.Date(stat.lastTimeStamp)}")
            }
            
            val appUsageList = Arguments.createArray()
            var totalUsageTime = 0L
            var appCount = 0
            
            for (stat in usageStats) {
                if (stat.totalTimeInForeground > 0) {
                    val appName = getAppName(stat.packageName)
                    val usageMinutes = stat.totalTimeInForeground / 60000
                    
                    Log.d("AppUsageModule", "📱 PROCESSED: $appName ($stat.packageName) - ${usageMinutes} minutes")
                    
                    val appUsage = Arguments.createMap().apply {
                        putString("packageName", stat.packageName)
                        putString("appName", appName)
                        putDouble("usageTime", stat.totalTimeInForeground.toDouble())
                        putDouble("lastTimeUsed", stat.lastTimeUsed.toDouble())
                        putDouble("firstTimeStamp", stat.firstTimeStamp.toDouble())
                        putDouble("lastTimeStamp", stat.lastTimeStamp.toDouble())
                    }
                    appUsageList.pushMap(appUsage)
                    
                    totalUsageTime += stat.totalTimeInForeground
                    appCount++
                }
            }
            
            Log.d("AppUsageModule", "📊 SUMMARY: $appCount apps with usage, total time: ${totalUsageTime / 60000} minutes")
            Log.d("AppUsageModule", "📊 FINAL DATA BEING SENT TO JS: ${appUsageList.toString()}")
            
            promise.resolve(appUsageList)
        } catch (e: Exception) {
            Log.e("AppUsageModule", "❌ Error getting usage stats", e)
            promise.reject("GET_USAGE_STATS_ERROR", e)
        }
    }

    private fun getAppName(packageName: String): String {
        return try {
            val packageManager = reactApplicationContext.packageManager
            val applicationInfo = packageManager.getApplicationInfo(packageName, 0)
            packageManager.getApplicationLabel(applicationInfo).toString()
        } catch (e: Exception) {
            packageName
        }
    }

    private fun sendEvent(eventName: String, params: WritableMap?) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }
} 