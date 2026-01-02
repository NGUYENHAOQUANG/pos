/**
 * App Entry Point
 * @format
 */

import React from 'react';
import Toast from 'react-native-toast-message';
import { toastConfig } from './src/config/toastConfig';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProviders } from './src/app/providers';
import { LogBox } from 'react-native';
// import {
//   requestNotificationPermission,
//   getFCMToken,
//   onForegroundMessage,
// } from './src/services/notificationService';

// Tắt *mọi* cảnh báo
LogBox.ignoreAllLogs();

function App(): React.JSX.Element {
    const isDarkMode = useColorScheme() === 'dark';

    //   useEffect(() => {
    //     const setupNotifications = async () => {
    //       // Request permission
    //       const hasPermission = await requestNotificationPermission();
    //       if (hasPermission) {
    //         // Get FCM token
    //         const token = await getFCMToken();
    //         if (token) {
    //           console.log('FCM Token ready:', token);
    //           // TODO: Send token to your backend server
    //         }
    //       }
    //     };

    //     setupNotifications();

    //     // Listen for foreground messages
    //     const unsubscribe = onForegroundMessage(remoteMessage => {
    //       console.log('Foreground notification:', remoteMessage);
    //       // Show toast when notification received in foreground
    //       Toast.show({
    //         type: 'info',
    //         text1: remoteMessage.notification?.title || 'Thông báo mới',
    //         text2: remoteMessage.notification?.body || '',
    //         position: 'top',
    //         visibilityTime: 4000,
    //       });
    //     });

    //     return () => unsubscribe();
    //   }, []);

    return (
        <SafeAreaProvider>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            <AppProviders />
            <Toast config={toastConfig} topOffset={0} />
        </SafeAreaProvider>
    );
}

export default App;
