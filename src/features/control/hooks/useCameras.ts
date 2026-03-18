import { useQuery } from '@tanstack/react-query';
import { cameraApi, CameraItem, CameraStreamData } from '@/features/control/api/cameraApi';
import { controlKeys } from '@/features/control/hooks/controlKeys';

// ===== React Query Hooks =====

/**
 * Fetch the list of all cameras from API.
 * Returns CameraItem[] mapped for UI usage.
 */
export const useCameras = () => {
    return useQuery({
        queryKey: controlKeys.cameras.list(),
        queryFn: async (): Promise<CameraItem[]> => {
            const response = await cameraApi.getList();
            return response.data?.data ?? [];
        },
        staleTime: 1000 * 60, // 1 minute
    });
};

/**
 * Fetch stream URL for a specific camera by serial number.
 * Only enabled when sn is provided (non-empty string).
 */
export const useCameraStream = (sn: string) => {
    return useQuery({
        queryKey: controlKeys.cameras.stream(sn),
        queryFn: async (): Promise<CameraStreamData> => {
            const response = await cameraApi.getStream(sn);
            return response.data?.data;
        },
        enabled: !!sn,
        staleTime: 1000 * 30, // 30 seconds - stream URLs may change
    });
};
