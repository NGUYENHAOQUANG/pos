/**
 * @file providers.tsx
 * @description App Providers - Wrapper for all providers
 * @author Kindy
 * @created 2025-11-16
 */
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
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
import NetInfo from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            retry: 3,
            refetchOnReconnect: true,
        },
    },
});

// Update React Query online status using NetInfo
onlineManager.setEventListener(setOnline => {
    return NetInfo.addEventListener(state => {
        const isConnected = !!state.isConnected;
        setOnline(isConnected);

        // Force refetch all active queries when connection is restored
        // This ensures the app tries to download data immediately when network returns
        if (isConnected) {
            queryClient.invalidateQueries();
        }
    });
});

const AppTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        background: '#FFFFFF',
    },
};

export function AppProviders() {
    const [showSplash, setShowSplash] = useState(true);

    useEffect(() => {
        // Auto-hide splash screen after 2.5 seconds
        const timer = setTimeout(() => {
            setShowSplash(false);
        }, 2500);

        return () => clearTimeout(timer);
    }, []);

    return (
        <SafeAreaProvider>
            <GestureHandlerRootView style={styles.gestureHandler}>
                <AntdProvider theme={antdTheme}>
                    <QueryClientProvider client={queryClient}>
                        <ErrorBoundary>
                            <TabBarVisibilityProvider>
                                <NavigationContainer theme={AppTheme}>
                                    <AppNavigator />
                                </NavigationContainer>
                            </TabBarVisibilityProvider>
                        </ErrorBoundary>
                    </QueryClientProvider>
                </AntdProvider>
            </GestureHandlerRootView>

            {/* Splash Screen overlay - outside navigation stack, prevents back navigation */}
            <SplashScreen visible={showSplash} />

            {/* Network Status Modal - monitors connection globally */}
            <NetworkStatusModal />
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    gestureHandler: {
        flex: 1,
    },
});
