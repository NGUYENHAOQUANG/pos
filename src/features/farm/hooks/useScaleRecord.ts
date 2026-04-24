import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { scaleRecordApi } from '@/features/farm/api/scaleRecordApi';
import { farmKeys } from '@/features/farm/hooks/farmKeys';
import { handleError } from '@/shared/utils/errorHandler';
import {
    IStartScaleSessionRequest,
    IScaleRecordParams,
    IConfirmScaleRecordRequest,
    IFinishScaleSessionRequest,
} from '@/features/farm/types/scaleRecord.types';

export const useStartScaleSession = () => {
    return useMutation({
        mutationFn: (data: IStartScaleSessionRequest) => scaleRecordApi.startSession(data),
        onError: handleError,
    });
};

export const useScaleRecords = (params?: IScaleRecordParams, options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: farmKeys.scaleRecords.list(params),
        queryFn: () => scaleRecordApi.getAll(params),
        enabled: options?.enabled,
    });
};

export const useConfirmScaleRecord = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: IConfirmScaleRecordRequest) => scaleRecordApi.confirm(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: farmKeys.scaleRecords.all() });
        },
        onError: handleError,
    });
};

export const useFinishScaleSession = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: IFinishScaleSessionRequest) => scaleRecordApi.finishSession(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: farmKeys.scaleRecords.all() });
            queryClient.invalidateQueries({ queryKey: farmKeys.scales.all() });
        },
        onError: handleError,
    });
};

export const useSoftDeleteScaleRecord = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { id: string; deleteNote?: string }) =>
            scaleRecordApi.softDelete(data.id, data.deleteNote),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: farmKeys.scaleRecords.all() });
        },
        onError: handleError,
    });
};

export const useDiscardScaleSession = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: scaleRecordApi.discardSession,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: farmKeys.scaleRecords.all() });
            queryClient.invalidateQueries({ queryKey: farmKeys.scales.all() });
        },
        onError: handleError,
    });
};
