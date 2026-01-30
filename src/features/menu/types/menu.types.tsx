import { TagStatus } from '@/features/menu/components/Tag';
import { TrackingGroup } from '@/features/farm/components/TrackingList';

export interface Aquaculture {
    id: string;
    farmId: string;
    farmName: string;
    name: string;
    code: string;
    startDate: Date;
    endDate?: Date;
    status: TagStatus;
    note?: string;
    createdAt: Date;
    no?: number;
}

export interface Member {
    id: string;
    name: string;
    role: string;
    managementLevel: string;
    contact: string;
    status: TagStatus;
    createdAt: Date;
    permissions?: string[];
    unitIds?: string[];
    email?: string;
    unitName?: string;
}

export interface DeviceData {
    id: string;
    name: string;
    type: string;
    status: TagStatus;
    importDate: string;
    totalRunTime?: string;
    maintenance: {
        operatingTime: {
            current: number;
            limit: number;
        };
        usageTime: {
            current: number;
            limit: number;
        };
    };
    maintenanceHistory?: TrackingGroup[];
}
