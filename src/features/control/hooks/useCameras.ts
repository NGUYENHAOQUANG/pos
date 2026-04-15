import { useQuery } from '@tanstack/react-query';
import { cameraApi, CameraItem } from '@/features/control/api/cameraApi';
import { controlKeys } from '@/features/control/hooks/controlKeys';

export const useCameras = () => {
    return useQuery({
        queryKey: controlKeys.cameras.list(),
        queryFn: async (): Promise<CameraItem[]> => {
            const response = await cameraApi.getList();
            const originalItems = response.data?.data?.items ?? [];

            // Duplicate the items to simulate 10 more cameras for UI testing!
            if (originalItems.length > 0) {
                const clonedItems: CameraItem[] = [];
                for (let i = 1; i <= 6; i++) {
                    const sourceCam = originalItems[i % originalItems.length];
                    clonedItems.push({
                        ...sourceCam,
                        deviceCode: `${sourceCam.deviceCode}-mock-${i}`, // Unique ID
                        name: `${sourceCam.name}`,
                        // Randomly distribute into ponds so we can test the Filter tabs
                        pondName: i % 2 === 0 ? 'Ao Nuôi 01' : 'Ao Vèo 01',
                        locationCategory: i % 2 === 0 ? 'GrowOutPond' : 'NurseryPond',
                    });
                }
                return [...originalItems, ...clonedItems];
            }

            return originalItems;
        },
        staleTime: 1000 * 60,
    });
};
