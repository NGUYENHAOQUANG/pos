import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import { IApiResponse, IPaginate } from '@/shared/types/common.types';

// ===== Response Interfaces =====

/** Single camera item from GET /camera */
export interface CameraItem {
    deviceSn: string;
    name: string;
    status: string;
    ipAddress: string;
    modelCode: string;
}

/** Camera stream data from GET /camera/{sn}/stream */
export interface CameraStreamData {
    deviceSn: string;
    modelCode: string;
    protocol: string;
    url: string;
}

/** API response wrapper for camera list */
export type CameraListResponse = IApiResponse<IPaginate<CameraItem>>;

/** API response wrapper for camera stream */
export interface CameraStreamResponse {
    success: boolean;
    data: CameraStreamData;
    message: string;
    errorCode: string | null;
}

// ===== API Methods =====

export const cameraApi = {
    /** Get all cameras */
    getList: () => {
        return apiClient.get<CameraListResponse>(API_ENDPOINTS.CAMERA.LIST);
    },

    /** Get stream URL for a specific camera by serial number */
    getStream: (sn: string) => {
        return apiClient.get<CameraStreamResponse>(API_ENDPOINTS.CAMERA.STREAM(sn));
    },
};
