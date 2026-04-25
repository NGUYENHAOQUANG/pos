import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import type { IApiResponse } from '@/shared/types/common.types';
import type {
    SurveySubmitPayload,
    SurveySubmitResult,
    SurveyStatusResult,
} from '@/features/survey/types/survey.types';

export const surveyApi = {
    submit: async (payload: SurveySubmitPayload): Promise<IApiResponse<SurveySubmitResult>> => {
        console.log('📤 [surveyApi.submit] Payload:', JSON.stringify(payload, null, 2));
        const response = await apiClient.post<IApiResponse<SurveySubmitResult>>(
            API_ENDPOINTS.SURVEY.SUBMIT,
            payload
        );
        console.log('📥 [surveyApi.submit] Response:', JSON.stringify(response.data, null, 2));
        return response.data;
    },

    /**
     * GET /api/v1/survey/status/:userId — Check if user already completed survey
     */
    getStatus: async (userId: string): Promise<IApiResponse<SurveyStatusResult>> => {
        const response = await apiClient.get<IApiResponse<SurveyStatusResult>>(
            API_ENDPOINTS.SURVEY.STATUS(userId)
        );
        return response.data;
    },
};
