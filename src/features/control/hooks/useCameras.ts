import { useQuery } from '@tanstack/react-query';
import { cameraApi, CameraItem } from '@/features/control/api/cameraApi';
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
