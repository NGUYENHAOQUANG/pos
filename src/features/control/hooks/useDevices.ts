import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deviceApi, DeviceItem, DeviceHubItem } from '@/features/control/api/deviceApi';
import { controlKeys } from './controlKeys';
import { DeviceData, EControlMode, PondDeviceStats, Pond } from '@/features/control/types/control.types';
import Toast from 'react-native-toast-message';

// ===== Helper Functions =====

/** Calculate device stats for pond summary card */
const calculatePondStats = (devices: DeviceData[]): PondDeviceStats => {
    const stats: PondDeviceStats = {
        fan: { active: 0, warning: 0, inactive: 0 },
        feeder: { active: 0, warning: 0, inactive: 0 },
        oxy: { active: 0, warning: 0, inactive: 0 },
        syphon: { active: 0, warning: 0, inactive: 0 },
    };

    devices.forEach(device => {
        const type = device.type;
        if (!stats[type]) return;

        if (device.errorMessage) {
            stats[type].warning++;
        } else if (device.isOn || device.mode === EControlMode.LOCAL) {
            stats[type].active++;
        } else {
            stats[type].inactive++;
        }
    });

    return stats;
};

/** Map API DeviceItem to local DeviceData */
const mapApiDeviceToDeviceData = (item: DeviceItem): DeviceData => {
    let type: 'feeder' | 'fan' | 'oxy' | 'syphon' = 'feeder';
    switch (item.deviceType) {
        case 'Syphon':
            type = 'syphon';
            break;
        case 'Feeder':
            type = 'feeder';
            break;
        case 'AirBlower':
            type = 'oxy';
            break;
        case 'PaddleWheel':
            type = 'fan';
            break;
        default:
            type = 'feeder';
    }

    // Determine on/off from connectionStatus
    const isOn = item.connectionStatus === 'On';

    // Determine error message from installationStatus or connection
    let errorMessage: string | undefined;
    if (item.installationStatus !== 'Installed') {
        errorMessage = item.installationStatus;
    } else if (item.connectionStatus === 'DisConnected' || item.connectionStatus === 'Disconnect') {
        errorMessage = 'Mất kết nối';
    }

    return {
        id: item.id,
        name: item.name,
        type,
        mode: type === 'oxy' ? EControlMode.LOCAL : EControlMode.SCHEDULE,
        isOn,
        errorMessage,
        internalDeviceId: item.no,
    };
};

/**
 * Group devices into Ponds based on DeviceHub mapping.
 * Flow: DeviceHub has pondId/pondName, Device has deviceHubName.
 * So: Device.deviceHubName === DeviceHub.name → mapped to DeviceHub.pondId/pondName
 */
const buildPondsFromApi = (hubs: DeviceHubItem[], devices: DeviceItem[]): Pond[] => {
    // Build hub name → hub map for fast lookup
    const hubByName = new Map<string, DeviceHubItem>();
    hubs.forEach(hub => {
        hubByName.set(hub.name, hub);
    });

    // Group devices by pondId via their hub
    const pondDevicesMap = new Map<string, { pondName: string; devices: DeviceData[] }>();

    devices.forEach(device => {
        const hub = hubByName.get(device.deviceHubName);
        if (!hub) return; // Device has no matching hub, skip

        const existing = pondDevicesMap.get(hub.pondId);
        const mappedDevice = mapApiDeviceToDeviceData(device);

        if (existing) {
            existing.devices.push(mappedDevice);
        } else {
            pondDevicesMap.set(hub.pondId, {
                pondName: hub.pondName,
                devices: [mappedDevice],
            });
        }
    });

    // Also include hubs that have no devices yet (empty ponds with hub installed)
    hubs.forEach(hub => {
        if (!pondDevicesMap.has(hub.pondId)) {
            pondDevicesMap.set(hub.pondId, {
                pondName: hub.pondName,
                devices: [],
            });
        }
    });

    // Convert map to Pond array
    const ponds: Pond[] = [];
    pondDevicesMap.forEach((value, pondId) => {
        ponds.push({
            id: pondId,
            name: value.pondName,
            hasDevices: value.devices.length > 0,
            devices: value.devices,
            deviceStats: calculatePondStats(value.devices),
        });
    });

    // Sort: ponds with devices first, then alphabetically by name
    ponds.sort((a, b) => {
        if (a.hasDevices !== b.hasDevices) return a.hasDevices ? -1 : 1;
        return a.name.localeCompare(b.name);
    });

    return ponds;
};

// ===== React Query Hooks =====

/**
 * Fetch DeviceHubs + Devices from API, then group devices into Ponds.
 * Returns Pond[] with devices mapped via hub linkage.
 */
export const useDevices = () => {
    return useQuery({
        queryKey: controlKeys.devices.list(),
        queryFn: async (): Promise<Pond[]> => {
            // Fetch both hubs and devices in parallel
            const [hubsResponse, devicesResponse] = await Promise.all([
                deviceApi.getDeviceHubs(),
                deviceApi.getDevices(),
            ]);

            const hubs = hubsResponse.data?.data?.items ?? [];
            const devices = devicesResponse.data?.data?.items ?? [];

            return buildPondsFromApi(hubs, devices);
        },
        staleTime: 1000 * 3,
        refetchInterval: 5000,
    });
};

/**
 * Toggle device on/off via API.
 * Optimistically updates local state, then invalidates on success.
 */
export const useToggleDevice = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ deviceId }: { deviceId: string; pondId: string; isOn: boolean }) => {
            return deviceApi.toggleDevice({ deviceId });
        },
        onMutate: async ({ pondId, deviceId, isOn }) => {
            // Cancel pending refetches
            await queryClient.cancelQueries({ queryKey: controlKeys.devices.list() });

            // Snapshot current data
            const previousData = queryClient.getQueryData<Pond[]>(controlKeys.devices.list());

            // Optimistic update
            if (previousData) {
                const updated = previousData.map(pond => {
                    if (pond.id !== pondId) return pond;
                    const updatedDevices = pond.devices.map(d =>
                        d.id === deviceId ? { ...d, isOn } : d
                    );
                    return {
                        ...pond,
                        devices: updatedDevices,
                        deviceStats: calculatePondStats(updatedDevices),
                    };
                });
                queryClient.setQueryData(controlKeys.devices.list(), updated);
            }

            return { previousData };
        },
        onError: (_err, _vars, context) => {
            // Rollback on error
            if (context?.previousData) {
                queryClient.setQueryData(controlKeys.devices.list(), context.previousData);
            }
            Toast.show({
                type: 'error',
                text1: 'Lỗi kết nối',
                text2: 'Không thể gửi lệnh điều khiển',
            });
        },
        onSuccess: (_data, { isOn }) => {
            Toast.show({
                type: 'success',
                text1: 'Thành công',
                text2: `${isOn ? 'Bật' : 'Tắt'} thiết bị thành công`,
                visibilityTime: 2000,
            });
        },
        onSettled: () => {
            // Refetch after mutation settles
            queryClient.invalidateQueries({ queryKey: controlKeys.devices.list() });
        },
    });
};

/**
 * Update device mode (MANUAL <-> SCHEDULE) locally.
 * Uses queryClient.setQueryData for instant local state update.
 */
export const useUpdateDeviceMode = () => {
    const queryClient = useQueryClient();

    const updateMode = (pondId: string, deviceId: string, mode: EControlMode) => {
        const currentData = queryClient.getQueryData<Pond[]>(controlKeys.devices.list());
        if (!currentData) return;

        const updated = currentData.map(pond => {
            if (pond.id !== pondId) return pond;
            const updatedDevices = pond.devices.map(d =>
                d.id === deviceId ? { ...d, mode } : d
            );
            return {
                ...pond,
                devices: updatedDevices,
                deviceStats: calculatePondStats(updatedDevices),
            };
        });

        queryClient.setQueryData(controlKeys.devices.list(), updated);
    };

    return { updateMode };
};

/**
 * Update device settings (feedingConfig, schedules) locally.
 * Uses queryClient.setQueryData for instant local state update.
 */
export const useUpdateDeviceSettings = () => {
    const queryClient = useQueryClient();

    const updateSettings = (pondId: string, deviceId: string, settings: Partial<DeviceData>) => {
        const currentData = queryClient.getQueryData<Pond[]>(controlKeys.devices.list());
        if (!currentData) return;

        const updated = currentData.map(pond => {
            if (pond.id !== pondId) return pond;
            const updatedDevices = pond.devices.map(d =>
                d.id === deviceId ? { ...d, ...settings } : d
            );
            return {
                ...pond,
                devices: updatedDevices,
            };
        });

        queryClient.setQueryData(controlKeys.devices.list(), updated);
    };

    return { updateSettings };
};

/**
 * Connect a new device to a pond (local mock only).
 * Uses queryClient.setQueryData to add the device optimistically.
 */
export const useConnectDevice = () => {
    const queryClient = useQueryClient();

    const connectDeviceToPond = (pondName: string, code?: string) => {
        if (!code) return;

        const currentData = queryClient.getQueryData<Pond[]>(controlKeys.devices.list());
        if (!currentData) return;

        // Device Map for Codes 1-6
        const typeMap: Record<string, { type: 'feeder' | 'fan' | 'oxy' | 'syphon'; defaultName: string }> = {
            '1': { type: 'feeder', defaultName: 'Máy cho ăn tự động A1' },
            '2': { type: 'syphon', defaultName: 'Hệ thống Xiphong X1' },
            '3': { type: 'fan', defaultName: 'Quạt nước Q1' },
            '4': { type: 'fan', defaultName: 'Quạt nước Q2' },
            '5': { type: 'oxy', defaultName: 'Máy thổi khí Oxy 1' },
            '6': { type: 'syphon', defaultName: 'Hệ thống Xiphong X2' },
        };

        let config = typeMap[code];
        if (!config) {
            config = { type: 'feeder', defaultName: `Thiết bị ${code}` };
        }

        const updated = currentData.map(pond => {
            if (pond.name !== pondName) return pond;

            // Naming Logic - append number if name exists
            let finalName = config.defaultName;
            const nameExists = pond.devices.some(d => d.name === config.defaultName);
            if (nameExists) {
                let counter = 1;
                while (pond.devices.some(d => d.name === `${config.defaultName} ${counter}`)) {
                    counter++;
                }
                finalName = `${config.defaultName} ${counter}`;
            }

            const newDevice: DeviceData = {
                id: `new_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                mode: EControlMode.MANUAL,
                isOn: true,
                errorMessage: undefined,
                name: finalName,
                type: config.type,
            };

            const updatedDevices = [...pond.devices, newDevice];
            return {
                ...pond,
                devices: updatedDevices,
                hasDevices: true,
                deviceStats: calculatePondStats(updatedDevices),
            };
        });

        queryClient.setQueryData(controlKeys.devices.list(), updated);
    };

    return { connectDeviceToPond };
};
