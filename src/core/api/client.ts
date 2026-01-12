/**
 * @file client.ts
 * @description API Client - Axios instance with interceptors
 * @author Kindy
 * @created 2025-11-16
 */
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ENV } from '@/core/config/env';

// Import store for token access (will be set up later)
import { useAuthStore } from '@/features/auth/store/authStore';

export const apiClient: AxiosInstance = axios.create({
    baseURL: ENV.API_URL,
    timeout: ENV.API_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
    (config: any) => {
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

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    error => {
        // Handle 401 - Unauthorized
        if (error.response?.status === 401) {
            console.log('[API] 401 Unauthorized - Triggering Logout');
            // Logout user
            useAuthStore.getState().logout();
        }

        // Handle network errors
        if (!error.response) {
            error.message = 'Network error. Please check your connection.';
        }

        return Promise.reject(error);
    }
);
