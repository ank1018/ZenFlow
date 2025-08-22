import { NativeModules } from 'react-native';

const { NativeNotificationModule } = NativeModules;

interface NativeNotificationInterface {
  showImmediateNotification(): Promise<boolean>;
  showScheduledNotification(): Promise<boolean>;
  showCustomNotification(title: string, message: string): Promise<boolean>;
  scheduleNotification(
    notificationId: number,
    title: string,
    message: string,
    triggerTime: number,
  ): Promise<boolean>;
  cancelScheduledNotification(notificationId: number): Promise<boolean>;
}

class NativeNotificationService {
  private module: NativeNotificationInterface;

  constructor() {
    this.module = NativeNotificationModule;
  }

  /**
   * Show a custom notification using native Android
   */
  async showCustomNotification(
    title: string,
    message: string,
  ): Promise<boolean> {
    try {
      const result = await this.module.showCustomNotification(title, message);
      return result;
    } catch (error) {
      console.error('Error showing custom notification:', error);
      return false;
    }
  }

  /**
   * Schedule a notification using Android AlarmManager
   */
  async scheduleNotification(
    notificationId: number,
    title: string,
    message: string,
    triggerTime: Date,
  ): Promise<boolean> {
    try {
      console.log('🔔 Native scheduling notification:', {
        id: notificationId,
        title,
        message,
        triggerTime: triggerTime.toISOString(),
        triggerTimeMs: triggerTime.getTime(),
      });

      const result = await this.module.scheduleNotification(
        notificationId,
        title,
        message,
        triggerTime.getTime(),
      );

      console.log('📱 Native notification scheduled result:', result);
      return result;
    } catch (error) {
      console.error('❌ Error scheduling notification:', error);
      return false;
    }
  }

  /**
   * Cancel a scheduled notification
   */
  async cancelScheduledNotification(notificationId: number): Promise<boolean> {
    try {
      const result = await this.module.cancelScheduledNotification(
        notificationId,
      );
      return result;
    } catch (error) {
      console.error('Error canceling notification:', error);
      return false;
    }
  }
}

export default new NativeNotificationService();
