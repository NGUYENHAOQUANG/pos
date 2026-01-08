import { create } from 'zustand';
import { SvgProps } from 'react-native-svg';
import { Pond, EControlMode, DeviceData, PondDeviceStats } from '../types/control.types';
import FanIcon from '@/assets/Icon/IconDevices/fan.svg';
import FeederIcon from '@/assets/Icon/IconDevices/feeder.svg';
import OxyIcon from '@/assets/Icon/IconDevices/oxy.svg';
import SyphonIcon from '@/assets/Icon/IconDevices/syphon.svg';
import { PONDS_LIST, DEVICES_LIST } from '../data/devicesData';

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
        } else if (device.isOn) {
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
    icon: React.FC<SvgProps>,
    type: 'feeder' | 'fan' | 'oxy' | 'syphon'
): DeviceData => {
    return {
        id: `new_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        mode: EControlMode.MANUAL,
        isOn: true,
        errorMessage: undefined,
        name,
        icon,
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

            let icon: React.FC<SvgProps> = FanIcon;
            switch (d.type) {
                case 'feeder':
                    icon = FeederIcon;
                    break;
                case 'fan':
                    icon = FanIcon;
                    break;
                case 'oxy':
                    icon = OxyIcon;
                    break;
                case 'syphon':
                    icon = SyphonIcon;
                    break;
            }

            return {
                id: d.id,
                name: d.name,
                icon: icon,
                mode: d.mode,
                isOn: isActive,
                errorMessage: isMaintenance ? 'Đang bảo trì' : undefined,
                type: d.type,
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
    toggleDevice: (pondId: string, deviceId: string, isOn: boolean) => void;
    updateDeviceMode: (pondId: string, deviceId: string, mode: EControlMode) => void;
    updateDeviceSettings: (pondId: string, deviceId: string, settings: Partial<DeviceData>) => void;
}

// Zustand Store
export const useControlStore = create<ControlStore>(set => ({
    ponds: createInitialPonds(),

    addPond: () => {
        // Disabled - placeholder for future implementation
    },

    connectDeviceToPond: (pondName: string, code?: string) => {
        if (!code) return;

        set(state => ({
            ponds: state.ponds.map(p => {
                if (p.name !== pondName) return p;

                // Device Map for Codes 1-6
                const typeMap: Record<
                    string,
                    {
                        type: 'feeder' | 'fan' | 'oxy' | 'syphon';
                        defaultName: string;
                        icon: React.FC<SvgProps>;
                    }
                > = {
                    '1': { type: 'feeder', defaultName: 'Máy cho ăn tự động A1', icon: FeederIcon },
                    '2': { type: 'syphon', defaultName: 'Hệ thống Xiphong X1', icon: SyphonIcon },
                    '3': { type: 'fan', defaultName: 'Quạt nước Q1', icon: FanIcon },
                    '4': { type: 'fan', defaultName: 'Quạt nước Q2', icon: FanIcon },
                    '5': { type: 'oxy', defaultName: 'Máy thổi khí Oxy 1', icon: OxyIcon },
                    '6': { type: 'syphon', defaultName: 'Hệ thống Xiphong X2', icon: SyphonIcon },
                };

                const config = typeMap[code];
                if (!config) return p;

                // Naming Logic - append number if name exists
                let finalName = config.defaultName;
                const nameExists = p.devices.some(d => d.name === config.defaultName);

                if (nameExists) {
                    let counter = 1;
                    while (p.devices.some(d => d.name === `${config.defaultName} ${counter}`)) {
                        counter++;
                    }
                    finalName = `${config.defaultName} ${counter}`;
                }

                const newDevice = createDeviceFromCode(code, finalName, config.icon, config.type);
                const updatedDevices = [...p.devices, newDevice];

                return {
                    ...p,
                    devices: updatedDevices,
                    hasDevices: true,
                    deviceStats: calculatePondStats(updatedDevices),
                };
            }),
        }));
    },

    toggleDevice: (pondId: string, deviceId: string, isOn: boolean) => {
        set(state => ({
            ponds: state.ponds.map(pond => {
                if (pond.id !== pondId) return pond;

                const updatedDevices = pond.devices.map(device =>
                    device.id === deviceId ? { ...device, isOn } : device
                );

                return {
                    ...pond,
                    devices: updatedDevices,
                    deviceStats: calculatePondStats(updatedDevices),
                };
            }),
        }));
    },

    updateDeviceMode: (pondId: string, deviceId: string, mode: EControlMode) => {
        set(state => ({
            ponds: state.ponds.map(pond => {
                if (pond.id !== pondId) return pond;

                const updatedDevices = pond.devices.map(device =>
                    device.id === deviceId ? { ...device, mode } : device
                );

                return {
                    ...pond,
                    devices: updatedDevices,
                    deviceStats: calculatePondStats(updatedDevices),
                };
            }),
        }));
    },

    updateDeviceSettings: (pondId: string, deviceId: string, settings: Partial<DeviceData>) => {
        set(state => ({
            ponds: state.ponds.map(pond => {
                if (pond.id !== pondId) return pond;

                const updatedDevices = pond.devices.map(device =>
                    device.id === deviceId ? { ...device, ...settings } : device
                );

                return {
                    ...pond,
                    devices: updatedDevices,
                };
            }),
        }));
    },
}));

// Backward compatibility hook - can be used as drop-in replacement for useControl
export const useControl = () => {
    const store = useControlStore();
    return store;
};
