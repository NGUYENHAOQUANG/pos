import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { aiApi } from '@/features/farm/api/aiApi';
import type {
    InferencePredictRequest,
    InferencePredictResponse,
    InferenceResultResponse,
} from '@/features/farm/types/ai.types';
import { handleError } from '@/shared/utils/errorHandler';
export const useInferencePredict = (): UseMutationResult<
    InferencePredictResponse,
    Error,
    InferencePredictRequest,
    unknown
> => {
    return useMutation<InferencePredictResponse, Error, InferencePredictRequest>({
        mutationFn: aiApi.inferencePredict,
        onError: handleError,
    });
};

export const useGetInferenceResult = (): UseMutationResult<
    InferenceResultResponse,
    Error,
    string,
    unknown
> => {
    return useMutation<InferenceResultResponse, Error, string>({
        mutationFn: aiApi.getInferenceResult,
        onError: handleError,
    });
};
