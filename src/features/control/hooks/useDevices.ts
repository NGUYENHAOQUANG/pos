import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deviceApi, DeviceItem, DeviceHubItem } from '@/features/control/api/deviceApi';
import { controlKeys } from './controlKeys';
import {
    DeviceData,
    EControlMode,
    PondDeviceStats,
    Pond,
} from '@/features/control/types/control.types';
import Toast from 'react-native-toast-message';
import { MOCK_PONDS } from '@/features/control/data/devicesData';

// ==========================================
// 🚧 [TODO]: XÓA BIẾN NÀY KHI CÓ API THIẾT BỊ NHÁ THẬT
// Biến tạm để lưu trạng thái bật/tắt của thiết bị mock,
// giúp Switch trên UI có thể thay đổi hợp lệ mà không bị "giật" lại.
let MOCK_WRAPPER_IS_ON = true;
// ==========================================

// ===== Helper Functions =====

/** Calculate device stats for pond summary card */
const calculatePondStats = (devices: DeviceData[]): PondDeviceStats => {
    const stats: PondDeviceStats = {
        fan: { active: 0, warning: 0, inactive: 0 },
        feeder: { active: 0, warning: 0, inactive: 0 },
        oxy: { active: 0, warning: 0, inactive: 0 },
        syphon: { active: 0, warning: 0, inactive: 0 },
        pump: { active: 0, warning: 0, inactive: 0 },
        wrapper: { active: 0, warning: 0, inactive: 0 },
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
const mapApiDeviceToDeviceData = (
    item: DeviceItem,
    unhealthyDeviceIds?: Set<string>
): DeviceData => {
    let type: 'feeder' | 'fan' | 'oxy' | 'syphon' | 'pump' | 'wrapper' = 'feeder';
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
        case 'Pump':
            type = 'pump';
            break;
        default:
            type = 'feeder';
    }

    // Determine on/off from device status (not connectionStatus)
    const isOn = item.status === 'On';

    // Determine error message from installationStatus, connection, or fault
    let errorMessage: string | undefined;
    if (item.installationStatus !== 'Installed') {
        errorMessage = item.installationStatus;
    } else if (item.connectionStatus === 'DisConnected' || item.connectionStatus === 'Disconnect') {
        errorMessage = 'Mất kết nối';
    } else if (item.status === 'Fault') {
        errorMessage = 'Lỗi thiết bị';
    } else if (unhealthyDeviceIds?.has(item.id)) {
        errorMessage = 'Thiết bị không phản hồi';
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
const buildPondsFromApi = (
    hubs: DeviceHubItem[],
    devices: DeviceItem[],
    unhealthyDeviceIds?: Set<string>
): Pond[] => {
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
        const mappedDevice = mapApiDeviceToDeviceData(device, unhealthyDeviceIds);

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

    return ponds;
};

const getPondCategoryPriority = (pondName: string): number => {
    const nameAfterAo = pondName.replace(/^Ao\s+/i, '');
    if (nameAfterAo.startsWith('V')) return 0;
    if (nameAfterAo.startsWith('N')) return 1;
    if (nameAfterAo.startsWith('SS')) return 2;
    if (nameAfterAo.startsWith('XL')) return 3;
    if (nameAfterAo.startsWith('L')) return 4;
    if (nameAfterAo.startsWith('T')) return 5;
    return 99;
};

const sortPondsByCategory = (ponds: Pond[]): Pond[] => {
    return ponds.sort((a, b) => {
        const priorityA = getPondCategoryPriority(a.name);
        const priorityB = getPondCategoryPriority(b.name);

        if (priorityA !== priorityB) return priorityA - priorityB;
        return a.name.localeCompare(b.name);
    });
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
            // Fetch hubs, devices, and health check in parallel
            const [hubsResponse, devicesResponse, healthResponse] = await Promise.all([
                deviceApi.getDeviceHubs(),
                deviceApi.getDevices(),
                deviceApi.getHealthCheck().catch(() => null),
            ]);

            const hubs = hubsResponse.data?.data?.items ?? [];
            const devices = devicesResponse.data?.data?.items ?? [];

            // Build unhealthy device set from health check
            const unhealthyDeviceIds = new Set<string>();
            if (healthResponse?.data?.data?.devices) {
                healthResponse.data.data.devices.forEach(d => {
                    if (!d.isHealthy) {
                        unhealthyDeviceIds.add(d.deviceId);
                    }
                });
            }

            const builtPonds = buildPondsFromApi(hubs, devices, unhealthyDeviceIds);

            // Inject mock wrapper devices to Ao N01 for demo
            const targetPond = builtPonds.find(p => p.name === 'Ao N01' || p.name === 'Ao 1');
            if (targetPond) {
                targetPond.devices.push({
                    id: 'mock-wrapper-1',
                    name: 'Aquafan Pro 50',
                    type: 'wrapper',
                    mode: EControlMode.MANUAL,
                    isOn: MOCK_WRAPPER_IS_ON,
                });
                targetPond.deviceStats = calculatePondStats(targetPond.devices);
            }

            const allPonds = [
                //...buildPondsFromApi(hubs, devices, unhealthyDeviceIds),
                ...builtPonds,
                ...MOCK_PONDS,
            ];
            return sortPondsByCategory(allPonds);
        },
        staleTime: 1000 * 10,
        refetchInterval: 10000,
    });
};

/**
 * Toggle device on/off via API.
 * Optimistically updates local state, then invalidates on success.
 */
export const useToggleDevice = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            deviceId,
            isOn,
        }: {
            deviceId: string;
            pondId: string;
            isOn: boolean;
        }) => {
            // ==========================================
            // [TODO]: XÓA ĐOẠN BYPASS NÀY KHI CÓ THIẾT BỊ THẬT TỪ BACKEND
            if (deviceId.startsWith('mock-wrapper')) {
                MOCK_WRAPPER_IS_ON = isOn; // Lưu trạng thái ảo
                await new Promise<void>(resolve => setTimeout(() => resolve(), 500)); // Giả lập chờ 500ms
                return {} as any;
            }
            // ==========================================

            return deviceApi.toggleDevice({ deviceId });
        },
        onError: _err => {
            // Extract message from NormalizedError
            const errorMessage =
                (_err as { message?: string })?.message || 'Không thể gửi lệnh điều khiển';
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: errorMessage,
            });
        },
        onSuccess: (_data, { isOn }) => {
            Toast.show({
                type: 'success',
                text1: 'Thành công',
                text2: `${isOn ? 'Bật' : 'Tắt'} thiết bị thành công`,
                visibilityTime: 2000,
            });
            // Refetch to get updated state from server
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
            const updatedDevices = pond.devices.map(d => (d.id === deviceId ? { ...d, mode } : d));
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

        // Device Map for Codes 1-8
        const typeMap: Record<
            string,
            { type: 'feeder' | 'fan' | 'oxy' | 'syphon' | 'pump' | 'wrapper'; defaultName: string }
        > = {
            '1': { type: 'feeder' as const, defaultName: 'Máy cho ăn tự động A1' },
            '2': { type: 'syphon' as const, defaultName: 'Hệ thống Xiphong X1' },
            '3': { type: 'fan' as const, defaultName: 'Quạt nước Q1' },
            '4': { type: 'fan' as const, defaultName: 'Quạt nước Q2' },
            '5': { type: 'oxy' as const, defaultName: 'Máy thổi khí Oxy 1' },
            '6': { type: 'syphon' as const, defaultName: 'Hệ thống Xiphong X2' },
            '7': { type: 'pump' as const, defaultName: 'Máy bơm B1' },
            '8': { type: 'wrapper' as const, defaultName: 'Thiết bị nhá N1' },
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
