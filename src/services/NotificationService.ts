import PushNotification from 'react-native-push-notification';
import { Platform, AppState } from 'react-native';
import { Todo } from '../types';
import NativeNotificationService from './NativeNotificationService';

class NotificationService {
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) {
      return;
    }

    try {
      // Configure push notifications with error handling
      PushNotification.configure({
        // (optional) Called when Token is generated (iOS and Android)
        onRegister: function (token) {
          // Token received
        },

        // (required) Called when a remote or local notification is opened or received
        onNotification: function (notification) {
          // Notification received
        },

        // (optional) Called when the user fails to register for remote notifications
        onRegistrationError: function (err) {
          console.error('Push notification registration error:', err);
        },

        // IOS ONLY (optional): default: all - Permissions to register.
        permissions: {
          alert: true,
          badge: true,
          sound: true,
        },

        // Should the initial notification be popped automatically
        popInitialNotification: true,

        /**
         * (optional) default: true
         * - false: it will not be called (iOS) when the app is opened from a notification
         * - true: it will be called (iOS) when the app is opened from a notification
         */
        requestPermissions: Platform.OS === 'ios',
      });

      // Initial notifications are handled automatically by popInitialNotification: true
    } catch (error) {
      console.error('Error configuring push notifications:', error);
      if (error instanceof Error) {
        console.error('Error stack:', error.stack);
      }
    }

    // Create notification channel for Android
    if (Platform.OS === 'android') {
      try {
        PushNotification.createChannel(
          {
            channelId: 'task-reminders',
            channelName: 'Task Reminders',
            channelDescription: 'Notifications for task reminders',
            playSound: true,
            soundName: 'default',
            importance: 4, // IMPORTANCE_HIGH
            vibrate: true,
          },
          created => {
            // Channel created
          },
        );

        // Also create a default channel as fallback
        PushNotification.createChannel(
          {
            channelId: 'default',
            channelName: 'Default',
            channelDescription: 'Default notifications',
            playSound: true,
            soundName: 'default',
            importance: 4, // IMPORTANCE_HIGH
            vibrate: true,
          },
          created => {
            // Channel created
          },
        );
      } catch (channelError) {
        console.error('Error creating notification channel:', channelError);
        if (channelError instanceof Error) {
          console.error('Error stack:', channelError.stack);
        }
      }
    }

    // Monitor app state changes
    AppState.addEventListener('change', nextAppState => {
      // App state changed
    });

    this.isInitialized = true;
  }

  /**
   * Schedule notifications for a task using native Android notifications
   * @param task - The task to schedule notifications for
   */
  async scheduleTaskNotifications(task: Todo) {
    try {
      if (!task.startAt) {
        return;
      }

      const startTime = new Date(task.startAt);
      const now = new Date();

      // Don't schedule notifications for past tasks
      if (startTime <= now) {
        return;
      }

      // Cancel any existing notifications for this task
      this.cancelTaskNotifications(task.id);

      // Schedule 10-minute reminder (10 minutes BEFORE task starts)
      const tenMinBefore = new Date(startTime.getTime() - 10 * 60 * 1000);

      if (tenMinBefore > now) {
        // Use native notification service for reliable scheduling
        const result10min = await this.scheduleNativeNotification(
          `${task.id}_10min`,
          `⏰ 10 minutes until: ${task.title}`,
          `Your task "${task.title}" starts in 10 minutes`,
          tenMinBefore,
        );
      } else {
      }

      // Schedule 1-minute reminder (1 minute BEFORE task starts)
      const oneMinBefore = new Date(startTime.getTime() - 1 * 60 * 1000);

      if (oneMinBefore > now) {
        // Use native notification service for reliable scheduling
        const result1min = await this.scheduleNativeNotification(
          `${task.id}_1min`,
          `🚨 1 minute until: ${task.title}`,
          `Your task "${task.title}" starts in 1 minute!`,
          oneMinBefore,
        );
      } else {
      }
    } catch (error) {
      console.error('❌ Error scheduling task notifications:', error);
    }
  }

  /**
   * Schedule a single notification
   */
  private scheduleNotification(
    taskId: string,
    type: '10min' | '1min',
    date: Date,
    title: string,
    message: string,
    task: Todo,
  ) {
    try {
      const notificationId = `${taskId}_${type}`;

      PushNotification.localNotificationSchedule({
        id: notificationId,
        channelId: 'task-reminders',
        title: title,
        message: message,
        date: date,
        allowWhileIdle: true,
        repeatType: 'day', // Don't repeat
        userInfo: {
          taskId: task.id,
          taskTitle: task.title,
          notificationType: type,
        },
        playSound: true,
        soundName: 'default',
        importance: 'high',
        priority: 'high',
        vibrate: true,
        vibration: 1000,
        largeIcon: 'ic_launcher',
        smallIcon: 'ic_launcher',
        bigText: message,
        subText: 'ZenFlow Task Reminder',
        color: '#6366f1',
        autoCancel: true,
        ongoing: false,
        showWhen: true,
        when: date.getTime(),
        usesChronometer: false,
        onlyAlertOnce: false,
      });
    } catch (error) {
      console.error(
        `Error scheduling ${type} notification for task ${task.title}:`,
        error,
      );
    }
  }

  /**
   * Cancel all notifications for a specific task
   */
  cancelTaskNotifications(taskId: string) {
    try {
      // Cancel 10-minute reminder
      PushNotification.cancelLocalNotifications({ id: `${taskId}_10min` });
      // Cancel 1-minute reminder
      PushNotification.cancelLocalNotifications({ id: `${taskId}_1min` });
    } catch (error) {
      console.error(
        `Error cancelling notifications for task ${taskId}:`,
        error,
      );
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  cancelAllNotifications() {
    try {
      PushNotification.cancelAllLocalNotifications();
    } catch (error) {
      console.error('Error cancelling all notifications:', error);
    }
  }

  /**
   * Get all scheduled notifications
   */
  async getScheduledNotifications(): Promise<any[]> {
    return new Promise(resolve => {
      try {
        PushNotification.getScheduledLocalNotifications(notifications => {
          resolve(notifications || []);
        });
      } catch (error) {
        console.error('Error getting scheduled notifications:', error);
        resolve([]);
      }
    });
  }

  /**
   * Schedule notifications for multiple tasks
   */
  async scheduleMultipleTaskNotifications(tasks: Todo[]) {
    try {
      // Log Google Calendar tasks specifically
      const calendarTasks = tasks.filter(task => task.isFromCalendar);
      if (calendarTasks.length > 0) {
      }

      for (const task of tasks) {
        await this.scheduleTaskNotifications(task);
      }
    } catch (error) {
      console.error('Error scheduling multiple task notifications:', error);
    }
  }

  /**
   * Update notifications when a task is modified
   */
  async updateTaskNotifications(task: Todo) {
    try {
      // Cancel old notifications and schedule new ones
      this.cancelTaskNotifications(task.id);
      await this.scheduleTaskNotifications(task);
    } catch (error) {
      console.error('Error updating task notifications:', error);
    }
  }

  /**
   * Remove notifications when a task is deleted
   */
  removeTaskNotifications(taskId: string) {
    try {
      this.cancelTaskNotifications(taskId);
    } catch (error) {
      console.error('Error removing task notifications:', error);
    }
  }

  /**
   * Request notification permissions explicitly
   */
  async requestPermissions() {
    try {
      await this.initialize();

      if (Platform.OS === 'android') {
        // For Android, permissions are usually granted by default
        return true;
      } else {
        // For iOS, we need to request permissions
        const granted = await PushNotification.requestPermissions();
        return granted;
      }
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      if (error instanceof Error) {
        console.error('Error stack:', error.stack);
      }
      return false;
    }
  }

  /**
   * Test notification functionality
   */
  async testNotification() {
    try {
      // Test immediate notification
      const immediateResult =
        await NativeNotificationService.showCustomNotification(
          'Test Notification',
          'This is a test notification from ZenFlow',
        );

      // Test scheduled notification (1 minute from now)
      const testTime = new Date(Date.now() + 60000); // 1 minute from now
      const scheduledResult = await this.scheduleNativeNotification(
        'test_notification',
        'Test Scheduled Notification',
        'This is a test scheduled notification from ZenFlow',
        testTime,
      );

      return { immediateResult, scheduledResult };
    } catch (error) {
      console.error('❌ Error testing notifications:', error);
      return { immediateResult: false, scheduledResult: false };
    }
  }

  /**
   * Schedule a notification using native Android AlarmManager
   */
  async scheduleNativeNotification(
    id: string,
    title: string,
    message: string,
    scheduledTime: Date,
  ): Promise<boolean> {
    try {
      // Convert string ID to numeric ID for Android
      const numericId = this.hashCode(id);

      // Use native AlarmManager for reliable background scheduling
      const result = await NativeNotificationService.scheduleNotification(
        numericId,
        title,
        message,
        scheduledTime,
      );

      if (result) {
        return true;
      } else {
        // Fallback to setTimeout if AlarmManager fails
        const delay = scheduledTime.getTime() - Date.now();
        if (delay <= 0) {
          return await NativeNotificationService.showCustomNotification(
            title,
            message,
          );
        }

        setTimeout(async () => {
          await NativeNotificationService.showCustomNotification(
            title,
            message,
          );
        }, delay);

        return true;
      }
    } catch (error) {
      console.error('Error scheduling native notification:', error);
      return false;
    }
  }

  /**
   * Convert string ID to numeric ID for Android
   */
  private hashCode(str: string): number {
    let hash = 0;
    if (str.length === 0) return hash;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}

export default new NotificationService();
