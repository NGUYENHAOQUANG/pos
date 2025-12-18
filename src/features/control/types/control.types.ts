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

// Basic Pond interface for UI/Context
export interface DeviceData {
  id: string;
  name: string;
  icon: any; // Using any for SVG component to avoid complex import here, or generic string
  mode: EControlMode;
  isOn: boolean;
  errorMessage?: string;
  type: 'feeder' | 'fan' | 'oxy' | 'syphon'; // Add type for filtering
}

export interface Pond {
  id: string;
  name: string;
  hasDevices: boolean;
  deviceStats?: PondDeviceStats;
  devices: DeviceData[];
}
