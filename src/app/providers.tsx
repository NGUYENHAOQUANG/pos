/**
 * @file providers.tsx
 * @description App Providers - Wrapper for all providers
 * @author Kindy
 * @created 2025-11-16
 */
import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
    KeyboardAvoidingViewProps,
} from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as AntdProvider } from '@ant-design/react-native';
import { AppNavigator } from './navigation/AppNavigator';
import { antdTheme } from '../core/config/antd-theme';
import { TabBarVisibilityProvider } from './navigation/TabBarVisibilityContext';
import { SplashScreen } from '@/shared/components/layout/SplashScreen';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            retry: 3,
        },
    },
});

export function AppProviders() {
    const [showSplash, setShowSplash] = useState(true);

    const defaultBehavior: KeyboardAvoidingViewProps['behavior'] =
        Platform.OS === 'ios' ? 'padding' : 'height';
    const [keyboardBehavior, setKeyboardBehavior] =
        useState<KeyboardAvoidingViewProps['behavior']>(defaultBehavior);

    useEffect(() => {
        // Auto-hide splash screen after 2.5 seconds
        const timer = setTimeout(() => {
            setShowSplash(false);
        }, 2500);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        // Only apply keyboard fix on Android
        if (Platform.OS !== 'android') return;

        const showListener = Keyboard.addListener('keyboardDidShow', () => {
            setKeyboardBehavior(defaultBehavior);
        });
        const hideListener = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardBehavior(undefined);
        });

        return () => {
            showListener.remove();
            hideListener.remove();
        };
    }, [defaultBehavior]);

    return (
        <SafeAreaProvider>
            <GestureHandlerRootView style={styles.gestureHandler}>
                <KeyboardAvoidingView behavior={keyboardBehavior} style={styles.keyboardView}>
                    <AntdProvider theme={antdTheme}>
                        <QueryClientProvider client={queryClient}>
                            <TabBarVisibilityProvider>
                                <NavigationContainer>
                                    <AppNavigator />
                                </NavigationContainer>
                            </TabBarVisibilityProvider>
                        </QueryClientProvider>
                    </AntdProvider>
                </KeyboardAvoidingView>
            </GestureHandlerRootView>

            {/* Splash Screen overlay - outside navigation stack, prevents back navigation */}
            <SplashScreen visible={showSplash} />
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    gestureHandler: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
});
