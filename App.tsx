import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import { toastConfig } from '@/config/toastConfig';
import { StatusBar, Appearance, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProviders } from '@/app/providers';
import notifee from '@notifee/react-native';
import { NetworkStatusModal, SessionExpiredModal } from '@/shared/components';
import { useAuthStore } from '@/features/auth/store/authStore';
import { UpdateModal } from '@/features/app-update';
import { useSettingsStore } from '@/features/menu/store/settingsStore';
import { AppThemeContext } from '@/styles/themeContext';
import { colors, darkTheme } from '@/styles/colors';

LogBox.ignoreAllLogs();

function App(): React.JSX.Element {
    const { isSessionExpired, setSessionExpired, logout } = useAuthStore();

    const handleSessionExpiredConfirm = () => {
        setSessionExpired(false);
        logout();
    };

    // Request notification permission via notifee
    useEffect(() => {
        const checkPermission = async () => {
            await notifee.requestPermission();
        };

        checkPermission();
    }, []);

    // Theme setup
    const themeMode = useSettingsStore(s => s.themeMode);
    const activeScheme = themeMode;
    const theme = activeScheme === 'dark' ? darkTheme : colors;

    useEffect(() => {
        if (activeScheme) {
            Appearance.setColorScheme(activeScheme);
        }
    }, [activeScheme]);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <AppThemeContext.Provider value={theme}>
                    <StatusBar
                        barStyle={activeScheme === 'dark' ? 'light-content' : 'dark-content'}
                        backgroundColor="transparent"
                        translucent
                    />
                    <AppProviders />
                    <NetworkStatusModal />
                    <SessionExpiredModal
                        visible={isSessionExpired}
                        onConfirm={handleSessionExpiredConfirm}
                    />
                    <UpdateModal />
                    <Toast
                        config={toastConfig}
                        position="bottom"
                        bottomOffset={0}
                        autoHide={true}
                        visibilityTime={2000}
                        swipeable={false}
                    />
                </AppThemeContext.Provider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}

export default App;
