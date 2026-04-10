/**
 * @file providers.tsx
 * @description App Providers - Wrapper for all providers
 * @author Kindy
 * @created 2025-11-16
 */
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { useAppTheme } from '@/styles/themeContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { Provider as AntdProvider } from '@ant-design/react-native';
import { AppNavigator } from './navigation/AppNavigator';
import { navigationRef } from '@/app/navigation/NavigationRef';
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

export function AppProviders() {
    const [showSplash, setShowSplash] = useState(true);
    // Defer heavy navigator mount until splash animation is nearly done
    const [appReady, setAppReady] = useState(false);
    const { isLocked, handleUnlock } = useBiometricLock();
    const themeColors = useAppTheme();

    const AppTheme = {
        ...(themeColors.isDark ? DarkTheme : DefaultTheme),
        colors: {
            ...(themeColors.isDark ? DarkTheme.colors : DefaultTheme.colors),
            background: themeColors.backgroundPrimary,
            primary: themeColors.primary,
            card: themeColors.background,
            text: themeColors.text,
            border: themeColors.border,
            notification: themeColors.error,
        },
    };

    useEffect(() => {
        // Mount navigator just before splash fades — FadeOut (500ms) masks the mount lag
        const readyTimer = setTimeout(() => {
            setAppReady(true);
        }, 2800);

        // Hide splash after navigator starts mounting
        const splashTimer = setTimeout(() => {
            setShowSplash(false);
        }, 3200);

        return () => {
            clearTimeout(readyTimer);
            clearTimeout(splashTimer);
        };
    }, []);

    return (
        <SafeAreaProvider>
            <GestureHandlerRootView style={styles.gestureHandler}>
                <KeyboardProvider navigationBarTranslucent>
                    <AntdProvider theme={antdTheme}>
                        <QueryClientProvider client={queryClient}>
                            <ErrorBoundary>
                                <TabBarVisibilityProvider>
                                    <NavigationContainer ref={navigationRef} theme={AppTheme}>
                                        {appReady ? <AppNavigator /> : null}
                                    </NavigationContainer>
                                </TabBarVisibilityProvider>
                            </ErrorBoundary>
                        </QueryClientProvider>
                    </AntdProvider>
                </KeyboardProvider>
                {!showSplash && <BiometricLockScreen visible={isLocked} onUnlock={handleUnlock} />}
            </GestureHandlerRootView>

            <SplashScreen visible={showSplash} />

            <NetworkStatusModal />
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    gestureHandler: {
        flex: 1,
    },
});
