/**
 * @file deviceTokenApi.ts
 * @description API calls for FCM device token registration with the backend
 */
import { apiClient } from '@/core/api/client';
import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';

interface RegisterDeviceTokenPayload {
    token: string;
    platform: 'ios' | 'android';
    deviceId: string;
    deviceName: string;
}

interface ApiResponse {
    success: boolean;
    message?: string;
}

/**
 * Register FCM token with the backend server
 * @param fcmToken - The FCM device token
 */
export async function registerDeviceToken(fcmToken: string): Promise<ApiResponse> {
    try {
        const payload: RegisterDeviceTokenPayload = {
            token: fcmToken,
            platform: Platform.OS as 'ios' | 'android',
            deviceId: await DeviceInfo.getUniqueId(),
            deviceName: await DeviceInfo.getDeviceName(),
        };

        // TODO: Update endpoint when backend API is ready
        const response = await apiClient.post<ApiResponse>('/api/device-tokens/register', payload);

        return response.data;
    } catch (error) {
        console.error('[DeviceToken] Failed to register token:', error);
        return { success: false, message: 'Failed to register device token' };
    }
}

/**
 * Unregister FCM token from the backend (call on logout)
 * @param fcmToken - The FCM device token to remove
 */
export async function unregisterDeviceToken(fcmToken: string): Promise<ApiResponse> {
    try {
        const deviceId = await DeviceInfo.getUniqueId();

        // TODO: Update endpoint when backend API is ready
        const response = await apiClient.post<ApiResponse>('/api/device-tokens/unregister', {
            token: fcmToken,
            deviceId,
        });

        return response.data;
    } catch (error) {
        console.error('[DeviceToken] Failed to unregister token:', error);
        return { success: false, message: 'Failed to unregister device token' };
    }
}
