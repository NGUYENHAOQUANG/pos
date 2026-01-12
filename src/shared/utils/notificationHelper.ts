import notifee, { AndroidImportance } from '@notifee/react-native';

export const notificationHelper = {
  displayOtpNotification: async (otp: string) => {
    try {
      // Request permissions (required for iOS)
      await notifee.requestPermission();

      // Create a channel (required for Android)
      const channelId = await notifee.createChannel({
        id: 'otp_channel_high', // Changed ID to ensure fresh config
        name: 'OTP Verification',
        importance: AndroidImportance.HIGH,
        sound: 'default',
      });

      // Display a notification
      await notifee.displayNotification({
        id: 'otp_notification_id', // FIXED ID: This ensures new OTPs overwrite the old one, preventing stacking
        title: 'Mã xác thực OTP',
        body: `Mã OTP của bạn là: ${otp}`,
        android: {
          channelId,
          // smallIcon: 'ic_launcher', // Remove if causing specific issues, default is usually fine
          importance: AndroidImportance.HIGH,
          pressAction: {
            id: 'default',
          },
          // autoCancel: true,
        },
        ios: {
            foregroundPresentationOptions: {
                banner: true,
                sound: true,
                list: true,
            },
        }
      });
    } catch (error) {
      console.error('Failed to display notification:', error);
    }
  },
};
