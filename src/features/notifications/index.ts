/**
 * @file notifications feature barrel export
 */
export { useNotificationSetup } from './hooks/useNotificationSetup';
export {
    useNotifications,
    useRegisterDeviceToken,
    useMarkNotificationAsRead,
} from './hooks/useNotifications';
export {
    useNotificationStore,
    selectFcmToken,
    selectHasPermission,
    selectIsTokenRegistered,
} from './store/notificationStore';
export {
    requestNotificationPermission,
    getFCMToken,
    onForegroundMessage,
    onNotificationOpenedApp,
    getInitialNotification,
    initializeNotificationChannels,
    displayForegroundNotification,
    subscribeToTopic,
    unsubscribeFromTopic,
    onTokenRefresh,
} from './services/notificationService';
export { registerDeviceToken } from './api/notification.api';
