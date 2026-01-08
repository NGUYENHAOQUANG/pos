export enum EControlMode {
    MANUAL = 'MANUAL',
    SCHEDULE = 'SCHEDULE',
    LOCAL = 'LOCAL',
}

export type ControlModeType = EControlMode;
export interface DeviceStat {
    active: number;
    warning: number;
    inactive: number;
}

export interface PondDeviceStats {
    fan: DeviceStat;
    feeder: DeviceStat;
    oxy: DeviceStat;
    syphon: DeviceStat;
}

// Feeding Machine Specific Types
export interface FeedingConfig {
    runTime: number; // seconds
    stopTime: number; // minutes
}

export interface DeviceSchedule {
    id: string;
    startTime: string; // HH:mm
    endTime: string; // HH:mm
    isEnabled: boolean;
}

// Basic Pond interface for UI/Context
export interface DeviceData {
    id: string;
    name: string;
    icon: React.FC<import('react-native-svg').SvgProps>; // Using strict type
    mode: EControlMode;
    isOn: boolean;
    errorMessage?: string;
    type: 'feeder' | 'fan' | 'oxy' | 'syphon'; // Add type for filtering

    // Extended properties for persistence
    feedingConfig?: FeedingConfig;
    schedules?: DeviceSchedule[];
}

export interface Pond {
    id: string;
    name: string;
    hasDevices: boolean;
    deviceStats?: PondDeviceStats;
    devices: DeviceData[];
}
