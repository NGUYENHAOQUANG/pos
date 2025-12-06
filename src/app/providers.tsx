/**
 * @file providers.tsx
 * @description App Providers - Wrapper for all providers
 * @author Kindy
 * @created 2025-11-16
 */
import React from 'react';
import { StyleSheet } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as AntdProvider } from '@ant-design/react-native';
import { AppNavigator } from './navigation/AppNavigator';
import { antdTheme } from '../core/config/antd-theme';
import { TabBarVisibilityProvider } from './navigation/TabBarVisibilityContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 3,
    },
  },
});

export function AppProviders() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.gestureHandler}>
        <AntdProvider theme={antdTheme}>
          <QueryClientProvider client={queryClient}>
            <TabBarVisibilityProvider>
              <NavigationContainer>
                <AppNavigator />
              </NavigationContainer>
            </TabBarVisibilityProvider>
          </QueryClientProvider>
        </AntdProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  gestureHandler: {
    flex: 1,
  },
});
