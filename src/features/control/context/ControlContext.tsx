import React, { createContext, useContext, useState, ReactNode } from 'react';
import { SvgProps } from 'react-native-svg';
import { Pond, EControlMode, DeviceData, PondDeviceStats } from '../types/control.types';
import FanIcon from '@/assets/Icon/IconDevices/fan.svg';
import FeederIcon from '@/assets/Icon/IconDevices/feeder.svg';
import OxyIcon from '@/assets/Icon/IconDevices/oxy.svg';
import SyphonIcon from '@/assets/Icon/IconDevices/syphon.svg';
import { PONDS_LIST, DEVICES_LIST } from '../data/devicesData';

interface ControlContextType {
    ponds: Pond[];
    addPond: () => void;
    connectDeviceToPond: (pondName: string, code?: string) => void;
    toggleDevice: (pondId: string, deviceId: string, isOn: boolean) => void;
    updateDeviceMode: (pondId: string, deviceId: string, mode: EControlMode) => void;
}

const ControlContext = createContext<ControlContextType | undefined>(undefined);

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

        // Mapping logic congruent with DeviceControlScreens logic
        // We rely on standard logic within the component or init.

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

// Initialize Ponds from devicesData
const INITIAL_PONDS: Pond[] = PONDS_LIST.map(pond => {
    const pondId = pond.id.trim();
    const rawDevices = DEVICES_LIST.filter(d => d.pondId.trim() === pondId);

    const devices: DeviceData[] = rawDevices.map(d => {
        // Map raw status to isOn/errorMessage
        // Raw: 'active', 'maintenance', 'warehouse'...
        // Context: isOn (boolean), errorMessage (string?)

        const isActive = d.status === 'active';
        const isMaintenance = d.status === 'maintenance';

        let icon: React.FC<SvgProps> = FanIcon; // Default fallback
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
            errorMessage: isMaintenance ? 'Đang bảo trì' : undefined, // Example error message
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

export const ControlProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Use INITIAL_PONDS calculated from devicesData.tsx
    const [ponds, setPonds] = useState<Pond[]>(INITIAL_PONDS);

    // removed storage useEffect

    const addPond = React.useCallback(() => {
        // Disabled
    }, []);

    const connectDeviceToPond = React.useCallback((pondName: string, code?: string) => {
        if (!code) return;

        setPonds(prevPonds =>
            prevPonds.map(p => {
                if (p.name === pondName) {
                    // 1. Define Device Map for Codes 1-6
                    const typeMap: Record<
                        string,
                        {
                            type: 'feeder' | 'fan' | 'oxy' | 'syphon';
                            defaultName: string;
                            icon: React.FC<SvgProps>;
                        }
                    > = {
                        '1': {
                            type: 'feeder',
                            defaultName: 'Máy cho ăn tự động A1',
                            icon: FeederIcon,
                        },
                        '2': {
                            type: 'syphon',
                            defaultName: 'Hệ thống Xiphong X1',
                            icon: SyphonIcon,
                        },
                        '3': { type: 'fan', defaultName: 'Quạt nước Q1', icon: FanIcon },
                        '4': { type: 'fan', defaultName: 'Quạt nước Q2', icon: FanIcon },
                        '5': { type: 'oxy', defaultName: 'Máy thổi khí Oxy 1', icon: OxyIcon },
                        '6': {
                            type: 'syphon',
                            defaultName: 'Hệ thống Xiphong X2',
                            icon: SyphonIcon,
                        },
                    };

                    const config = typeMap[code];
                    if (!config) return p;

                    const proposedName = config.defaultName;

                    // 2. Naming Logic
                    let finalName = proposedName;

                    // Check if proposedName already exists in this pond
                    const nameExists = p.devices.some(d => d.name === proposedName);

                    if (nameExists) {
                        // If name exists, append a number. e.g. "Máy cho ăn tự động A1 1", "Máy cho ăn tự động A1 2"...
                        // Or maybe user wants to count by type?
                        // "Nếu thiết bị được thêm trùng tên thì thêm sau đó số 1 2 3.."

                        let counter = 1;
                        while (p.devices.some(d => d.name === `${proposedName} ${counter}`)) {
                            counter++;
                        }
                        finalName = `${proposedName} ${counter}`;
                    }
                    // Note: We DO NOT rename existing devices anymore.

                    const newDevice = createDeviceFromCode(
                        code,
                        finalName,
                        config.icon,
                        config.type
                    );
                    if (!newDevice) return p;

                    const updatedDevices = [...p.devices, newDevice];

                    return {
                        ...p,
                        devices: updatedDevices,
                        hasDevices: true,
                        deviceStats: calculatePondStats(updatedDevices),
                    };
                }
                return p;
            })
        );
    }, []);

    const toggleDevice = React.useCallback((pondId: string, deviceId: string, isOn: boolean) => {
        setPonds(prevPonds =>
            prevPonds.map(pond => {
                if (pond.id !== pondId) return pond;

                const updatedDevices = pond.devices.map(device =>
                    device.id === deviceId ? { ...device, isOn } : device
                );

                return {
                    ...pond,
                    devices: updatedDevices,
                    deviceStats: calculatePondStats(updatedDevices),
                };
            })
        );
    }, []);

    const updateDeviceMode = React.useCallback(
        (pondId: string, deviceId: string, mode: EControlMode) => {
            setPonds(prevPonds =>
                prevPonds.map(pond => {
                    if (pond.id !== pondId) return pond;

                    const updatedDevices = pond.devices.map(device =>
                        device.id === deviceId ? { ...device, mode } : device
                    );

                    return {
                        ...pond,
                        devices: updatedDevices,
                        deviceStats: calculatePondStats(updatedDevices),
                    };
                })
            );
        },
        []
    );

    const value = React.useMemo(
        () => ({
            ponds,
            addPond,
            connectDeviceToPond,
            toggleDevice,
            updateDeviceMode,
        }),
        [ponds, addPond, connectDeviceToPond, toggleDevice, updateDeviceMode]
    );

    return <ControlContext.Provider value={value}>{children}</ControlContext.Provider>;
};

const createDeviceFromCode = (
    code: string,
    name: string,
    icon: React.FC<SvgProps>,
    type: 'feeder' | 'fan' | 'oxy' | 'syphon'
): DeviceData | null => {
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

export const useControl = () => {
    const context = useContext(ControlContext);
    if (!context) {
        throw new Error('useControl must be used within a ControlProvider');
    }
    return context;
};
