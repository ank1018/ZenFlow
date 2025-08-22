package com.zenflow

import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat

class NotificationAlarmReceiver : BroadcastReceiver() {
    
    companion object {
        const val EXTRA_NOTIFICATION_ID = "notification_id"
        const val EXTRA_TITLE = "title"
        const val EXTRA_MESSAGE = "message"
        const val EXTRA_CHANNEL_ID = "channel_id"
    }
    
    override fun onReceive(context: Context, intent: Intent) {
        android.util.Log.d("ZenFlow", "NotificationAlarmReceiver: onReceive called")
        
        val notificationId = intent.getIntExtra(EXTRA_NOTIFICATION_ID, 1)
        val title = intent.getStringExtra(EXTRA_TITLE) ?: "ZenFlow Reminder"
        val message = intent.getStringExtra(EXTRA_MESSAGE) ?: "You have a scheduled notification"
        val channelId = intent.getStringExtra(EXTRA_CHANNEL_ID) ?: NotificationHelper.CHANNEL_ID
        
        android.util.Log.d("ZenFlow", "NotificationAlarmReceiver: Showing notification ID=$notificationId, Title='$title', Message='$message'")
        
        // Create the notification
        val notificationIntent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        }
        
        val pendingIntent = PendingIntent.getActivity(
            context,
            notificationId,
            notificationIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        
        val builder = NotificationCompat.Builder(context, channelId)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle(title)
            .setContentText(message)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .setVibrate(longArrayOf(1000, 1000, 1000))
            .setSound(android.provider.Settings.System.DEFAULT_NOTIFICATION_URI)
            .setCategory(NotificationCompat.CATEGORY_REMINDER)
        
        try {
            android.util.Log.d("ZenFlow", "NotificationAlarmReceiver: Attempting to show notification")
            
            with(NotificationManagerCompat.from(context)) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                    if (context.checkSelfPermission(android.Manifest.permission.POST_NOTIFICATIONS) == android.content.pm.PackageManager.PERMISSION_GRANTED) {
                        notify(notificationId, builder.build())
                        android.util.Log.d("ZenFlow", "NotificationAlarmReceiver: Notification shown successfully (API 33+)")
                    } else {
                        android.util.Log.w("ZenFlow", "NotificationAlarmReceiver: POST_NOTIFICATIONS permission not granted")
                    }
                } else {
                    notify(notificationId, builder.build())
                    android.util.Log.d("ZenFlow", "NotificationAlarmReceiver: Notification shown successfully (API < 33)")
                }
            }
        } catch (e: Exception) {
            android.util.Log.e("ZenFlow", "NotificationAlarmReceiver: Error showing notification", e)
            e.printStackTrace()
        }
    }
} 