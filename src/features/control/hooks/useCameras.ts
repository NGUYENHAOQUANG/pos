import { useQuery } from '@tanstack/react-query';
import { cameraApi, CameraItem, CameraStreamData } from '@/features/control/api/cameraApi';
import { controlKeys } from '@/features/control/hooks/controlKeys';
export const useCameras = () => {
    return useQuery({
        queryKey: controlKeys.cameras.list(),
        queryFn: async (): Promise<CameraItem[]> => {
            const response = await cameraApi.getList();
            return response.data?.data?.items ?? [];
        },
        staleTime: 1000 * 60,
    });
};

export const useCameraStream = (sn: string) => {
    return useQuery({
        queryKey: controlKeys.cameras.stream(sn),
        queryFn: async (): Promise<CameraStreamData> => {
            const response = await cameraApi.getStream(sn);
            return response.data?.data;
        },
        enabled: !!sn,
        staleTime: 1000 * 30,
    });
};
