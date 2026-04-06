import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import { toastConfig } from '@/config/toastConfig';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProviders } from '@/app/providers';
import { LogBox } from 'react-native';
import { NetworkStatusModal, SessionExpiredModal } from '@/shared/components';
import { useAuthStore } from '@/features/auth/store/authStore';
import { UpdateModal } from '@/features/app-update';

LogBox.ignoreAllLogs();

function App(): React.JSX.Element {
    const { isSessionExpired, setSessionExpired, logout } = useAuthStore();

    const handleSessionExpiredConfirm = () => {
        setSessionExpired(false);
        logout();
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
                <AppProviders />
                <NetworkStatusModal />
                <SessionExpiredModal
                    visible={isSessionExpired}
                    onConfirm={handleSessionExpiredConfirm}
                />
                <UpdateModal />
                <Toast config={toastConfig} position="bottom" bottomOffset={0} />
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}

export default App;
