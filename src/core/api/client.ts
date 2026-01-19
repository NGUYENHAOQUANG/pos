/**
 * @file client.ts
 * @description API Client - Axios instance with interceptors
 * @author Kindy
 * @created 2025-11-16
 */
import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { ENV } from '@/core/config/env';

// Import store for token access
import { useAuthStore } from '@/features/auth/store/authStore';
import { authApi } from '@/features/auth/api/authApi';

export const apiClient: AxiosInstance = axios.create({
    baseURL: ENV.API_URL,
    timeout: ENV.API_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Flag to prevent infinite refresh loops
let isRefreshing = false;

let failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (error?: any) => void;
    config: InternalAxiosRequestConfig;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(({ resolve, reject, config }) => {
        if (token) {
            // Update config with new token and retry
            if (config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            resolve(apiClient(config));
        } else {
            reject(error);
        }
    });
    failedQueue = [];
};

// Check if response has Unauthorized in data (even if status is 200)
const checkUnauthorizedResponse = (response: AxiosResponse): Error | null => {
    if (response.data && typeof response.data === 'object' && response.data.result === false) {
        const message = response.data.message || '';
        if (
            message.toLowerCase().includes('unauthorized') ||
            message.toLowerCase().includes('unauthenticated')
        ) {
            const error: any = new Error(message || 'Unauthorized');
            error.response = {
                ...response,
                status: 401,
                statusText: 'Unauthorized',
            };
            error.config = response.config;
            return error;
        }
    }
    return null;
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

// Handle token refresh when 401 error occurs
const handleTokenRefresh = async (
    originalRequest: InternalAxiosRequestConfig & { _retry?: boolean }
): Promise<any> => {
    // Skip refresh for auth endpoints
    if (isAuthEndpoint(originalRequest.url)) {
        useAuthStore.getState().logout();
        return Promise.reject(new Error('Unauthorized on auth endpoint'));
    }

    // If already refreshing, queue this request
    if (isRefreshing) {
        return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject, config: originalRequest });
        });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = useAuthStore.getState().refreshToken;
    if (!refreshToken) {
        if (!useAuthStore.getState().isSessionExpired && useAuthStore.getState().isAuthenticated) {
            useAuthStore.getState().setSessionExpired(true);
        }
        isRefreshing = false;
        processQueue(new Error('No refresh token'), null);
        return Promise.reject(new Error('No refresh token available'));
    }

    try {
        const response = await authApi.refreshToken(refreshToken);

        if (response.result && response.data.accessToken && response.data.refreshToken) {
            const {
                accessToken,
                refreshToken: newRefreshToken,
                accessTokenExpires,
            } = response.data;

            // Update tokens in store
            useAuthStore.getState().setTokens(accessToken, newRefreshToken, accessTokenExpires);

            // Update the original request with new token
            if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            }

            // Process queued requests
            processQueue(null, accessToken);
            isRefreshing = false;

            // Retry the original request
            return apiClient(originalRequest);
        } else {
            throw new Error('Invalid refresh token response');
        }
    } catch (refreshError) {
        if (!useAuthStore.getState().isSessionExpired && useAuthStore.getState().isAuthenticated) {
            useAuthStore.getState().setSessionExpired(true);
        }
        isRefreshing = false;
        processQueue(refreshError, null);
        console.log('Refresh token error:', refreshError);
        return Promise.reject(refreshError);
    }
};

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Get token from store
        const token = useAuthStore.getState().token;
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors and refresh token
apiClient.interceptors.response.use(
    async (response: AxiosResponse) => {
        const unauthorizedError = checkUnauthorizedResponse(response);
        if (unauthorizedError) {
            const originalRequest = response.config as InternalAxiosRequestConfig & {
                _retry?: boolean;
            };
            if (!originalRequest._retry && !isAuthEndpoint(originalRequest.url)) {
                return handleTokenRefresh(originalRequest);
            }
            return Promise.reject(unauthorizedError);
        }
        return response;
    },
    async error => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Handle 401 - Unauthorized
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !isAuthEndpoint(originalRequest.url)
        ) {
            return handleTokenRefresh(originalRequest);
        }

        // Handle network errors
        if (!error.response) {
            error.message = 'Network error. Please check your connection.';
        }

        return Promise.reject(error);
    }
);
