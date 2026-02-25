import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';

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
    documentId?: string;
    image_base?: string;
}

export const aiApi = {
    countSeedstock: async (data: AIPredictRequest): Promise<SeedstockCountingResponse> => {
        // Call backend API instead of direct AI server
        const response = await apiClient.post<{ data: SeedstockCountingResponse }>(
            API_ENDPOINTS.AI.SEEDSTOCK_COUNTING,
            data
        );

        // API client might wrap response in data field
        return response.data?.data || (response.data as unknown as SeedstockCountingResponse);
    },
    estimateSize: async (data: AIPredictRequest): Promise<EstimatedSizeResponse> => {
        const response = await apiClient.post<{ data: EstimatedSizeResponse }>(
            API_ENDPOINTS.AI.ESTIMATED_SIZE,
            data
        );
        return response.data?.data || (response.data as unknown as EstimatedSizeResponse);
    },
    predictHealth: async (data: AIPredictRequest): Promise<ShrimpHealthResponse> => {
        const response = await apiClient.post<{ data: ShrimpHealthResponse }>(
            API_ENDPOINTS.AI.SHRIMP_HEALTH,
            data
        );
        return response.data?.data || (response.data as unknown as ShrimpHealthResponse);
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

export interface ShrimpHealthResponse {
    status_code?: number;
    message?: string;
    datetime?: string;
    device?: string;
    execution_provider?: string[];
    meta_data?: {
        total_pipeline_time?: string;
        segment_time?: string;
        classifier_time?: string;
        num_detections?: number;
    };
    results: Array<{
        id: number;
        bbox: number[];
        seg_conf: number;
        prediction: {
            top1_class: string;
            top1_conf: number;
            all_classes: Record<string, number>;
        };
    }>;
}
