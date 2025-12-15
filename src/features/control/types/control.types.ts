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
export interface Pond {
  id: string;
  name: string;
  hasDevices: boolean;
  deviceStats?: PondDeviceStats;
}
