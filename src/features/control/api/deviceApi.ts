import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';

// Request Interface
export interface ToggleDeviceRequest {
    deviceId: string;
}

// Response Interface
export interface DeviceItem {
    id: string;
    deviceCode: string;
    deviceType: 'Syphon' | 'Feeder' | 'AirBlower' | 'PaddleWheel';
    name: string;
    deviceHubName: string;
    connectionStatus: 'On' | 'Off' | 'Disconnect';
    installationStatus: string;
    no: number;
}

export const deviceApi = {
    toggleDevice: (payload: ToggleDeviceRequest) => {
        return apiClient.patch(API_ENDPOINTS.DEVICE.TOGGLE, null, {
            params: {
                id: payload.deviceId,
            },
        });
    },
    getDevices: () => {
        return apiClient.get<{ data: { items: DeviceItem[] } }>(API_ENDPOINTS.DEVICE.LIST);
    },
};
