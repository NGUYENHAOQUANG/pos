/**
 * @file AppNavigator.tsx
 * @description App Navigator - Main navigation structure for shrimp farm management
 * @author Kindy
 * @created 2025-11-16
 */
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {RootStackParamList} from './types';
import {AuthNavigator} from './AuthNavigator';
import {MainNavigator} from './MainNavigator';
import {useAuthStore} from '@/features/auth/store/authStore';
import {CreateBreedingAreaScreen, MapEditorScreen} from '@/features/management';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  return (
    <Stack.Navigator
      initialRouteName="Auth"
      screenOptions={{
        headerShown: false,
      }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Main" component={MainNavigator} />
          <Stack.Screen
            name="CreateFarm"
            component={CreateBreedingAreaScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="MapEditor"
            component={MapEditorScreen}
            options={{
              headerShown: false,
              presentation: 'fullScreenModal',
            }}
          />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}
