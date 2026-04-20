import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { scaleRecordApi } from '@/features/farm/api/scaleRecordApi';
import { farmKeys } from '@/features/farm/hooks/farmKeys';
import { AppToast } from '@/features/farm/utils/toastMessages';
import {
    IStartScaleSessionRequest,
    IScaleRecordParams,
    IConfirmScaleRecordRequest,
    IFinishScaleSessionRequest,
} from '@/features/farm/types/scaleRecord.types';

export const useStartScaleSession = () => {
    return useMutation({
        mutationFn: (data: IStartScaleSessionRequest) => scaleRecordApi.startSession(data),
    });
};

export const useScaleRecords = (params?: IScaleRecordParams) => {
    return useQuery({
        queryKey: farmKeys.scaleRecords.list(params),
        queryFn: () => scaleRecordApi.getAll(params),
        enabled: !!params?.SessionId || !!params?.RecordId,
    });
};

export const useConfirmScaleRecord = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: IConfirmScaleRecordRequest) => scaleRecordApi.confirm(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: farmKeys.scaleRecords.all() });
        },
        onError: () => {
            AppToast({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Lỗi khi xác nhận mẻ cân',
            } as any);
        },
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
        onError: () => {
            AppToast({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Lỗi khi kết thúc phiên cân',
            } as any);
        },
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
        onError: () => {
            AppToast({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Lỗi khi hủy mẻ cân',
            } as any);
        },
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
        onError: () => {
            AppToast({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Lỗi khi xóa phiên cân',
            } as any);
        },
    });
};
