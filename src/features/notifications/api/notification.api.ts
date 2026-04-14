/**
 * @file notification.api.ts
 * @description API calls for notifications and FCM device token registration
 */
import { apiClient } from '@/core/api/client';
import { Platform } from 'react-native';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import { IApiResponse, IPaginate } from '@/shared/types/common.types';
import { GetNotificationsParams, INotification, DevicePlatform } from '../types/notification.types';

interface RegisterDeviceTokenPayload {
    fcmToken: string;
    platform: DevicePlatform;
}

export const notificationApi = {
    registerDeviceToken: async (fcmToken: string): Promise<IApiResponse<null>> => {
        const payload: RegisterDeviceTokenPayload = {
            fcmToken,
            platform: Platform.OS === 'ios' ? DevicePlatform.iOS : DevicePlatform.Android,
        };

        const { data } = await apiClient.post<IApiResponse<null>>(
            API_ENDPOINTS.NOTIFICATION.DEVICE_TOKEN,
            payload
        );
        return data;
    },

    getNotifications: async (
        params?: GetNotificationsParams
    ): Promise<IApiResponse<IPaginate<INotification>>> => {
        const { data } = await apiClient.get<IApiResponse<IPaginate<INotification>>>(
            API_ENDPOINTS.NOTIFICATION.LIST,
            { params }
        );
        return data;
    },

    markAsRead: async (id: string): Promise<IApiResponse<null>> => {
        const { data } = await apiClient.patch<IApiResponse<null>>(
            API_ENDPOINTS.NOTIFICATION.READ(id)
        );
        return data;
    },
};

export const { registerDeviceToken, markAsRead } = notificationApi;
