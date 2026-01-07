/**
 * @file AppNavigator.tsx
 * @description App Navigator - Main navigation structure for shrimp farm management
 * @author Kindy
 * @created 2025-11-16
 * @updated 2025-01-07
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthNavigator } from './AuthNavigator';
import { AppStack } from './AppStack';
import { useAuthStore } from '@/features/auth/store/authStore';
import { CreateBreedingAreaScreen, MapEditorScreen } from '@/features/management';

// Root level param list (Auth + Main sections)
type RootParamList = {
    Auth: undefined;
    Main: undefined;
    CreateFarm: { updatedLocation?: { latitude: number; longitude: number } } | undefined;
    MapEditor: { latitude?: number; longitude?: number };
};

const Stack = createNativeStackNavigator<RootParamList>();

export function AppNavigator() {
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);

    return (
        <Stack.Navigator
            initialRouteName="Auth"
            screenOptions={{
                headerShown: false,
            }}
        >
            {isAuthenticated ? (
                <>
                    <Stack.Screen name="Main" component={AppStack} />
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
