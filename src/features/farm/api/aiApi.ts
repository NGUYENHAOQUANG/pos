import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import type { IApiResponse } from '@/shared/types/common.types';
import type {
    InferencePredictRequest,
    InferencePredictResponse,
    InferenceResultResponse,
} from '@/features/farm/types/ai.types';

export const aiApi = {
    inferencePredict: async (data: InferencePredictRequest): Promise<InferencePredictResponse> => {
        const formData = new FormData();
        formData.append('Image', {
            uri: data.Image.uri,
            type: data.Image.type,
            name: data.Image.name,
        } as unknown as Blob);
        formData.append('ZoneId', data.ZoneId);
        formData.append('ModuleId', data.ModuleId);
        formData.append('ClientTimestamp', data.ClientTimestamp);

        const response = await apiClient.post<IApiResponse<InferencePredictResponse>>(
            API_ENDPOINTS.INFERENCE.PREDICT,
            formData,
            {
                timeout: 60000,
                headers: { 'Content-Type': 'multipart/form-data' },
            }
        );
        return response.data?.data || { requestId: '', imageId: '', status: '', message: '' };
    },
    getInferenceResult: async (requestId: string): Promise<InferenceResultResponse> => {
        const response = await apiClient.get<IApiResponse<InferenceResultResponse>>(
            API_ENDPOINTS.INFERENCE.GET_RESULT(requestId),
            { timeout: 60000 }
        );
        return response.data?.data || ({} as InferenceResultResponse);
    },
};
