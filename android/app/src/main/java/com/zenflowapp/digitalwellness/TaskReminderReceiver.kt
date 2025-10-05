package com.zenflowapp.digitalwellness

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

class TaskReminderReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        Log.d("TaskReminderReceiver", "Received intent: ${intent.action}")
        
        when (intent.action) {
            Intent.ACTION_BOOT_COMPLETED -> {
                Log.d("TaskReminderReceiver", "Device boot completed, rescheduling notifications")
                // The React Native notification service will handle rescheduling
                // when the app starts up
            }
            Intent.ACTION_MY_PACKAGE_REPLACED -> {
                Log.d("TaskReminderReceiver", "App updated, rescheduling notifications")
                // The React Native notification service will handle rescheduling
                // when the app starts up
            }
        }
    }
} 