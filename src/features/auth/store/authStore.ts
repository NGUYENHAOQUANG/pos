/**
 * @file authStore.ts
 * @description Auth Store - Zustand
 * @author Kindy
 * @created 2025-11-16
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Storage } from '@/core/services/storage.service';
import { authApi } from '@/features/auth/api/authApi';
import { decodeToken } from '@/core/utils/jwt';
import { useNotificationStore } from '@/features/notifications/store/notificationStore';
import {
    AuthUser,
    LoginCredentials,
    RegisterData,
    CompleteProfilePayload,
    UserProfileData,
} from '@/features/auth/types/auth.types';
import { NormalizedError } from '@/core/api/errorHandler';

interface AuthState {
    user: AuthUser | null;
    token: string | null;
    refreshToken: string | null;
    accessTokenExpires: string | null; // ISO string from API
    isAuthenticated: boolean;
    loading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    verifyOtp: (contact: string, otpCode: string) => Promise<string | undefined>; // Return string (status) or undefined
    register: (data: RegisterData) => Promise<any>;
    logout: () => void;
    setUser: (user: AuthUser | null) => void;
    setToken: (token: string | null) => void;
    setRefreshToken: (refreshToken: string | null) => void;
    setTokens: (
        token: string | null,
        refreshToken: string | null,
        accessTokenExpires?: string | null
    ) => void;
    isSessionExpired: boolean;
    setSessionExpired: (value: boolean) => void;
    hasLaunched: boolean;
    setHasLaunched: (value: boolean) => void;
    // New action
    // New action
    completeProfile: (data: CompleteProfilePayload) => Promise<void>;
    // Profile Management
    userProfile: UserProfileData | null;
    updateUserProfile: (data: Partial<UserProfileData>) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            refreshToken: null,
            accessTokenExpires: null,
            isAuthenticated: false,
            isSessionExpired: false,
            loading: false,
            hasLaunched: false,
            userProfile: null,

            login: async (credentials: LoginCredentials) => {
                set({ loading: true });
                try {
                    const response = await authApi.login(credentials);

                    if (response.success && response.data.accessToken) {
                        const token = response.data.accessToken;
                        const refreshToken = response.data.refreshToken;
                        const accessTokenExpires = response.data.accessTokenExpiresAt;
                        // Decode token to get user info
                        const decoded = decodeToken(token);

                        // Map decoded token to AuthUser. Adjust fields based on actual token payload
                        const user: AuthUser = {
                            id: decoded?.sub || decoded?.id || 'unknown',
                            name: decoded?.name || decoded?.unique_name || 'User',
                            phone: decoded?.phone || credentials.username, // Fallback to username
                            roles: decoded?.role || decoded?.roles,
                        };

                        set({
                            user,
                            token,
                            refreshToken,
                            accessTokenExpires,
                            isAuthenticated: true,
                            loading: false,
                        });
                    } else {
                        throw new Error(response.message || 'Login failed');
                    }
                } catch (error) {
                    set({ loading: false });
                    throw error;
                }
            },

            verifyOtp: async (contact: string, otpCode: string) => {
                set({ loading: true });
                try {
                    const response = await authApi.verifyOtp(contact, otpCode);

                    if (response.success && response.data.accessToken) {
                        const token = response.data.accessToken;
                        const refreshToken = response.data.refreshToken;
                        const accessTokenExpires = response.data.accessTokenExpiresAt;
                        const loginStatus = response.data.loginStatus;

                        // Decode token to get user info
                        const decoded = decodeToken(token);

                        const user: AuthUser = {
                            id: response.data.userId || decoded?.sub || decoded?.id || 'unknown',
                            name:
                                response.data.fullName ||
                                decoded?.name ||
                                decoded?.unique_name ||
                                'User',
                            phone: response.data.phoneNumber || decoded?.phone || contact,
                            roles: decoded?.role || decoded?.roles,
                            loginStatus: loginStatus, // Add login status to user
                        };
                        set({
                            user,
                            token,
                            refreshToken,
                            accessTokenExpires,
                            isAuthenticated: loginStatus !== 'REQUIRE_UPDATE_PROFILE', // Only authenticated if profile complete
                            loading: false,
                        });

                        return loginStatus;
                    } else {
                        throw new Error(response.message || 'OTP Verification failed');
                    }
                } catch (error) {
                    set({ loading: false });
                    throw error;
                }
            },

            register: async (data: RegisterData) => {
                set({ loading: true });
                try {
                    const response = await authApi.register({ phoneNumber: data.phone });

                    if (response.success || response.result) {
                        set({ loading: false });
                    } else {
                        throw new Error(response.message || 'Register failed');
                    }
                    return response;
                } catch (error) {
                    set({ loading: false });
                    throw error;
                }
            },

            logout: async () => {
                const refreshToken = get().refreshToken;
                const fcmToken = useNotificationStore.getState().fcmToken;
                useNotificationStore.getState().resetNotificationState();

                set({
                    user: null,
                    token: null,
                    refreshToken: null,
                    accessTokenExpires: null,
                    isAuthenticated: false,
                    isSessionExpired: false,
                    userProfile: null,
                });

                try {
                    if (refreshToken) {
                        await authApi.logout({
                            refreshToken,
                            logoutAllDevices: false,
                            fcmToken: fcmToken || undefined,
                        });
                    }
                } catch (error) {
                    console.error('Logout API failed:', error);
                }
            },

            setUser: (user: AuthUser | null) => {
                set({ user, isAuthenticated: !!user });
            },

            setToken: (token: string | null) => {
                set({ token });
            },

            setRefreshToken: (refreshToken: string | null) => {
                set({ refreshToken });
            },

            setTokens: (
                token: string | null,
                refreshToken: string | null,
                accessTokenExpires?: string | null
            ) => {
                set({ token, refreshToken, accessTokenExpires: accessTokenExpires ?? null });
            },

            setHasLaunched: (value: boolean) => {
                set({ hasLaunched: value });
            },

            setSessionExpired: (value: boolean) => {
                set({ isSessionExpired: value });
            },

            completeProfile: async (data: CompleteProfilePayload) => {
                set({ loading: true });
                try {
                    await authApi.completeProfile(data);
                    set(state => ({
                        loading: false,
                        isAuthenticated: true,
                        user: state.user
                            ? {
                                  ...state.user,
                                  name: data.fullName,
                                  email: data.email || state.user.email,
                                  avatar: data.avatarUrl || state.user.avatar,
                                  loginStatus: 'COMPLETED',
                              }
                            : null,
                    }));
                } catch (error) {
                    set({ loading: false });
                    console.log(error);
                    throw error as NormalizedError;
                }
            },

            updateUserProfile: (data: Partial<UserProfileData>) => {
                set(state => ({
                    userProfile: state.userProfile
                        ? { ...state.userProfile, ...data }
                        : (data as UserProfileData),
                }));
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => Storage),
        }
    )
);
