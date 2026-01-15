import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from './types';
import { IntroScreen } from '@/features/onboarding/screens/IntroScreen';
import OnboardingScreen from '@/features/onboarding/screens/OnboardingScreen';
import AuthScreen from '@/features/auth/screens/AuthScreen';
import VerifyOtpScreen from '@/features/auth/screens/VerifyOtpScreen';
import { DeleteAccountScreen } from '@/features/auth/screens/DeleteAccountScreen';
import RegisterScreen from '@/features/auth/screens/RegisterScreen';

// import TestScreen from '@/features/test/screens/TestScreen';
const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
    return (
        <Stack.Navigator
            initialRouteName="Intro"
            screenOptions={{
                headerShown: false,
                headerStyle: {
                    backgroundColor: '#fff',
                },
                headerTintColor: '#333',
                headerTitleStyle: {
                    fontWeight: '600',
                },
                headerBackTitle: 'Back',
            }}
        >
            <Stack.Screen name="Intro" component={IntroScreen} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Verify-otp" component={VerifyOtpScreen} />
            <Stack.Screen name="Login" component={AuthScreen} />
            <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
    );
}
