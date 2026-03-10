import { useState, useCallback } from 'react';
import { useToggleDevice } from '@/features/control/hooks/useDevices';
import { Pond } from '@/features/control/types/control.types';
import Toast from 'react-native-toast-message';
import { EControlMode } from '@/features/control/types/control.types';

/**
 * Hook to handle device toggle with loading state tracking per device.
 * Uses the React Query useToggleDevice mutation internally.
 */
export const useDeviceToggle = (ponds: Pond[]) => {
    const [loadingIds, setLoadingIds] = useState<Record<string, boolean>>({});
    const toggleMutation = useToggleDevice();

    const toggleDevice = useCallback(
        async (pondId: string, deviceId: string, isOn: boolean) => {
            // Set loading state
            setLoadingIds(prev => ({ ...prev, [deviceId]: true }));

            try {
                // Get Device Info from query data
                const pond = ponds.find(p => p.id === pondId);
                const device = pond?.devices.find(d => d.id === deviceId);

                if (!device) {
                    console.warn(`Device ${deviceId} not found.`);
                    return;
                }

                if (device.mode === EControlMode.LOCAL) {
                    Toast.show({
                        type: 'error',
                        text1: 'Không thể bật/tắt thiết bị này',
                    });
                    return;
                }

                console.log('Sending toggle request for device:', device.name);

                // Call mutation
                await toggleMutation.mutateAsync({
                    deviceId: device.id,
                    pondId,
                    isOn,
                });
            } catch (error) {
                console.error('Toggle Error:', error);
                // Error toast is handled in the mutation's onError
            } finally {
                setLoadingIds(prev => ({ ...prev, [deviceId]: false }));
            }
        },
        [ponds, toggleMutation]
    );

    return {
        toggleDevice,
        loadingIds,
    };
};
