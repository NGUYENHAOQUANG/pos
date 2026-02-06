export interface HardwareConfig {
    deviceId: string;
    deviceName: string;
    internalDeviceId: number;
}

// Map from Local Mobile App ID -> Backend Hardware Config
export const DEVICE_HARDWARE_MAP: Record<string, HardwareConfig> = {
    // --- Ao IOT Devices ---
    // Feeders
    'IOT-FEEDER-01': { deviceId: 'test-devices-1', deviceName: 'FEEDER_1', internalDeviceId: 31 },
    'IOT-FEEDER-02': { deviceId: 'test-devices-1', deviceName: 'FEEDER_2', internalDeviceId: 32 },
    'IOT-FEEDER-03': { deviceId: 'test-devices-1', deviceName: 'FEEDER_3', internalDeviceId: 33 },

    // Oxy
    'IOT-OXY-01': { deviceId: 'test-devices-1', deviceName: 'OXY_1', internalDeviceId: 21 },
    'IOT-OXY-02': { deviceId: 'test-devices-1', deviceName: 'OXY_2', internalDeviceId: 22 },
    'IOT-OXY-03': { deviceId: 'test-devices-1', deviceName: 'OXY_3', internalDeviceId: 23 },

    // Syphon
    'IOT-SYPHON-01': { deviceId: 'test-devices-1', deviceName: 'SYPHON_1', internalDeviceId: 41 },
    'IOT-SYPHON-02': { deviceId: 'test-devices-1', deviceName: 'SYPHON_2', internalDeviceId: 42 },
    'IOT-SYPHON-03': { deviceId: 'test-devices-1', deviceName: 'SYPHON_3', internalDeviceId: 43 },

    // Fans
    'IOT-FAN-01': { deviceId: 'test-devices-1', deviceName: 'FAN_1', internalDeviceId: 11 },
    'IOT-DEV-05': { deviceId: 'test-devices-1', deviceName: 'FAN_2', internalDeviceId: 12 },
    'IOT-FAN-03': { deviceId: 'test-devices-1', deviceName: 'FAN_3', internalDeviceId: 13 },
};
