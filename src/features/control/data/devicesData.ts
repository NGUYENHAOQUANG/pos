import { TagStatus } from '@/features/menu/components/Tag';
import { EControlMode } from '@/features/control/types/control.types';
import { DeviceData as MenuDeviceData } from '@/features/menu/types/menu.types';

// Data Interface Definitions

export interface IControlDevice {
    id: string; // Device ID
    name: string; // Device Name
    type: 'feeder' | 'fan' | 'oxy' | 'syphon'; // Device Type
    pondId: string; // Pond
    farmId: string; // Farm ID
    connectDate: string; // Connection Date
    status: TagStatus; // Status
    mode: EControlMode; // Current Mode
}

export interface IPond {
    id: string; // Pond ID
    name: string; // Pond Name
}

export interface IActivityHistory {
    id: string; // Activity ID
    deviceId: string; // Device ID
    pondId: string; // Pond
    date: string; // Date
    startTime: string; // Start Time
    endTime: string; // End Time
    status: 'Hoạt động' | 'Không hoạt động'; // Status (Active / Inactive)
    note: string; // Note
}

export interface ISensorData {
    id: string; // Sensor ID
    pondId: string; // Pond
    date: string; // Date
    temperature: number; // Temperature (°C)
    humidity: number; // Humidity
    oxygen: number; // Oxygen (mg/L)
    co: number; // CO (ppm)
    no2: number; // NO2 (ppm)
    so2: number; // SO2 (ppm)
    feedAmount: number; // Feed Amount (kg)
}

export interface IErrorLog {
    deviceName: string; // Device Name
    deviceId: string; // Device ID
    errorCode: string; // Error Code
    errorTime: string; // Error Time
    location: string; // Location
    errorDetail: string; // Error Detail
    technician: string; // Technician
    processStatus:
        | 'Đang sửa chữa'
        | 'Chờ linh kiện'
        | 'Đã khắc phục'
        | 'Đã kiểm tra'
        | 'Đã đặt lịch'; // Process Status
}

export interface IMaintenanceDevice extends MenuDeviceData {
    installationDate: string; // Installation Date
    warehouseStatus: string; // Warehouse Status
}

export interface IInstallationHistory {
    deviceId: string; // Device ID
    deviceName: string; // Device Name
    location: string; // Installation Location (Pond)
    date: string; // Installation Date
    limitUsageDays: number; // Usage Limit (Days)
    limitOperatingHours: number; // Operating Limit (Hours)
    technician: string; // Technician
}

export interface IMaintenanceHistory {
    deviceId: string; // Device ID
    deviceName: string; // Device Name
    startDate: string; // Start Date
    endDate: string; // End Date
    reason: string; // Maintenance Reason
    operatingHoursAtFault: number; // Operating Hours at Fault
    usageDaysAtFault: number; // Usage Days at Fault
    estimatedCost: string; // Estimated Cost
}

// Sample Data

// 0. Pond List
export const PONDS_LIST: IPond[] = [
    {
        id: 'IOT_POND',
        name: 'Ao IOT',
    },
    {
        id: 'N01',
        name: 'Ao N01',
    },
    {
        id: 'N02',
        name: 'Ao N02',
    },
    {
        id: 'N03',
        name: 'Ao N03',
    },
    // Mock Demo Ponds
    { id: 'N001', name: 'Ao N001' },
    { id: 'N002', name: 'Ao N002' },
    { id: 'N003', name: 'Ao N003' },
];

// 1. Device List
export const DEVICES_LIST: IControlDevice[] = [
    // --- Ao IOT Devices ---
    // Feeders
    {
        id: 'IOT-FEEDER-01',
        name: 'Máy cho ăn 1',
        type: 'feeder',
        pondId: 'IOT_POND',
        farmId: 'KG-01',
        connectDate: '1/12/2025',
        status: 'active',
        mode: EControlMode.MANUAL,
    },
    {
        id: 'IOT-FEEDER-02',
        name: 'Máy cho ăn 2',
        type: 'feeder',
        pondId: 'IOT_POND',
        farmId: 'KG-01',
        connectDate: '1/12/2025',
        status: 'active',
        mode: EControlMode.MANUAL,
    },
    {
        id: 'IOT-FEEDER-03',
        name: 'Máy cho ăn 3',
        type: 'feeder',
        pondId: 'IOT_POND',
        farmId: 'KG-01',
        connectDate: '1/12/2025',
        status: 'active',
        mode: EControlMode.MANUAL,
    },
    // Oxy
    {
        id: 'IOT-OXY-01',
        name: 'Máy sục khí oxy 1',
        type: 'oxy',
        pondId: 'IOT_POND',
        farmId: 'KG-01',
        connectDate: '1/12/2025',
        status: 'active',
        mode: EControlMode.MANUAL,
    },
    {
        id: 'IOT-OXY-02',
        name: 'Máy sục khí oxy 2',
        type: 'oxy',
        pondId: 'IOT_POND',
        farmId: 'KG-01',
        connectDate: '1/12/2025',
        status: 'active',
        mode: EControlMode.MANUAL,
    },
    {
        id: 'IOT-OXY-03',
        name: 'Máy sục khí oxy 3',
        type: 'oxy',
        pondId: 'IOT_POND',
        farmId: 'KG-01',
        connectDate: '1/12/2025',
        status: 'active',
        mode: EControlMode.LOCAL,
    },
    // Syphon
    {
        id: 'IOT-SYPHON-01',
        name: 'Syphon 1',
        type: 'syphon',
        pondId: 'IOT_POND',
        farmId: 'KG-01',
        connectDate: '1/12/2025',
        status: 'active',
        mode: EControlMode.MANUAL,
    },
    {
        id: 'IOT-SYPHON-02',
        name: 'Syphon 2',
        type: 'syphon',
        pondId: 'IOT_POND',
        farmId: 'KG-01',
        connectDate: '1/12/2025',
        status: 'active',
        mode: EControlMode.MANUAL,
    },
    {
        id: 'IOT-SYPHON-03',
        name: 'Syphon 3',
        type: 'syphon',
        pondId: 'IOT_POND',
        farmId: 'KG-01',
        connectDate: '1/12/2025',
        status: 'active',
        mode: EControlMode.MANUAL,
    },
    // Fans
    {
        id: 'IOT-FAN-01',
        name: 'Quạt nước 1',
        type: 'fan',
        pondId: 'IOT_POND',
        farmId: 'KG-01',
        connectDate: '1/12/2025',
        status: 'active',
        mode: EControlMode.MANUAL,
    },
    {
        id: 'IOT-DEV-05', // Keeping ID for API mapping test
        name: 'Quạt nước 2',
        type: 'fan',
        pondId: 'IOT_POND',
        farmId: 'KG-01',
        connectDate: '1/12/2025',
        status: 'active',
        mode: EControlMode.MANUAL,
    },
    {
        id: 'IOT-FAN-03',
        name: 'Quạt nước 3',
        type: 'fan',
        pondId: 'IOT_POND',
        farmId: 'KG-01',
        connectDate: '1/12/2025',
        status: 'active',
        mode: EControlMode.MANUAL,
    },
    // --- End Ao IOT Devices ---
    {
        id: 'TB-001',

        name: 'Máy cho ăn tự động A1',
        type: 'feeder',
        pondId: 'N01',
        farmId: 'KG-01',
        connectDate: '1/12/2025',
        status: 'active',
        mode: EControlMode.SCHEDULE,
    },
    {
        id: 'TB-002',
        name: 'Hệ thống Xiphong X1',
        type: 'syphon',
        pondId: 'N01',
        farmId: 'KG-01',
        connectDate: '1/12/2025',
        status: 'active',
        mode: EControlMode.MANUAL,
    },
    // Adding more devices to N01 to make the chart look interesting as per user request
    {
        id: 'TB-011',
        name: 'Quạt nước Q1',
        type: 'fan',
        pondId: 'N01',
        farmId: 'KG-01',
        connectDate: '1/12/2025',
        status: 'active',
        mode: EControlMode.SCHEDULE,
    },
    {
        id: 'TB-012',
        name: 'Quạt nước Q2',
        type: 'fan',
        pondId: 'N01',
        farmId: 'KG-01',
        connectDate: '1/12/2025',
        status: 'active',
        mode: EControlMode.LOCAL,
    },
    {
        id: 'TB-013',
        name: 'Máy thổi khí Oxy 1',
        type: 'oxy',
        pondId: 'N01',
        farmId: 'KG-01',
        connectDate: '1/12/2025',
        status: 'active',
        mode: EControlMode.SCHEDULE,
    },
    // New Feeder for N03
    {
        id: 'TB-014',
        name: 'Máy cho ăn tự động A3',
        type: 'feeder',
        pondId: 'N03',
        farmId: 'KG-01',
        connectDate: '26/12/2025',
        status: 'active',
        mode: EControlMode.SCHEDULE,
    },
    {
        id: 'TB-003',
        name: 'Quạt nước Q1',
        type: 'fan',
        pondId: 'N02',
        farmId: 'KG-01',
        connectDate: '1/12/2025',
        status: 'active',
        mode: EControlMode.SCHEDULE, // Scheduled -> Schedule
    },
    {
        id: 'TB-004',
        name: 'Máy thổi khí Oxy 1',
        type: 'oxy',
        pondId: 'N03',
        farmId: 'KG-01',
        connectDate: '1/12/2025',
        status: 'active',
        mode: EControlMode.SCHEDULE, // Schedule
    },
    {
        id: 'TB-005',
        name: 'Máy cho ăn tự động A2',
        type: 'feeder',
        pondId: 'N02',
        farmId: 'KG-01',
        connectDate: '1/12/2025',
        status: 'maintenance',
        mode: EControlMode.MANUAL, // Manual (App)
    },
    {
        id: 'TB-006',
        name: 'Hệ thống Xiphong X2',
        type: 'syphon',
        pondId: 'N01',
        farmId: 'KG-01',
        connectDate: '1/12/2025',
        status: 'active',
        mode: EControlMode.SCHEDULE, // Scheduled
    },
    {
        id: 'TB-007',
        name: 'Quạt nước Q2',
        type: 'fan',
        pondId: 'N02',
        farmId: 'KG-01',
        connectDate: '1/12/2025',
        status: 'active',
        mode: EControlMode.SCHEDULE, // Schedule
    },
    // --- MOCK DEMO DEVICES (N001, N002, N003) ---
    // N001
    {
        id: 'TB-N001-01',
        name: 'Máy cho ăn tự động A1',
        type: 'feeder',
        pondId: 'N001',
        farmId: 'KG-01',
        connectDate: '1/12/2025',
        status: 'active',
        mode: EControlMode.SCHEDULE,
    },
    {
        id: 'TB-N001-02',
        name: 'Quạt nước Q1',
        type: 'fan',
        pondId: 'N001',
        farmId: 'KG-01',
        connectDate: '1/12/2025',
        status: 'active',
        mode: EControlMode.LOCAL,
    },
    {
        id: 'TB-N001-03',
        name: 'Máy thổi khí Oxy 1',
        type: 'oxy',
        pondId: 'N001',
        farmId: 'KG-01',
        connectDate: '1/12/2025',
        status: 'active',
        mode: EControlMode.SCHEDULE,
    },
    {
        id: 'TB-N001-04',
        name: 'Hệ thống Xiphong X1',
        type: 'syphon',
        pondId: 'N001',
        farmId: 'KG-01',
        connectDate: '1/12/2025',
        status: 'active',
        mode: EControlMode.MANUAL,
    },
    // N002
    {
        id: 'TB-N002-01',
        name: 'Hệ thống Xiphong X1',
        type: 'syphon',
        pondId: 'N002',
        farmId: 'KG-01',
        connectDate: '1/12/2025',
        status: 'active',
        mode: EControlMode.MANUAL,
    },
    {
        id: 'TB-N002-02',
        name: 'Quạt nước Q1',
        type: 'fan',
        pondId: 'N002',
        farmId: 'KG-01',
        connectDate: '1/12/2025',
        status: 'active',
        mode: EControlMode.SCHEDULE,
    },
    {
        id: 'TB-N002-03',
        name: 'Máy cho ăn tự động A1',
        type: 'feeder',
        pondId: 'N002',
        farmId: 'KG-01',
        connectDate: '1/12/2025',
        status: 'active',
        mode: EControlMode.MANUAL,
    },
    {
        id: 'TB-N002-04',
        name: 'Máy thổi khí Oxy 1',
        type: 'oxy',
        pondId: 'N002',
        farmId: 'KG-01',
        connectDate: '1/12/2025',
        status: 'active',
        mode: EControlMode.SCHEDULE,
    },
    // N003
    {
        id: 'TB-N003-01',
        name: 'Máy cho ăn tự động A1',
        type: 'feeder',
        pondId: 'N003',
        farmId: 'KG-01',
        connectDate: '1/12/2025',
        status: 'maintenance',
        mode: EControlMode.MANUAL,
    },
    {
        id: 'TB-N003-02',
        name: 'Máy thổi khí Oxy 1',
        type: 'oxy',
        pondId: 'N003',
        farmId: 'KG-01',
        connectDate: '1/12/2025',
        status: 'active',
        mode: EControlMode.SCHEDULE,
    },
    {
        id: 'TB-N003-03',
        name: 'Quạt nước Q1',
        type: 'fan',
        pondId: 'N003',
        farmId: 'KG-01',
        connectDate: '1/12/2025',
        status: 'active',
        mode: EControlMode.LOCAL,
    },
    {
        id: 'TB-N003-04',
        name: 'Hệ thống Xiphong X1',
        type: 'syphon',
        pondId: 'N003',
        farmId: 'KG-01',
        connectDate: '1/12/2025',
        status: 'active',
        mode: EControlMode.MANUAL,
    },
];

// 2. Activity History
export interface IActivityHistory {
    id: string; // Activity ID
    deviceId: string; // Device ID
    pondId: string; // Pond
    date: string; // Date
    startTime: string; // Start Time
    endTime: string; // End Time
    status: 'Hoạt động' | 'Không hoạt động'; // Status (Active / Inactive)
    note: string; // Note
}

export interface IModeHistory {
    deviceId: string; // Device ID
    date: string; // Date
    startTime: string; // Start Time
    endTime: string; // End Time
    mode: 'remote' | 'schedule' | 'local';
}

// 2. Activity History
export const ACTIVITY_HISTORY: IActivityHistory[] = [
    // Feeder (TB-001) - Blue bars
    {
        id: 'LS-01',
        deviceId: 'TB-001',
        pondId: 'N01',
        date: '25/12/2025',
        startTime: '00:00',
        endTime: '00:15',
        status: 'Hoạt động',
        note: '',
    },
    {
        id: 'LS-02',
        deviceId: 'TB-001',
        pondId: 'N01',
        date: '25/12/2025',
        startTime: '00:30',
        endTime: '00:45',
        status: 'Hoạt động',
        note: '',
    },
    {
        id: 'LS-03',
        deviceId: 'TB-001',
        pondId: 'N01',
        date: '25/12/2025',
        startTime: '01:30',
        endTime: '01:45',
        status: 'Hoạt động',
        note: '',
    },
    {
        id: 'LS-04',
        deviceId: 'TB-001',
        pondId: 'N01',
        date: '25/12/2025',
        startTime: '02:15',
        endTime: '02:30',
        status: 'Hoạt động',
        note: '',
    },
    {
        id: 'LS-05',
        deviceId: 'TB-001',
        pondId: 'N01',
        date: '25/12/2025',
        startTime: '03:00',
        endTime: '03:15',
        status: 'Hoạt động',
        note: '',
    },
    {
        id: 'LS-06',
        deviceId: 'TB-001',
        pondId: 'N01',
        date: '25/12/2025',
        startTime: '03:45',
        endTime: '04:00',
        status: 'Hoạt động',
        note: '',
    },
    {
        id: 'LS-07',
        deviceId: 'TB-001',
        pondId: 'N01',
        date: '25/12/2025',
        startTime: '04:30',
        endTime: '04:45',
        status: 'Hoạt động',
        note: '',
    },

    // Oxy 1 (TB-003 or TB-004? TB-003 is Fan Q1 in device list but raw error logs said Oxy. Let's stick to DEVICE_LIST logic. TB-004 is Oxy 1 in DEVICE_LIST)
    // Actually, let's just make sure we use IDs that exist in the pond we are testing (N01).
    // In N01: TB-001 (Feeder A1), TB-002 (Syphon X1), TB-006 (Syphon X2).
    // Wait, the user wants data for "Ao 1" (N01).
    // But the image shows multiple Fans and Oxys.
    // The previous DEVICE_LIST for N01 only had Feeder and Syphons.
    // I should probably ADD more devices to N01 in DEVICE_LIST to match the rich chart user expects, OR adjust the Mock Data to match N01's actual devices.
    // User said "Mock data vào lịch sử hoạt động luôn đi".
    // I will use device IDs from the existing N01 list, and maybe assume user is looking at N01 or N02.
    // Let's add more devices to N01 in DEVICE_LIST so the chart looks populated like the image.
    // Actually for now, I'll just populate activity for the devices that ARE in N01, and if needed add 'Virtual' devices for the chart demo if the user insists on matching the image exactly.
    // The image key: Feeder 1, Oxy 1, Oxy 2, Fan 1, Fan 2, Fan 3, Syphon 1.
    // My N01 only has Feeder 1, Syphon 1, Syphon 2.
    // I will add dummy activity for N01 devices.

    // Feeder A1 (TB-001)
    {
        id: 'LS-10',
        deviceId: 'TB-001',
        pondId: 'N01',
        date: '25/12/2025',
        startTime: '06:00',
        endTime: '06:15',
        status: 'Hoạt động',
        note: '',
    },

    // Syphon X1 (TB-002)
    {
        id: 'LS-20',
        deviceId: 'TB-002',
        pondId: 'N01',
        date: '25/12/2025',
        startTime: '06:00',
        endTime: '07:00',
        status: 'Hoạt động',
        note: '',
    },

    // Syphon X2 (TB-006)
    {
        id: 'LS-30',
        deviceId: 'TB-006',
        pondId: 'N01',
        date: '25/12/2025',
        startTime: '15:00',
        endTime: '16:00',
        status: 'Hoạt động',
        note: '',
    },

    // Fan Q1 (TB-011)
    {
        id: 'LS-40',
        deviceId: 'TB-011',
        pondId: 'N01',
        date: '25/12/2025',
        startTime: '00:00',
        endTime: '03:00',
        status: 'Hoạt động',
        note: '',
    },
    {
        id: 'LS-41',
        deviceId: 'TB-011',
        pondId: 'N01',
        date: '25/12/2025',
        startTime: '06:00',
        endTime: '09:00',
        status: 'Hoạt động',
        note: '',
    },

    // Fan Q2 (TB-012)
    {
        id: 'LS-50',
        deviceId: 'TB-012',
        pondId: 'N01',
        date: '25/12/2025',
        startTime: '04:00',
        endTime: '06:00',
        status: 'Hoạt động',
        note: '',
    },
    {
        id: 'LS-51',
        deviceId: 'TB-012',
        pondId: 'N01',
        date: '25/12/2025',
        startTime: '12:00',
        endTime: '15:00',
        status: 'Hoạt động',
        note: '',
    },

    // Oxy 1 (TB-013)
    {
        id: 'LS-60',
        deviceId: 'TB-013',
        pondId: 'N01',
        date: '25/12/2025',
        startTime: '00:45',
        endTime: '03:00',
        status: 'Hoạt động',
        note: '',
    },
    {
        id: 'LS-61',
        deviceId: 'TB-013',
        pondId: 'N01',
        date: '25/12/2025',
        startTime: '08:00',
        endTime: '11:00',
        status: 'Hoạt động',
        note: '',
    },

    // --- Pond N02 Data ---
    // TB-003 (Fan Q1 - N02)
    {
        id: 'LS-N02-01',
        deviceId: 'TB-003',
        pondId: 'N02',
        date: '25/12/2025',
        startTime: '01:00',
        endTime: '04:00',
        status: 'Hoạt động',
        note: '',
    },
    {
        id: 'LS-N02-02',
        deviceId: 'TB-003',
        pondId: 'N02',
        date: '25/12/2025',
        startTime: '18:00',
        endTime: '22:00',
        status: 'Hoạt động',
        note: '',
    },

    // TB-005 (Feeder A2 - N02)
    {
        id: 'LS-N02-03',
        deviceId: 'TB-005',
        pondId: 'N02',
        date: '25/12/2025',
        startTime: '07:00',
        endTime: '07:15',
        status: 'Hoạt động',
        note: '',
    },
    {
        id: 'LS-N02-04',
        deviceId: 'TB-005',
        pondId: 'N02',
        date: '25/12/2025',
        startTime: '11:00',
        endTime: '11:15',
        status: 'Hoạt động',
        note: '',
    },
    {
        id: 'LS-N02-05',
        deviceId: 'TB-005',
        pondId: 'N02',
        date: '25/12/2025',
        startTime: '17:00',
        endTime: '17:15',
        status: 'Hoạt động',
        note: '',
    },

    // --- Pond N03 Data ---
    // TB-014 (Feeder A3 - N03)
    {
        id: 'LS-N03-01',
        deviceId: 'TB-014',
        pondId: 'N03',
        date: '25/12/2025',
        startTime: '06:30',
        endTime: '06:45',
        status: 'Hoạt động',
        note: '',
    },
    {
        id: 'LS-N03-02',
        deviceId: 'TB-014',
        pondId: 'N03',
        date: '25/12/2025',
        startTime: '12:30',
        endTime: '12:45',
        status: 'Hoạt động',
        note: '',
    },
    {
        id: 'LS-N03-03',
        deviceId: 'TB-014',
        pondId: 'N03',
        date: '25/12/2025',
        startTime: '16:30',
        endTime: '16:45',
        status: 'Hoạt động',
        note: '',
    },
];

export const MODE_HISTORY: IModeHistory[] = [
    // TB-001 (Feeder) usually purely Remote/schedule.
    {
        deviceId: 'TB-001',
        date: '25/12/2025',
        startTime: '00:00',
        endTime: '24:00',
        mode: 'remote',
    }, // Blue background

    // TB-002 (Syphon)
    {
        deviceId: 'TB-002',
        date: '25/12/2025',
        startTime: '00:00',
        endTime: '03:00',
        mode: 'schedule',
    }, // Yellow
    { deviceId: 'TB-002', date: '25/12/2025', startTime: '03:00', endTime: '24:00', mode: 'local' }, // Green

    // TB-006 (Syphon X2)
    {
        deviceId: 'TB-006',
        date: '25/12/2025',
        startTime: '00:00',
        endTime: '05:00',
        mode: 'schedule',
    },
    { deviceId: 'TB-006', date: '25/12/2025', startTime: '05:00', endTime: '24:00', mode: 'local' },

    // TB-011 (Fan Q1) - Schedule then Local
    {
        deviceId: 'TB-011',
        date: '25/12/2025',
        startTime: '00:00',
        endTime: '03:00',
        mode: 'schedule',
    },
    { deviceId: 'TB-011', date: '25/12/2025', startTime: '03:00', endTime: '24:00', mode: 'local' },

    // TB-012 (Fan Q2) - All Local
    { deviceId: 'TB-012', date: '25/12/2025', startTime: '00:00', endTime: '24:00', mode: 'local' },

    // TB-013 (Oxy 1) - Remote then Schedule
    {
        deviceId: 'TB-013',
        date: '25/12/2025',
        startTime: '00:00',
        endTime: '06:00',
        mode: 'remote',
    },
    {
        deviceId: 'TB-013',
        date: '25/12/2025',
        startTime: '06:00',
        endTime: '24:00',
        mode: 'schedule',
    },

    // --- Pond N02 ---
    // TB-003 (Fan Q1 - N02)
    {
        deviceId: 'TB-003',
        date: '25/12/2025',
        startTime: '00:00',
        endTime: '24:00',
        mode: 'schedule',
    },

    // TB-005 (Feeder A2 - N02)
    {
        deviceId: 'TB-005',
        date: '25/12/2025',
        startTime: '00:00',
        endTime: '24:00',
        mode: 'remote',
    },

    // --- Pond N03 ---
    // TB-014 (Feeder A3 - N03)
    {
        deviceId: 'TB-014',
        date: '25/12/2025',
        startTime: '00:00',
        endTime: '24:00',
        mode: 'remote',
    },
];

// 3. Sensor Data
export const SENSOR_DATA: ISensorData[] = [
    {
        id: 'CB-001',
        pondId: 'N01',
        date: '12/12/2025',
        temperature: 29.5,
        humidity: 0.75,
        oxygen: 5.8,
        co: 0.3,
        no2: 0.02,
        so2: 0.01,
        feedAmount: 15.5,
    },
    {
        id: 'CB-002',
        pondId: 'N01',
        date: '12/12/2025',
        temperature: 30.0,
        humidity: 0.7,
        oxygen: 6.2,
        co: 0.2,
        no2: 0.01,
        so2: 0.01,
        feedAmount: 0,
    },
    {
        id: 'CB-003',
        pondId: 'N02',
        date: '12/12/2025',
        temperature: 28.0,
        humidity: 0.8,
        oxygen: 4.5,
        co: 0.4,
        no2: 0.03,
        so2: 0.02,
        feedAmount: 12,
    },
    {
        id: 'CB-004',
        pondId: 'N03',
        date: '12/12/2025',
        temperature: 27.5,
        humidity: 0.78,
        oxygen: 5.0,
        co: 0.3,
        no2: 0.02,
        so2: 0.01,
        feedAmount: 25,
    },
    {
        id: 'CB-005',
        pondId: 'N02',
        date: '12/12/2025',
        temperature: 29.0,
        humidity: 0.76,
        oxygen: 5.5,
        co: 0.2,
        no2: 0.01,
        so2: 0.01,
        feedAmount: 0,
    },
];

// 4. Error List
export const ERROR_LOGS: IErrorLog[] = [
    {
        deviceName: 'Máy thổi khí Oxy 1',
        deviceId: 'TB-003', // Note: Raw data said TB-003 for Oxy 1, but in Device list TB-004 is Oxy 1. User data inconsistency? Following raw data exactly: "Máy thổi khí Oxy 1	TB-003". Wait, raw device list says TB-003 is Quạt nước Q1. Raw Error list says TB-003 is Máy thổi khí Oxy 1. I will follow raw Error list but this is suspicious.
        errorCode: 'ERR-PUMP-01',
        errorTime: '12/12/2025',
        location: 'Ao N02',
        errorDetail: 'Áp suất khí thấp, rò rỉ đường ống',
        technician: 'Nguyễn Văn An',
        processStatus: 'Đang sửa chữa',
    },
    {
        deviceName: 'Máy cho ăn tự động A2',
        deviceId: 'TB-005',
        errorCode: 'ERR-FEED-02',
        errorTime: '12/12/2025',
        location: 'Ao N02',
        errorDetail: 'Kẹt motor phun thức ăn',
        technician: 'Trần Minh Tâm',
        processStatus: 'Chờ linh kiện',
    },
    {
        deviceName: 'Quạt nước Q2',
        deviceId: 'TB-007',
        errorCode: 'WRN-ELEC-05',
        errorTime: '12/12/2025',
        location: 'Ao N02',
        errorDetail: 'Dòng điện quá tải, nóng motor',
        technician: 'Nguyễn Văn An',
        processStatus: 'Đã khắc phục',
    },
    {
        deviceName: 'Hệ thống Xiphong X2',
        deviceId: 'TB-006',
        errorCode: 'ERR-VALVE-03',
        errorTime: '11/12/2025',
        location: 'Ao N01',
        errorDetail: 'Van xả không đóng kín',
        technician: 'Lê Văn Đức',
        processStatus: 'Đã kiểm tra',
    },
    {
        deviceName: 'Máy thổi khí Oxy 2',
        deviceId: 'TB-008',
        errorCode: 'WRN-TIME-09',
        errorTime: '13/12/2025 10:00',
        location: 'Ao N02',
        errorDetail: 'Đến hạn thay dầu định kỳ',
        technician: 'Trần Minh Tâm',
        processStatus: 'Đã đặt lịch',
    },
];

// 5. Maintenance Management
export const MAINTENANCE_DEVICES: IMaintenanceDevice[] = [
    {
        id: 'TB-001',
        name: 'Máy cho ăn tự động A1',
        type: 'Máy cho ăn',
        status: 'installed', // Installed
        importDate: '10/12/2025', // Should be separate from connectDate? Raw data: "Ngày lắp đặt" is 10/12/2025. Menu DeviceData has importDate.
        installationDate: '10/12/2025',
        totalRunTime: '28 giờ', // Actual runtime
        maintenance: {
            operatingTime: {
                current: 28,
                limit: 30,
            },
            usageTime: {
                current: 14,
                limit: 20,
            },
        },
        warehouseStatus: 'Mới',
    },
    {
        id: 'TB-002',
        name: 'Hệ thống Xiphong X1',
        type: 'Xiphong',
        status: 'warehouse', // Warehouse
        importDate: '10/12/2025',
        installationDate: '10/12/2025',
        totalRunTime: '15 giờ',
        maintenance: {
            operatingTime: {
                current: 15,
                limit: 30,
            },
            usageTime: {
                current: 12,
                limit: 20,
            },
        },
        warehouseStatus: 'Đã sử dụng',
    },
    {
        id: 'TB-003',
        name: 'Quạt nước Q1',
        type: 'Quạt nước',
        status: 'installed', // Installed
        importDate: '5/12/2025',
        installationDate: '5/12/2025',
        totalRunTime: '30 giờ',
        maintenance: {
            operatingTime: {
                current: 30,
                limit: 30,
            },
            usageTime: {
                current: 20,
                limit: 20,
            },
        },
        warehouseStatus: 'Mới',
    },
    {
        id: 'TB-004',
        name: 'Máy thổi khí Oxy 1',
        type: 'Máy thổi khí',
        status: 'maintenance', // Maintenance
        importDate: '1/12/2025',
        installationDate: '1/12/2025',
        totalRunTime: '30 giờ',
        maintenance: {
            operatingTime: {
                current: 30,
                limit: 30,
            },
            usageTime: {
                current: 20,
                limit: 20,
            },
        },
        warehouseStatus: 'Đã sử dụng',
    },
    {
        id: 'TB-005',
        name: 'Máy cho ăn tự động A2',
        type: 'Máy cho ăn',
        status: 'maintenance',
        importDate: '10/12/2025',
        installationDate: '10/12/2025',
        totalRunTime: '30 giờ',
        maintenance: {
            operatingTime: {
                current: 30,
                limit: 30,
            },
            usageTime: {
                current: 20,
                limit: 20,
            },
        },
        warehouseStatus: 'Đã sử dụng',
    },
    {
        id: 'TB-006',
        name: 'Hệ thống Xiphong X2',
        type: 'Xiphong',
        status: 'warehouse',
        importDate: '15/12/2025',
        installationDate: '15/12/2025',
        totalRunTime: '8 giờ',
        maintenance: {
            operatingTime: {
                current: 8,
                limit: 30,
            },
            usageTime: {
                current: 9,
                limit: 20,
            },
        },
        warehouseStatus: 'Mới',
    },
    {
        id: 'TB-007',
        name: 'Quạt nước Q2',
        type: 'Quạt nước',
        status: 'installed',
        importDate: '12/12/2025',
        installationDate: '12/12/2025',
        totalRunTime: '30 giờ',
        maintenance: {
            operatingTime: {
                current: 30,
                limit: 30,
            },
            usageTime: {
                current: 19,
                limit: 20,
            },
        },
        warehouseStatus: 'Mới',
    },
    {
        id: 'TB-008',
        name: 'Máy thổi khí Oxy 2',
        type: 'Máy thổi khí',
        status: 'installed',
        importDate: '12/12/2025',
        installationDate: '12/12/2025',
        totalRunTime: '30 giờ',
        maintenance: {
            operatingTime: {
                current: 30,
                limit: 30,
            },
            usageTime: {
                current: 20,
                limit: 20,
            },
        },
        warehouseStatus: 'Đã sử dụng',
    },
];

// 6. Installation History
export const INSTALLATION_HISTORY: IInstallationHistory[] = [
    {
        deviceId: 'TB-001',
        deviceName: 'Máy cho ăn tự động A1',
        location: 'N01',
        date: '10/12/2025',
        limitUsageDays: 20,
        limitOperatingHours: 30,
        technician: 'Nguyễn Văn An',
    },
    {
        deviceId: 'TB-003',
        deviceName: 'Quạt nước Q1',
        location: 'N01',
        date: '1/12/2025',
        limitUsageDays: 20,
        limitOperatingHours: 30,
        technician: 'Trần Minh Tâm',
    },
    {
        deviceId: 'TB-004',
        deviceName: 'Máy thổi khí Oxy 1',
        location: 'N02',
        date: '20/11/2025',
        limitUsageDays: 20,
        limitOperatingHours: 30,
        technician: 'Lê Văn Đức',
    },
    {
        deviceId: 'TB-007',
        deviceName: 'Quạt nước Q2',
        location: 'N02',
        date: '5/12/2025',
        limitUsageDays: 20,
        limitOperatingHours: 30,
        technician: 'Nguyễn Văn An',
    },
];

// 7. Device Maintenance History
export const MAINTENANCE_HISTORY: IMaintenanceHistory[] = [
    {
        deviceId: 'TB-004',
        deviceName: 'Máy thổi khí Oxy 1',
        startDate: '24/12/2025',
        endDate: '25/12/2025',
        reason: 'Vượt mức giới hạn ngày',
        operatingHoursAtFault: 30,
        usageDaysAtFault: 20,
        estimatedCost: '200,000đ',
    },
    {
        deviceId: 'TB-005',
        deviceName: 'Máy cho ăn tự động A2',
        startDate: '22/12/2025',
        endDate: '24/12/2025',
        reason: 'Lỗi kết nối App',
        operatingHoursAtFault: 30,
        usageDaysAtFault: 20,
        estimatedCost: '150,000đ',
    },
    {
        deviceId: 'TB-003',
        deviceName: 'Quạt nước Q1',
        startDate: '24/12/2025',
        endDate: '24/12/2025',
        reason: 'Thay dây curoa định kỳ',
        operatingHoursAtFault: 30,
        usageDaysAtFault: 20,
        estimatedCost: '100,000đ',
    },
];

// 8. Sensor Statistics
export interface ISensorStatistic {
    id: string; // Sensor ID
    pondId: string; // Pond
    date: string; // Date
    time: string; // Time (HH:mm)
    temperature: number; // Temperature (°C)
    humidity: number; // Humidity
    oxygen: number; // Oxygen (mg/L)
    co: number; // CO (ppm)
    no2: number; // NO2 (ppm)
    so2: number; // SO2 (ppm)
    feedAmount: number; // Actual Feed Amount (kg)
    plannedFeedAmount: number; // Planned Feed Amount (kg)
}

export const SENSOR_STATISTICS: ISensorStatistic[] = [
    // N01 - CB-001 (06:00)
    {
        id: 'CB-001',
        pondId: 'N01',
        date: '12/12/2025',
        time: '06:00',
        temperature: 29.5,
        humidity: 0.75,
        oxygen: 5.8,
        co: 0.3,
        no2: 0.02,
        so2: 0.01,
        feedAmount: 15.5,
        plannedFeedAmount: 16.0,
    },
    // N01 - Generated (08:00)
    {
        id: 'CB-GEN-01',
        pondId: 'N01',
        date: '12/12/2025',
        time: '08:00',
        temperature: 29.8,
        humidity: 0.72,
        oxygen: 5.5,
        co: 0.25,
        no2: 0.02,
        so2: 0.01,
        feedAmount: 14.0,
        plannedFeedAmount: 14.0,
    },
    // N01 - CB-002 (10:00) - 0kg
    {
        id: 'CB-002',
        pondId: 'N01',
        date: '12/12/2025',
        time: '10:00',
        temperature: 30.0,
        humidity: 0.7,
        oxygen: 6.2,
        co: 0.2,
        no2: 0.01,
        so2: 0.01,
        feedAmount: 0,
        plannedFeedAmount: 15.0, // Planned was 15, but actual 0 (maybe skipped)
    },
    // N01 - Generated (14:00)
    {
        id: 'CB-GEN-02',
        pondId: 'N01',
        date: '12/12/2025',
        time: '14:00',
        temperature: 30.5,
        humidity: 0.65,
        oxygen: 5.0,
        co: 0.2,
        no2: 0.01,
        so2: 0.01,
        feedAmount: 15.0,
        plannedFeedAmount: 15.0,
    },
    // N01 - Generated (18:00)
    {
        id: 'CB-GEN-03',
        pondId: 'N01',
        date: '12/12/2025',
        time: '18:00',
        temperature: 28.5,
        humidity: 0.8,
        oxygen: 4.8,
        co: 0.3,
        no2: 0.02,
        so2: 0.01,
        feedAmount: 16.5,
        plannedFeedAmount: 16.0,
    },

    // N02 - CB-003 (07:00)
    {
        id: 'CB-003',
        pondId: 'N02',
        date: '12/12/2025',
        time: '07:00',
        temperature: 28.0,
        humidity: 0.8,
        oxygen: 4.5,
        co: 0.4,
        no2: 0.03,
        so2: 0.02,
        feedAmount: 12,
        plannedFeedAmount: 12,
    },
    // N02 - CB-005 (11:00) - 0kg
    {
        id: 'CB-005',
        pondId: 'N02',
        date: '12/12/2025',
        time: '11:00',
        temperature: 29.0,
        humidity: 0.76,
        oxygen: 5.5,
        co: 0.2,
        no2: 0.01,
        so2: 0.01,
        feedAmount: 0,
        plannedFeedAmount: 12,
    },

    // N03 - CB-004 (09:00)
    {
        id: 'CB-004',
        pondId: 'N03',
        date: '12/12/2025',
        time: '09:00',
        temperature: 27.5,
        humidity: 0.78,
        oxygen: 5.0,
        co: 0.3,
        no2: 0.02,
        so2: 0.01,
        feedAmount: 25,
        plannedFeedAmount: 25,
    },

    // --- Generated N02 Data (Lower feed amounts) ---
    {
        id: 'CB-GEN-N02-01',
        pondId: 'N02',
        date: '12/12/2025',
        time: '08:00',
        temperature: 28.5,
        humidity: 0.78,
        oxygen: 4.8,
        co: 0.35,
        no2: 0.02,
        so2: 0.01,
        feedAmount: 11.5,
        plannedFeedAmount: 12.0,
    },
    {
        id: 'CB-GEN-N02-02',
        pondId: 'N02',
        date: '12/12/2025',
        time: '14:00',
        temperature: 29.0,
        humidity: 0.75,
        oxygen: 5.0,
        co: 0.3,
        no2: 0.02,
        so2: 0.01,
        feedAmount: 12.0,
        plannedFeedAmount: 12.0,
    },
    {
        id: 'CB-GEN-N02-03',
        pondId: 'N02',
        date: '12/12/2025',
        time: '17:00',
        temperature: 27.5,
        humidity: 0.82,
        oxygen: 4.6,
        co: 0.4,
        no2: 0.03,
        so2: 0.02,
        feedAmount: 10.0,
        plannedFeedAmount: 12.0, // Underfed
    },

    // --- Generated N03 Data (Higher feed amounts) ---
    {
        id: 'CB-GEN-N03-01',
        pondId: 'N03',
        date: '12/12/2025',
        time: '06:30',
        temperature: 27.0,
        humidity: 0.8,
        oxygen: 5.2,
        co: 0.25,
        no2: 0.01,
        so2: 0.01,
        feedAmount: 24.0,
        plannedFeedAmount: 25.0,
    },
    {
        id: 'CB-GEN-N03-02',
        pondId: 'N03',
        date: '12/12/2025',
        time: '12:00',
        temperature: 28.0,
        humidity: 0.75,
        oxygen: 5.0,
        co: 0.3,
        no2: 0.02,
        so2: 0.01,
        feedAmount: 26.0, // Overfed
        plannedFeedAmount: 25.0,
    },
    {
        id: 'CB-GEN-N03-03',
        pondId: 'N03',
        date: '12/12/2025',
        time: '16:00',
        temperature: 27.8,
        humidity: 0.78,
        oxygen: 4.9,
        co: 0.3,
        no2: 0.02,
        so2: 0.01,
        feedAmount: 25.0,
        plannedFeedAmount: 25.0,
    },
];
