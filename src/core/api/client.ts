/**
 * @file client.ts
 * @description API Client - Axios instance with interceptors
 * @author Kindy
 * @created 2025-11-16
 */
import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { ENV } from '@/core/config/env';
import { isTokenExpiringSoon } from '@/core/utils/jwt';

// Import store for token access
import { useAuthStore } from '@/features/auth/store/authStore';
import { authApi } from '@/features/auth/api/authApi';
import { normalizeApiError } from '@/core/api/errorHandler';

export const apiClient: AxiosInstance = axios.create({
    baseURL: ENV.API_URL,
    timeout: ENV.API_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Flag to prevent infinite refresh loops
let isRefreshing = false;

// Queue for pending requests during token refresh
let failedQueue: Array<{
    resolve: (config: InternalAxiosRequestConfig) => void;
    reject: (error: any) => void;
    config: InternalAxiosRequestConfig;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(({ resolve, reject, config }) => {
        if (token) {
            // Update config with new token
            if (config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            resolve(config);
        } else {
            reject(error);
        }
    });
    failedQueue = [];
};

// Check if endpoint is auth endpoint
const isAuthEndpoint = (url: string | undefined): boolean => {
    if (!url) return false;
    return (
        url.includes('/auth/refresh-token') ||
        url.includes('/auth/login') ||
        url.includes('/auth/verify-otp') ||
        false
    );
};

// Handle token refresh
const handleTokenRefresh = async (): Promise<string | null> => {
    isRefreshing = true;

    const refreshToken = useAuthStore.getState().refreshToken;
    if (!refreshToken) {
        if (!useAuthStore.getState().isSessionExpired && useAuthStore.getState().isAuthenticated) {
            useAuthStore.getState().setSessionExpired(true);
        }
        isRefreshing = false;
        processQueue(new Error('No refresh token'), null);
        return null;
    }

    try {
        const response = await authApi.refreshToken(refreshToken);

        if (response.success && response.data?.accessToken && response.data?.refreshToken) {
            const {
                accessToken,
                refreshToken: newRefreshToken,
                accessTokenExpiresAt,
            } = response.data;

            const expiresAt = accessTokenExpiresAt;

            // Update tokens in store
            useAuthStore.getState().setTokens(accessToken, newRefreshToken, expiresAt);

            // Process queued requests with new token
            processQueue(null, accessToken);
            isRefreshing = false;

            return accessToken;
        } else {
            throw new Error('Invalid refresh token response');
        }
    } catch (refreshError) {
        if (!useAuthStore.getState().isSessionExpired && useAuthStore.getState().isAuthenticated) {
            useAuthStore.getState().setSessionExpired(true);
        }
        isRefreshing = false;
        processQueue(refreshError, null);
        return null;
    }
};

// Request interceptor - Add auth token and handle expiration
apiClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        if (isAuthEndpoint(config.url)) {
            return config;
        }

        const authStore = useAuthStore.getState();
        const token = authStore.token;
        const accessTokenExpires = authStore.accessTokenExpires;

        // If we have a token (authenticated), checking validity
        if (token) {
            // Check if token is expired or about to expire
            if (isTokenExpiringSoon(accessTokenExpires)) {
                if (!isRefreshing) {
                    handleTokenRefresh();
                }

                // Add current request to queue immediately
                // It will be processed when handleTokenRefresh completes
                return new Promise<InternalAxiosRequestConfig>((resolve, reject) => {
                    failedQueue.push({ resolve, reject, config });
                });
            }

            if (config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }

        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// Response interceptor - Just handle network errors, 401 removed as requested
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    async error => {
        return Promise.reject(normalizeApiError(error));
    }
);
