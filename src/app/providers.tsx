/**
 * @file providers.tsx
 * @description App Providers - Wrapper for all providers
 * @author Kindy
 * @created 2025-11-16
 */
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as AntdProvider } from '@ant-design/react-native';
import { AppNavigator } from './navigation/AppNavigator';
import { antdTheme } from '../core/config/antd-theme';
import { TabBarVisibilityProvider } from './navigation/TabBarVisibilityContext';
import { SplashScreen } from '@/shared/components/layout/SplashScreen';
import { NetworkStatusModal } from '@/shared/components/lostNetwork/NetworkStatusModal';
import { ErrorBoundary } from '@/shared/components/error/ErrorBoundary';
import {
    BiometricLockScreen,
    useBiometricLock,
} from '@/shared/components/security/BiometricLockScreen';
import NetInfo from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';
import { colors } from '@/styles';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000,
            retry: 3,
            refetchOnReconnect: true,
        },
    },
});

onlineManager.setEventListener(setOnline => {
    return NetInfo.addEventListener(state => {
        const isConnected = !!state.isConnected;
        setOnline(isConnected);
        if (isConnected) {
            queryClient.invalidateQueries();
        }
    });
});

const AppTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        background: colors.white,
    },
};

export function AppProviders() {
    const [showSplash, setShowSplash] = useState(true);
    const [appReady, setAppReady] = useState(false);
    const { isLocked, handleUnlock } = useBiometricLock();

    useEffect(() => {
        const mountTimer = setTimeout(() => {
            setAppReady(true);
        }, 2000);
        const splashTimer = setTimeout(() => {
            setShowSplash(false);
        }, 3200);

        return () => {
            clearTimeout(mountTimer);
            clearTimeout(splashTimer);
        };
    }, []);

    return (
        <SafeAreaProvider>
            <GestureHandlerRootView style={styles.gestureHandler}>
                <AntdProvider theme={antdTheme}>
                    <QueryClientProvider client={queryClient}>
                        <ErrorBoundary>
                            <TabBarVisibilityProvider>
                                <NavigationContainer theme={AppTheme}>
                                    {appReady ? (
                                        <AppNavigator />
                                    ) : (
                                        <View style={styles.placeholder} />
                                    )}
                                </NavigationContainer>
                            </TabBarVisibilityProvider>
                        </ErrorBoundary>
                    </QueryClientProvider>
                </AntdProvider>
            </GestureHandlerRootView>

            <SplashScreen visible={showSplash} />
            {!showSplash && <BiometricLockScreen visible={isLocked} onUnlock={handleUnlock} />}
            <NetworkStatusModal />
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    gestureHandler: {
        flex: 1,
    },
    placeholder: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
});
