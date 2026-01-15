/**
 * @file types.ts
 * @description Navigation Types - Type-safe navigation
 * @author Kindy
 * @created 2025-11-16
 */
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { RouteProp } from '@react-navigation/native';

// Root Stack - Main navigation structure
export type RootStackParamList = {
    Auth: undefined;
    Main: undefined;

    // Feature Stacks
    FarmStack: undefined;
    ControlStack: undefined;
    MaterialStack: undefined;

    // Legacy or Direct Routes (consider moving to feature stacks)
    FarmDetail: { id: string };
    PondDetail: { pond: any }; // Changed to allow passing full object or ID, consistent with current app flow
    CreateFarm: { updatedLocation?: { latitude: number; longitude: number } } | undefined;
    CreatePond: undefined;
    CreateQuickFarm: undefined;
    MapEditor: { latitude?: number; longitude?: number };
};

// Auth Stack
export type AuthStackParamList = {
    Intro: undefined;
    Onboarding: undefined;
    Login: undefined;
    'Verify-otp': { method: string; contact: string; otpCode?: string };
    Test: undefined;
    Register: { phoneNumber: string };
    'Create-password': undefined;
    'Register-Success': undefined;
    DeleteAccount: undefined;
};

// Type alias for Verify OTP parameters
export type VerifyOtpParams = {
    method: string;
    contact: string;
};

// Main Tab
export type MainTabParamList = {
    Management: undefined;
    Reports: undefined;
    Devices: undefined;
    Help: undefined;
    Settings: undefined;
};

// Navigation Props
export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;
export type AuthStackNavigationProp = NativeStackNavigationProp<AuthStackParamList>;
export type MainTabNavigationProp = BottomTabNavigationProp<MainTabParamList>;

// Route Props
export type FarmDetailRouteProp = RouteProp<RootStackParamList, 'FarmDetail'>;
export type PondDetailRouteProp = RouteProp<RootStackParamList, 'PondDetail'>;
