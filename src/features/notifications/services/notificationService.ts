/**
 * @file notificationService.ts
 * @description FCM + Notifee notification service for push notification handling
 * Uses the modular Firebase API to avoid deprecation warnings
 */
import {
    getMessaging,
    getToken as firebaseGetToken,
    onMessage,
    onNotificationOpenedApp as firebaseOnNotificationOpenedApp,
    onTokenRefresh as firebaseOnTokenRefresh,
    getInitialNotification as firebaseGetInitialNotification,
    requestPermission,
    subscribeToTopic as firebaseSubscribeToTopic,
    unsubscribeFromTopic as firebaseUnsubscribeFromTopic,
    AuthorizationStatus,
} from '@react-native-firebase/messaging';
import type { RemoteMessage } from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, AndroidStyle } from '@notifee/react-native';
import { Platform, PermissionsAndroid } from 'react-native';

/** Default notification channel ID for general push notifications */
const DEFAULT_CHANNEL_ID = 'default-notifications';

/**
 * Initialize notification channels (call once at app startup)
 */
export async function initializeNotificationChannels(): Promise<void> {
    if (Platform.OS === 'android') {
        await notifee.createChannel({
            id: DEFAULT_CHANNEL_ID,
            name: 'Thông báo chung',
            description: 'Thông báo từ hệ thống Mebieco',
            importance: AndroidImportance.HIGH,
            sound: 'default',
        });
    }
}

/**
 * Request notification permission from the user
 * @returns Whether permission was granted
 */
export async function requestNotificationPermission(): Promise<boolean> {
    if (Platform.OS === 'ios') {
        const messaging = getMessaging();
        const authStatus = await requestPermission(messaging);
        const enabled =
            authStatus === AuthorizationStatus.AUTHORIZED ||
            authStatus === AuthorizationStatus.PROVISIONAL;
        return enabled;
    }

    if (Platform.OS === 'android' && Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
    }

    // Android < 33 does not require runtime permission
    return true;
}

/**
 * Get FCM device token
 * @returns FCM token string or null on failure
 */
export async function getFCMToken(): Promise<string | null> {
    try {
        const messaging = getMessaging();
        const token = await firebaseGetToken(messaging);
        return token;
    } catch (error) {
        console.error('[FCM] Error getting token:', error);
        return null;
    }
}

/**
 * Listen for token refresh events
 * @param callback - Called with the new token
 * @returns Unsubscribe function
 */
export function onTokenRefresh(callback: (token: string) => void): () => void {
    const messaging = getMessaging();
    return firebaseOnTokenRefresh(messaging, callback);
}

/**
 * Listen for foreground messages
 * @param callback - Called when a message arrives while app is in foreground
 * @returns Unsubscribe function
 */
export function onForegroundMessage(callback: (message: RemoteMessage) => void): () => void {
    const messaging = getMessaging();
    return onMessage(messaging, callback);
}

/**
 * Handle notification tap when app was in background
 * @param callback - Called with the message that was tapped
 * @returns Unsubscribe function
 */
export function onNotificationOpenedApp(callback: (message: RemoteMessage) => void): () => void {
    const messaging = getMessaging();
    return firebaseOnNotificationOpenedApp(messaging, callback);
}

/**
 * Check if app was opened from a notification when it was in quit state
 * @returns The remote message or null
 */
export async function getInitialNotification(): Promise<RemoteMessage | null> {
    const messaging = getMessaging();
    return firebaseGetInitialNotification(messaging);
}

/**
 * Display a remote FCM message as a local notification via Notifee
 * (Useful for foreground messages that won't auto-display)
 */
export async function displayForegroundNotification(remoteMessage: RemoteMessage): Promise<void> {
    const title = remoteMessage.notification?.title ?? 'Thông báo mới';
    const body = remoteMessage.notification?.body ?? '';

    await notifee.displayNotification({
        title,
        body,
        data: remoteMessage.data,
        android: {
            channelId: DEFAULT_CHANNEL_ID,
            importance: AndroidImportance.HIGH,
            smallIcon: 'ic_launcher',
            pressAction: { id: 'default' },
            style: body.length > 80 ? { type: AndroidStyle.BIGTEXT, text: body } : undefined,
        },
        ios: {
            foregroundPresentationOptions: {
                banner: true,
                sound: true,
                list: true,
            },
        },
    });
}

/**
 * Subscribe to a FCM topic
 */
export async function subscribeToTopic(topic: string): Promise<void> {
    try {
        const messaging = getMessaging();
        await firebaseSubscribeToTopic(messaging, topic);
        console.log(`[FCM] Subscribed to topic: ${topic}`);
    } catch (error) {
        console.error(`[FCM] Error subscribing to topic ${topic}:`, error);
    }
}

/**
 * Unsubscribe from a FCM topic
 */
export async function unsubscribeFromTopic(topic: string): Promise<void> {
    try {
        const messaging = getMessaging();
        await firebaseUnsubscribeFromTopic(messaging, topic);
        console.log(`[FCM] Unsubscribed from topic: ${topic}`);
    } catch (error) {
        console.error(`[FCM] Error unsubscribing from topic ${topic}:`, error);
    }
}
