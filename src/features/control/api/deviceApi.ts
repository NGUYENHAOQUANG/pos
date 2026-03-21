import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';

// ===== Request Interfaces =====

export interface ToggleDeviceRequest {
    deviceId: string;
}

export interface CreateScheduleRequest {
    id?: string;
    deviceId: string;
    startTime: string;
    endtime: string;
    runTime: number;
    pauseTime: number;
}

// ===== Response Interfaces =====

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
            runTime: number;
            pauseTime: number;
        }>;
    };
}

/** Single device hub item from GET /deviceshub */
export interface DeviceHubItem {
    id: string;
    pondId: string;
    pondName: string;
    deviceHubCode: string;
    name: string;
    connectionStatus: string;
    isInstalled: boolean;
    no: number;
    creatorId: string;
    editorId: string | null;
    createdAt: string;
    editedAt: string;
    creator: string | null;
    editor: string | null;
}

/** Single device item from GET /device */
export interface DeviceItem {
    id: string;
    deviceCode: string;
    deviceType: 'Syphon' | 'Feeder' | 'AirBlower' | 'PaddleWheel' | 'Pump';
    name: string;
    deviceHubName: string;
    connectionStatus: 'On' | 'Off' | 'DisConnected' | 'Disconnect' | 'UnDefined';
    status: 'UnDefined' | 'On' | 'Off' | 'Fault';
    installationStatus: string;
    no: number;
    creatorId: string;
    editorId: string | null;
    createdAt: string;
    editedAt: string;
    creator: string | null;
    editor: string | null;
}

// ===== Health Check Interfaces =====

export interface DeviceHealthItem {
    deviceId: string;
    isHealthy: boolean;
    lastPingTime: string;
    secondsSinceLastPing: number;
}

export interface HealthCheckResponse {
    success: boolean;
    data: {
        ioTHubConnected: boolean;
        eventHubConnected: boolean;
        totalDevicesTracked: number;
        healthyDevices: number;
        unhealthyDevices: number;
        lastChecked: string;
        errors: string[];
        devices: DeviceHealthItem[];
    };
    message: string;
}

// ===== API Methods =====

export const deviceApi = {
    /** Toggle device on/off */
    toggleDevice: (payload: ToggleDeviceRequest) => {
        return apiClient.patch(API_ENDPOINTS.DEVICE.TOGGLE(payload.deviceId));
    },

    /** Create a schedule for a device */
    createSchedule: (payload: CreateScheduleRequest) => {
        return apiClient.post<ScheduleResponse>(API_ENDPOINTS.DEVICE.SCHEDULE, payload);
    },

    /** Get schedules for a device */
    getSchedules: (deviceId: string) => {
        return apiClient.get<GetScheduleResponse>(API_ENDPOINTS.DEVICE.GET_SCHEDULES(deviceId));
    },

    /** Get all devices */
    getDevices: () => {
        return apiClient.get<{ data: { items: DeviceItem[] } }>(API_ENDPOINTS.DEVICE.LIST);
    },

    /** Get all device hubs (linked to ponds) */
    getDeviceHubs: () => {
        return apiClient.get<{ data: { items: DeviceHubItem[] } }>(
            API_ENDPOINTS.DEVICE.DEVICES_HUB
        );
    },
    getHealthCheck: () => {
        return apiClient.get<HealthCheckResponse>(API_ENDPOINTS.DEVICE.HEALTH);
    },

    /** Delete a schedule time by ID */
    deleteSchedule: (scheduleTimeId: string) => {
        return apiClient.delete(API_ENDPOINTS.DEVICE.DELETE_SCHEDULE(scheduleTimeId));
    },
};
