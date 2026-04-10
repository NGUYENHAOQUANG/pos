/**
 * @file useNotificationSetup.ts
 * @description Hook to initialize FCM: request permission, get token, register with backend,
 *              handle foreground messages, and navigation on notification tap
 */
import { useEffect, useRef, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import {
    requestNotificationPermission,
    getFCMToken,
    onForegroundMessage,
    onNotificationOpenedApp,
    getInitialNotification,
    onTokenRefresh,
    initializeNotificationChannels,
    displayForegroundNotification,
} from '@/features/notifications/services/notificationService';
import { registerDeviceToken } from '@/features/notifications/services/deviceTokenApi';
import {
    useNotificationStore,
    selectFcmToken,
    selectIsTokenRegistered,
} from '@/features/notifications/store/notificationStore';
import { useAuthStore } from '@/features/auth/store/authStore';

/**
 * Handle notification tap navigation based on payload data
 */
function handleNotificationNavigation(
    remoteMessage: FirebaseMessagingTypes.RemoteMessage | null,
    navigation: ReturnType<typeof useNavigation>
): void {
    if (!remoteMessage?.data) return;

    const { type, id } = remoteMessage.data as { type?: string; id?: string };

    // TODO: Add navigation routes based on notification type
    switch (type) {
        case 'farm':
            if (id) {
                (
                    navigation as {
                        navigate: (screen: string, params: Record<string, string>) => void;
                    }
                ).navigate('FarmDetail', { id });
            }
            break;
        case 'weather':
            // Navigate to weather screen
            break;
        default:
            // Default: just open the app (no specific navigation)
            break;
    }
}

/**
 * Hook to run the full FCM setup lifecycle.
 * Should be called ONCE at the top level of the authenticated app.
 */
export function useNotificationSetup(): void {
    const navigation = useNavigation();
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    const fcmToken = useNotificationStore(selectFcmToken);
    const isTokenRegistered = useNotificationStore(selectIsTokenRegistered);

    const { setFcmToken, setHasPermission, setTokenRegistered } = useNotificationStore.getState();

    // Ref to prevent double-init
    const isInitialized = useRef(false);

    /**
     * Register the token with backend, retrying if needed
     */
    const registerToken = useCallback(
        async (token: string) => {
            try {
                const result = await registerDeviceToken(token);
                if (result.success) {
                    setTokenRegistered(true);
                    console.log('[FCM] Token registered with backend');
                }
            } catch (error) {
                console.error('[FCM] Failed to register token with backend:', error);
            }
        },
        [setTokenRegistered]
    );

    // ─── Step 1: Initialize channels, permissions, and get token ───
    useEffect(() => {
        if (!isAuthenticated || isInitialized.current) return;
        isInitialized.current = true;

        const setup = async () => {
            // Initialize Notifee channels
            await initializeNotificationChannels();

            // Request permission
            const hasPermission = await requestNotificationPermission();
            setHasPermission(hasPermission);

            if (!hasPermission) {
                console.warn('[FCM] Notification permission denied');
                return;
            }

            // Get FCM token
            const token = await getFCMToken();
            if (token) {
                setFcmToken(token);
                console.log('[FCM] Token obtained:', token);
            }
        };

        setup();

        // Reset on unmount (e.g., logout)
        return () => {
            isInitialized.current = false;
        };
    }, [isAuthenticated, setFcmToken, setHasPermission]);

    // ─── Step 2: Register token with backend when we have a new one ───
    useEffect(() => {
        if (fcmToken && isAuthenticated && !isTokenRegistered) {
            registerToken(fcmToken);
        }
    }, [fcmToken, isAuthenticated, isTokenRegistered, registerToken]);

    // ─── Step 3: Listen for token refresh ───
    useEffect(() => {
        if (!isAuthenticated) return;

        const unsubscribe = onTokenRefresh((newToken: string) => {
            console.log('[FCM] Token refreshed');
            setFcmToken(newToken);
        });

        return unsubscribe;
    }, [isAuthenticated, setFcmToken]);

    // ─── Step 4: Foreground message handler ───
    useEffect(() => {
        if (!isAuthenticated) return;

        const unsubscribe = onForegroundMessage(async remoteMessage => {
            console.log('[FCM] Foreground message:', remoteMessage.messageId);

            // Display as local notification via Notifee
            await displayForegroundNotification(remoteMessage);
        });

        return unsubscribe;
    }, [isAuthenticated]);

    // ─── Step 5: Background-opened + Quit-opened handlers ───
    useEffect(() => {
        if (!isAuthenticated) return;

        // App was in background and user tapped notification
        const unsubscribe = onNotificationOpenedApp(remoteMessage => {
            console.log('[FCM] Notification opened from background:', remoteMessage.messageId);
            handleNotificationNavigation(remoteMessage, navigation);
        });

        // App was killed and user tapped notification to open it
        getInitialNotification().then(remoteMessage => {
            if (remoteMessage) {
                console.log(
                    '[FCM] App opened from quit via notification:',
                    remoteMessage.messageId
                );
                handleNotificationNavigation(remoteMessage, navigation);
            }
        });

        return unsubscribe;
    }, [isAuthenticated, navigation]);
}
