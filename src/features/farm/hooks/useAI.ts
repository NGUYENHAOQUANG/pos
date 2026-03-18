import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { aiApi } from '@/features/farm/api/aiApi';
import type {
    AIPredictRequest,
    SeedstockCountingResponse,
    EstimatedSizeResponse,
    ShrimpHealthResponse,
} from '@/features/farm/types/ai.types';
import { handleError } from '@/shared/utils/errorHandler';

export const useCountSeedstock = (): UseMutationResult<
    SeedstockCountingResponse,
    Error,
    AIPredictRequest,
    unknown
> => {
    return useMutation<SeedstockCountingResponse, Error, AIPredictRequest>({
        mutationFn: aiApi.countSeedstock,
        onError: handleError,
    });
};

export const useEstimateShrimpSize = (): UseMutationResult<
    EstimatedSizeResponse,
    Error,
    AIPredictRequest,
    unknown
> => {
    return useMutation<EstimatedSizeResponse, Error, AIPredictRequest>({
        mutationFn: aiApi.estimateSize,
        onError: handleError,
    });
};

export const usePredictShrimpHealth = (): UseMutationResult<
    ShrimpHealthResponse,
    Error,
    AIPredictRequest,
    unknown
> => {
    return useMutation<ShrimpHealthResponse, Error, AIPredictRequest>({
        mutationFn: aiApi.predictHealth,
        onError: handleError,
    });
};
