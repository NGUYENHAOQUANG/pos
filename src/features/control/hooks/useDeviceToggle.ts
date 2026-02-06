import { useState } from 'react';
import { deviceApi } from '@/features/control/api/deviceApi';
import { useControl } from '@/features/control/store/controlStore';
import { DEVICE_HARDWARE_MAP } from '@/features/control/data/deviceConfig';
import Toast from 'react-native-toast-message';

export const useDeviceToggle = () => {
    const [loadingIds, setLoadingIds] = useState<Record<string, boolean>>({});
    const { updateDeviceState } = useControl();

    const toggleDevice = async (pondId: string, deviceId: string, isOn: boolean) => {
        // 1. Check if device needs API call
        const hardwareConfig = DEVICE_HARDWARE_MAP[deviceId];

        // If no config, just update local state (Legacy/Mock devices)
        if (!hardwareConfig) {
            console.log(`No hardware config for ${deviceId}, updating local state only.`);
            updateDeviceState(pondId, deviceId, isOn);
            return;
        }

        // 2. Set loading state
        setLoadingIds(prev => ({ ...prev, [deviceId]: true }));

        try {
            // 3. Prepare Payload
            const payload = {
                deviceId: hardwareConfig.deviceId,
                deviceName: hardwareConfig.deviceName,
                internalDeviceId: hardwareConfig.internalDeviceId,
                value: isOn ? 1 : 0,
                message: 'Toggle via App',
            };

            console.log('Sending toggle request:', payload);

            // 4. Call API
            const response = await deviceApi.toggleDevice(payload);
            const responseData = (response.data as any)?.data;

            console.log('Toggle response:', JSON.stringify(responseData, null, 2));

            // 5. Check Success (Status 200)
            if (responseData?.status === 200) {
                console.log('Toggle success! Updating store.');
                updateDeviceState(pondId, deviceId, isOn);
            } else {
                console.warn('Toggle failed:', responseData);
                Toast.show({
                    type: 'error',
                    text1: 'Điều khiển thất bại',
                    text2: `Lỗi từ thiết bị: ${responseData?.status || 'Unknown'}`,
                });
            }
        } catch (error) {
            console.error('API Error:', error);
            Toast.show({
                type: 'error',
                text1: 'Lỗi kết nối',
                text2: 'Không thể gửi lệnh điều khiển',
            });
        } finally {
            setLoadingIds(prev => ({ ...prev, [deviceId]: false }));
        }
    };

    return {
        toggleDevice,
        loadingIds,
    };
};
