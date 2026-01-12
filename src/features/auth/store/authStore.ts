/**
 * @file authStore.ts
 * @description Auth Store - Zustand
 * @author Kindy
 * @created 2025-11-16
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Storage } from '@/core/services/storage.service';
import { authApi } from '../api/authApi';
import { decodeToken } from '@/core/utils/jwt';
import { AuthUser, LoginCredentials, RegisterData } from '../types/auth.types';

interface AuthState {
    user: AuthUser | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    verifyOtp: (contact: string, otpCode: string) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => void;
    setUser: (user: AuthUser | null) => void;
    setToken: (token: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        set => ({
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false,

            login: async (credentials: LoginCredentials) => {
                set({ loading: true });
                try {
                    const response = await authApi.login(credentials);

                    if (response.result && response.data.accessToken) {
                        const token = response.data.accessToken;
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

                    if (response.result && response.data.accessToken) {
                        const token = response.data.accessToken;
                        // Decode token to get user info
                        const decoded = decodeToken(token);

                        const user: AuthUser = {
                            id: decoded?.sub || decoded?.id || 'unknown',
                            name: decoded?.name || decoded?.unique_name || 'User',
                            phone: decoded?.phone || contact,
                            roles: decoded?.role || decoded?.roles,
                        };

                        set({
                            user,
                            token,
                            isAuthenticated: true,
                            loading: false,
                        });
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
                    // Demo: Mock register - không call API
                    // Tạo mock user với phone
                    const mockUser: AuthUser = {
                        id: '1',
                        phone: data.phone,
                        name: data.name,
                    };
                    const mockToken = 'mock-token-' + Date.now();

                    set({
                        user: mockUser,
                        token: mockToken,
                        isAuthenticated: true,
                        loading: false,
                    });
                } catch (error) {
                    set({ loading: false });
                    throw error;
                }
            },

            logout: async () => {
                try {
                    await authApi.logout();
                } catch (error) {
                    console.error('Logout API failed:', error);
                } finally {
                    set({
                        user: null,
                        token: null,
                        isAuthenticated: false,
                    });
                }
            },

            setUser: (user: AuthUser | null) => {
                set({ user, isAuthenticated: !!user });
            },

            setToken: (token: string | null) => {
                set({ token });
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => Storage),
            onRehydrateStorage: () => state => {
                console.log('[AuthStore] Hydration start');
                if (state) {
                    console.log(
                        '[AuthStore] Hydration finished. Is Authenticated:',
                        state.isAuthenticated
                    );
                    console.log('[AuthStore] Token restored:', state.token ? 'Yes' : 'No (Null)');
                } else {
                    console.log('[AuthStore] Hydration failed or state is null');
                }
            },
        }
    )
);
