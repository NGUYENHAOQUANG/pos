import { aiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import { ENV } from '@/core/config/env';

export interface SeedstockCountingResponse {
    status_code?: number;
    message?: string;
    total_count: number;
    execution_time_sec?: number;
    detections: Array<{
        id: number;
        center: { x: number; y: number };
        dimensions: { width: number; height: number };
        angle_degree: number;
        corners: number[][];
    }>;
}

export interface AIPredictRequest {
    image_base: string;
}

export const aiApi = {
    countSeedstock: async (data: AIPredictRequest): Promise<SeedstockCountingResponse> => {
        // Debug URL and Key
        console.log(
            '[AI API] Calling endpoint:',
            ENV.API_URL_AI + API_ENDPOINTS.AI.SEEDSTOCK_COUNTING
        );

        const response = await aiClient.post<SeedstockCountingResponse>(
            API_ENDPOINTS.AI.SEEDSTOCK_COUNTING,
            data
        );

        return response.data;
    },
    estimateSize: async (data: AIPredictRequest): Promise<EstimatedSizeResponse> => {
        const response = await aiClient.post<EstimatedSizeResponse>(
            API_ENDPOINTS.AI.ESTIMATED_SIZE,
            data
        );
        return response.data;
    },
};

export interface EstimatedSizeResponse {
    status_code?: number;
    message?: string;
    image_processed?: string;
    average_size_cm?: number;
    shrimp_count_per_kg?: number;
    results?: {
        count: number;
        objects: Array<{
            id: number;
            length_cm: number;
            confidence: number;
            bbox: number[];
        }>;
    };
    detections?: Array<{
        id: number;
        box: number[];
        score: number;
        class_id: number;
        class_name: string;
    }>;
}
