import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pond, EControlMode, DeviceData, PondDeviceStats } from '../types/control.types';
import { PONDS_LIST, DEVICES_LIST } from '@/features/control/data/devicesData';
import { deviceApi, DeviceItem } from '@/features/control/api/deviceApi';

// Helper to calculate stats
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

// Helper to create device from code
const createDeviceFromCode = (
    code: string,
    name: string,
    type: 'feeder' | 'fan' | 'oxy' | 'syphon'
): DeviceData => {
    return {
        id: `new_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        mode: EControlMode.MANUAL,
        isOn: true,
        errorMessage: undefined,
        name,
        type,
    };
};

// Initialize Ponds from devicesData
const createInitialPonds = (): Pond[] => {
    return PONDS_LIST.map(pond => {
        const pondId = pond.id.trim();
        const rawDevices = DEVICES_LIST.filter(d => d.pondId.trim() === pondId);

        const devices: DeviceData[] = rawDevices.map(d => {
            const isActive = d.status === 'active';
            const isMaintenance = d.status === 'maintenance';
            const isLocal = d.mode === EControlMode.LOCAL;

            return {
                id: d.id,
                name: d.name,
                mode: d.mode,
                isOn: d.pondId === 'IOT_POND' && !isLocal ? false : isActive,
                errorMessage: isMaintenance ? 'Đang bảo trì' : undefined,
                type: d.type,
                farmId: d.farmId,
            };
        });

        return {
            id: pond.id,
            name: pond.name,
            hasDevices: devices.length > 0,
            devices: devices,
            deviceStats: calculatePondStats(devices),
        };
    });
};

// Zustand Store Interface
interface ControlStore {
    ponds: Pond[];
    addPond: () => void;
    connectDeviceToPond: (pondName: string, code?: string) => void;
    updateDeviceState: (pondId: string, deviceId: string, isOn: boolean) => void;
    updateDeviceMode: (pondId: string, deviceId: string, mode: EControlMode) => void;
    updateDeviceSettings: (pondId: string, deviceId: string, settings: Partial<DeviceData>) => void;
    fetchIoTDevices: () => Promise<void>;
}

// Zustand Store
export const useControlStore = create<ControlStore>()(
    persist(
        immer(set => ({
            ponds: createInitialPonds(),

            addPond: () => {
                // Disabled - placeholder for future implementation
            },

            connectDeviceToPond: (pondName: string, code?: string) => {
                if (!code) return;

                set(state => {
                    const pond = state.ponds.find(p => p.name === pondName);
                    if (!pond) return;

                    // Device Map for Codes 1-6
                    const typeMap: Record<
                        string,
                        {
                            type: 'feeder' | 'fan' | 'oxy' | 'syphon';
                            defaultName: string;
                        }
                    > = {
                        '1': { type: 'feeder', defaultName: 'Máy cho ăn tự động A1' },
                        '2': { type: 'syphon', defaultName: 'Hệ thống Xiphong X1' },
                        '3': { type: 'fan', defaultName: 'Quạt nước Q1' },
                        '4': { type: 'fan', defaultName: 'Quạt nước Q2' },
                        '5': { type: 'oxy', defaultName: 'Máy thổi khí Oxy 1' },
                        '6': { type: 'syphon', defaultName: 'Hệ thống Xiphong X2' },
                    };

                    let config = typeMap[code];

                    // Fallback for unknown codes
                    if (!config) {
                        config = { type: 'feeder', defaultName: `Thiết bị ${code}` };
                    }

                    // Naming Logic - append number if name exists
                    let finalName = config.defaultName;
                    const nameExists = pond.devices.some(d => d.name === config.defaultName);

                    if (nameExists) {
                        let counter = 1;
                        while (
                            pond.devices.some(d => d.name === `${config.defaultName} ${counter}`)
                        ) {
                            counter++;
                        }
                        finalName = `${config.defaultName} ${counter}`;
                    }

                    const newDevice = createDeviceFromCode(code, finalName, config.type);
                    pond.devices.push(newDevice);
                    pond.hasDevices = true;
                    pond.deviceStats = calculatePondStats(pond.devices);
                });
            },

            updateDeviceState: (pondId: string, deviceId: string, isOn: boolean) => {
                set(state => {
                    const pond = state.ponds.find(p => p.id === pondId);
                    if (!pond) return;

                    const device = pond.devices.find(d => d.id === deviceId);
                    if (device) {
                        device.isOn = isOn;
                        pond.deviceStats = calculatePondStats(pond.devices);
                    }
                });
            },

            updateDeviceMode: (pondId: string, deviceId: string, mode: EControlMode) => {
                set(state => {
                    const pond = state.ponds.find(p => p.id === pondId);
                    if (!pond) return;

                    const device = pond.devices.find(d => d.id === deviceId);
                    if (device) {
                        device.mode = mode;
                        pond.deviceStats = calculatePondStats(pond.devices);
                    }
                });
            },

            updateDeviceSettings: (
                pondId: string,
                deviceId: string,
                settings: Partial<DeviceData>
            ) => {
                set(state => {
                    const pond = state.ponds.find(p => p.id === pondId);
                    if (!pond) return;

                    const device = pond.devices.find(d => d.id === deviceId);
                    if (device) {
                        Object.assign(device, settings);
                    }
                });
            },

            fetchIoTDevices: async () => {
                try {
                    const response = await deviceApi.getDevices();
                    // response.data is the payload { success: true, data: { items: [] } }
                    // But apiClient might unwrap data? Let's check client.ts.
                    // client.ts: response interceptor returns response.
                    // So we access response.data.data.items if strictly typed.
                    // However, often people use a wrapper.
                    // Let's assume response.data is the full JSON object.
                    const data = response.data;
                    if (data?.data?.items) {
                        const items = data.data.items as DeviceItem[];
                        set(state => {
                            const pond = state.ponds.find(p => p.id === 'IOT_POND');
                            if (!pond) return;

                            const newDevices: DeviceData[] = items.map(item => {
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

                                return {
                                    id: item.id,
                                    name: item.name,
                                    type,
                                    pondId: 'IOT_POND',
                                    farmId: 'KG-01',
                                    mode: EControlMode.SCHEDULE,
                                    isOn: item.connectionStatus === 'On',
                                    errorMessage:
                                        item.installationStatus !== 'Installed'
                                            ? item.installationStatus
                                            : undefined,
                                    internalDeviceId: item.no,
                                };
                            });

                            pond.devices = newDevices;
                            pond.hasDevices = newDevices.length > 0;
                            pond.deviceStats = calculatePondStats(newDevices);
                        });
                    }
                } catch (error) {
                    console.error('Failed to fetch IoT devices:', error);
                }
            },
        })),
        {
            name: 'control-storage-v6', // Bump version to force reload initial data
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);

// Backward compatibility hook - can be used as drop-in replacement for useControl
export const useControl = () => {
    const store = useControlStore();
    return store;
};
