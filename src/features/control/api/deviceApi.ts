import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';

export interface ToggleDeviceRequest {
    deviceId: string;
    deviceName: string;
    internalDeviceId: number;
    value: number; // 0 or 1
    message?: string;
}

export const deviceApi = {
    toggleDevice: (payload: ToggleDeviceRequest) => {
        return apiClient.post(API_ENDPOINTS.DEVICE.TOGGLE, payload);
    },
};
