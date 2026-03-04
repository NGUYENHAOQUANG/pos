import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from './types';
import { IntroScreen } from '@/features/onboarding/screens/IntroScreen';
import OnboardingScreen from '@/features/onboarding/screens/OnboardingScreen';
import AuthScreen from '@/features/auth/screens/AuthScreen';
import VerifyOtpScreen from '@/features/auth/screens/VerifyOtpScreen';
import { DeleteAccountFormScreen } from '@/features/menu/screens/deleteAcount/DeleteAccountFormScreen';
import RegisterScreen from '@/features/auth/screens/RegisterScreen';
import InfoScreen from '@/features/auth/screens/InfoScreen';

// import TestScreen from '@/features/test/screens/TestScreen';
const Stack = createNativeStackNavigator<AuthStackParamList>();

import { useAuthStore } from '@/features/auth/store/authStore';
import { colors } from '@/styles';

export function AuthNavigator() {
    const hasLaunched = useAuthStore(state => state.hasLaunched);

    return (
        <Stack.Navigator
            initialRouteName={hasLaunched ? 'Login' : 'Intro'}
            screenOptions={{
                headerShown: false,
                headerStyle: {
                    backgroundColor: colors.white,
                },
                headerTintColor: colors.black,
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
            <Stack.Screen name="Info" component={InfoScreen} />
            <Stack.Screen name="DeleteAccount" component={DeleteAccountFormScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
    );
}
