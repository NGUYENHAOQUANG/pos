import { useState } from 'react';
import { deviceApi } from '@/features/control/api/deviceApi';
import { useControl } from '@/features/control/store/controlStore';
import Toast from 'react-native-toast-message';

export const useDeviceToggle = () => {
    const [loadingIds, setLoadingIds] = useState<Record<string, boolean>>({});
    const { updateDeviceState, ponds } = useControl();

    const toggleDevice = async (pondId: string, deviceId: string, isOn: boolean) => {
        // Set loading state for ALL devices to show UI feedback
        setLoadingIds(prev => ({ ...prev, [deviceId]: true }));

        try {
            // 1. Get Device Info from Store (Dynamic Data)
            const pond = ponds.find(p => p.id === pondId);
            const device = pond?.devices.find(d => d.id === deviceId);

            if (!device) {
                console.warn(`Device ${deviceId} not found in store.`);
                return;
            }

            // 2. Prepare Payload (Send deviceId UUID)
            const payload = {
                deviceId: device.id,
            };

            console.log('Sending toggle request for device:', device.name, payload);

            // 3. Call API
            const response = await deviceApi.toggleDevice(payload);
            const responseData = (response.data as any)?.data; // Assuming API returns wrapped data

            // 4. Check Success (Status 200)
            const isSuccess = response.status === 200 || response.data?.success;

            if (isSuccess) {
                console.log('Toggle success! Updating store.');
                updateDeviceState(pondId, deviceId, isOn);
                Toast.show({
                    type: 'success',
                    text1: 'Thành công',
                    text2: `${isOn ? 'Bật' : 'Tắt'} thiết bị thành công`,
                    visibilityTime: 2000,
                });
            } else {
                console.warn('Toggle failed:', responseData);
                Toast.show({
                    type: 'error',
                    text1: 'Điều khiển thất bại',
                    text2: `Lỗi: ${responseData?.message || 'Unknown error'}`,
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
