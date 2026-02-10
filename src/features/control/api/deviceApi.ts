import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';

// Request Interfaces
export interface ToggleDeviceRequest {
    deviceId: string;
}

export interface CreateScheduleRequest {
    deviceId: string;
    startTime: string;
    endtime: string;
}

export interface ScheduleResponse {
    success: boolean;
    data: {
        success: boolean;
        status: number;
        payload: string;
        errorMessage: string | null;
        timestamp: string;
        scheduledStartTime: string;
    };
    message: string;
}

export interface GetScheduleResponse {
    success: boolean;
    data: {
        items: Array<{
            id: string;
            startTime: string;
            endTime: string;
            isActive: boolean;
            runDate: string;
            no: number;
        }>;
    };
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
        return apiClient.patch(API_ENDPOINTS.DEVICE.TOGGLE(payload.deviceId));
    },
    createSchedule: (payload: CreateScheduleRequest) => {
        return apiClient.post<ScheduleResponse>(API_ENDPOINTS.DEVICE.SCHEDULE, payload);
    },
    getSchedules: (deviceId: string) => {
        return apiClient.get<GetScheduleResponse>(API_ENDPOINTS.DEVICE.GET_SCHEDULES(deviceId));
    },
    getDevices: () => {
        return apiClient.get<{ data: { items: DeviceItem[] } }>(API_ENDPOINTS.DEVICE.LIST);
    },
};
