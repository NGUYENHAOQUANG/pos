import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';

export interface SeedstockCountingResponse {
    statusCode?: number;
    message?: string;
    totalCount: number;
    executionTimeSec?: number;
    detections: Array<{
        id: number;
        center: { x: number; y: number };
        dimensions: { width: number; height: number };
        angleDegree: number;
        corners: number[][];
    }>;
}

export interface AIPredictRequest {
    documentId?: string;
    image_base?: string;
}

export const aiApi = {
    countSeedstock: async (data: AIPredictRequest): Promise<SeedstockCountingResponse> => {
        // Call backend API instead of direct AI server
        console.log('--- DEBUG AXIOS REQUEST ---');
        console.log('URL:', API_ENDPOINTS.AI.SEEDSTOCK_COUNTING);
        console.log('Payload Data:', JSON.stringify(data));

        try {
            const response = await apiClient.post<{ data: SeedstockCountingResponse }>(
                API_ENDPOINTS.AI.SEEDSTOCK_COUNTING,
                data,
                { timeout: 60000 }
            );
            return response.data?.data || (response.data as unknown as SeedstockCountingResponse);
        } catch (error: any) {
            console.log('--- DEBUG AXIOS ERROR ---');
            console.log('Error Config Data:', error.config?.data);
            console.log('Error Response Data:', error.response?.data);
            throw error;
        }
    },
    estimateSize: async (data: AIPredictRequest): Promise<EstimatedSizeResponse> => {
        const response = await apiClient.post<{ data: EstimatedSizeResponse }>(
            API_ENDPOINTS.AI.ESTIMATED_SIZE,
            data,
            { timeout: 60000 }
        );
        return response.data?.data || (response.data as unknown as EstimatedSizeResponse);
    },
    predictHealth: async (data: AIPredictRequest): Promise<ShrimpHealthResponse> => {
        const response = await apiClient.post<{ data: ShrimpHealthResponse }>(
            API_ENDPOINTS.AI.SHRIMP_HEALTH,
            data,
            { timeout: 60000 }
        );
        return response.data?.data || (response.data as unknown as ShrimpHealthResponse);
    },
};

export interface EstimatedSizeResponse {
    statusCode?: number;
    message?: string;
    imageProcessed?: string;
    averageSizeCm?: number;
    shrimpCountPerKg?: number;
    results?: {
        count: number;
        objects: Array<{
            id: number;
            lengthCm: number;
            confidence: number;
            bbox: number[];
        }>;
    };
    detections?: Array<{
        id: number;
        box: number[];
        score: number;
        classId: number;
        className: string;
    }>;
}

export interface ShrimpHealthResponse {
    statusCode?: number;
    message?: string;
    datetime?: string;
    device?: string;
    executionProvider?: string[];
    metaData?: {
        totalPipelineTime?: string;
        segmentTime?: string;
        classifierTime?: string;
        numDetections?: number;
    };
    results: Array<{
        id: number;
        bbox: number[];
        segConf: number;
        prediction: {
            top1Class: string;
            top1Conf: number;
            allClasses: Record<string, number>;
        };
    }>;
}
