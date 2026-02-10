import { aiClient } from '@/core/api/client';

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

import { ENV } from '@/core/config/env';

export const aiApi = {
    countSeedstock: async (base64Content: string): Promise<SeedstockCountingResponse> => {
        // Debug URL and Key
        console.log(
            '[AI API] Calling endpoint:',
            ENV.API_URL_AI + '/api/v1/seedstock_counting/predict'
        );

        const response = await aiClient.post<SeedstockCountingResponse>(
            '/api/v1/seedstock_counting/predict',
            {
                image_base: base64Content,
            },
            {
                headers: {
                    'x-api-key': ENV.API_KEY_AI,
                },
            }
        );

        return response.data;
    },
};
