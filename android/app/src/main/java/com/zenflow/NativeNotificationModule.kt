package com.zenflow

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.modules.core.DeviceEventManagerModule

class NativeNotificationModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    
    private val notificationHelper = NotificationHelper(reactContext)
    
    override fun getName(): String {
        return "NativeNotificationModule"
    }
    
    @ReactMethod
    fun showCustomNotification(title: String, message: String, promise: Promise) {
        try {
            notificationHelper.showNotification(title, message)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("NOTIFICATION_ERROR", e.message, e)
        }
    }
    
    @ReactMethod
    fun scheduleNotification(notificationId: Int, title: String, message: String, triggerTime: Double, promise: Promise) {
        try {
            android.util.Log.d("ZenFlow", "Scheduling notification: ID=$notificationId, Title='$title', Message='$message', Time=${triggerTime.toLong()}")
            notificationHelper.scheduleNotification(notificationId, title, message, triggerTime.toLong())
            android.util.Log.d("ZenFlow", "Notification scheduled successfully")
            promise.resolve(true)
        } catch (e: Exception) {
            android.util.Log.e("ZenFlow", "Error scheduling notification", e)
            promise.reject("SCHEDULE_ERROR", e.message, e)
        }
    }
    
    @ReactMethod
    fun cancelScheduledNotification(notificationId: Int, promise: Promise) {
        try {
            notificationHelper.cancelScheduledNotification(notificationId)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("CANCEL_ERROR", e.message, e)
        }
    }
    
    private fun sendEvent(eventName: String, params: Any?) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }
} 