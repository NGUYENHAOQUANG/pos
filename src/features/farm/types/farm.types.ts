import { PondData } from '@/features/farm/types/pond.types';
import { IMaterial } from '@/features/material/types/material.types';

export const POND_TYPES = {
    CULTIVATION: 'Ao nuôi',
    NURSERY: 'Ao vèo',
    READY: 'Ao sẵn sàng',
    SETTLING: 'Ao lắng',
    WASTE: 'Ao thải',
    TREATMENT: 'Ao xử lý',
    WATER_STORAGE: 'Ao nước sạch',
} as const;

// export type PondType = (typeof POND_TYPES)[keyof typeof POND_TYPES]; // Legacy

export interface PondType {
    id: string;
    name: string;
    code?: string; // Optional - API may not return this
    description?: string;
    isDevice?: boolean;
    creatorId?: number;
    createdAt?: string;
    lastModifierId?: number;
    lastModifiedAt?: string;
}

export * from './pondOperation.types';
export interface Zone {
    id: string;
    zoneId?: string;
    name: string;
    code?: string;
    description?: string;
    area?: number;
    isActive?: boolean;
    address?: string;
    no?: number;
    createdAt?: string;
    editedAt?: string;
    creator?: string | null;
    editor?: string | null;
}

export type { PondData };

export interface FarmData {
    id: string;
    name: string;
    code: string;
    area?: string;
    address?: string;
}

export enum SeasonStatus {
    Preparation = 'Preparation',
    Active = 'Active',
    Closed = 'Closed',
}

export const getSeasonStatusName = (status: string | SeasonStatus): string => {
    switch (status) {
        case SeasonStatus.Preparation:
            return 'Chuẩn bị';
        case SeasonStatus.Active:
            return 'Hoạt động';
        case SeasonStatus.Closed:
            return 'Đã kết thúc';
        default:
            return 'Không xác định';
    }
};

export interface SeasonData {
    id: string | number;
    name: string;
    farmCode: string;
    startDate: string;
    endDate: string;
    status: SeasonStatus;
    statusName?: string;
    zoneId?: string | number;
    seasonName?: string;
    seasonCode?: string;
    code?: string;
    cycleCount?: number;
    notes?: string;
    no?: number; // Sequence number for sorting (from API)
}

export interface DropdownItem {
    label: string;
    value: string;
}

export interface BreedOption extends DropdownItem {
    materialCode?: string;
    price?: number;
    supplier?: string;
    remainingQuantity?: number;
}

export interface ShrimpInspectionMeta {
    foodAmount?: string;
    leftoverFood?: string;
    intestine?: string;
    intestineColor?: string;
    stoolColor?: string;
    liver?: string;
    images?: string[];
    documentIds?: string[];
    averageInfectionRate?: number;
    isHealthy?: boolean;
    diagnosisDetails?: Array<{
        diseaseType: string;
        probabilityPercent: number;
    }> | null;
    aiItems?: any[];
}

export interface EnvironmentMeta {
    pH?: string;
    pHWarning?: boolean;
    do?: string;
    doWarning?: boolean;
    temperature?: string;
    temperatureWarning?: boolean;
    salinity?: string;
    salinityWarning?: boolean;
    alkalinity?: string;
    alkalinityWarning?: boolean;
    transparency?: string;
    transparencyWarning?: boolean;
    kali?: string;
    kaliWarning?: boolean;
    tan?: string;
    tanWarning?: boolean;
    magie?: string;
    magieWarning?: boolean;
    no3?: string;
    no3Warning?: boolean;
}

export interface SiphonMeta {
    lossAmount?: string;
    images?: string[];
}

export interface TransferMeta {
    shrimpSize?: string;
    transferMethod?: string;
    receivingPonds?: Array<{
        id: string;
        receivingPond?: string;
        quantity: string;
    }>;
}

export interface HarvestMeta {
    harvestType?: string;
    yieldAmount?: string;
    shrimpSize?: string;
    referencePrice?: string;
    revenue?: number;
}

export interface WaterSupplyMeta {
    targetLevel?: string | number;
    supplyLevel?: string | number;
    drainLevel?: string | number;
    volumeAfterDrain?: string | number;
    volumeSupply?: string | number;
    volumeAfterSupply?: string | number;
}

export interface MeasureSizeMeta {
    date?: string;
    shrimpSize?: string;
    remainingWeight?: string;
    totalShrimpCount?: number | null;
    averageShrimpSize?: number | null;
    survivalRate?: number | null;
    notes?: string;
    images?: string[];
}

export type JobMeta =
    | ShrimpInspectionMeta
    | EnvironmentMeta
    | SiphonMeta
    | TransferMeta
    | HarvestMeta
    | WaterSupplyMeta
    | WaterSupplyMeta
    | MeasureSizeMeta;

export interface JobExecution {
    id: string;
    label: string;
    time: string;
    date?: string;
    note?: string;
    pondId?: string;
    materials?: {
        material: IMaterial;
        quantity: number;
        unit: string;
    }[];
    images?: string[];
    documentIds?: string[];
    createdAt?: string;
    waterTreatmentType?: string;
    meta?: JobMeta;
}

export const ENVIRONMENT_METRIC_IDS = {
    PH: 'MT-001',
    TEMPERATURE: 'MT-002',
    DO: 'MT-003',
    TAN: 'MT-004',
    ALKALINITY: 'MT-005',
    KALI: 'MT-006',
    MAGIE: 'MT-007',
    NO3: 'MT-008',
    TRANSPARENCY: 'MT-009',
    SALINITY: 'MT-010',
} as const;

export const JOB_TYPES = {
    FEED: 'FEED',
    SHRIMP_INSPECTION: 'SHRIMP_INSPECTION',
    MEASURE_SIZE: 'MEASURE_SIZE',
    ENVIRONMENT: 'ENVIRONMENT',
    WATER_TREATMENT: 'WATER_TREATMENT',
    WATER_CHANGE: 'WATER_CHANGE',
    SIPHON: 'SIPHON',
    TRANSFER_POND: 'TRANSFER_POND',
    CLEAN_POND: 'CLEAN_POND',
    SUN_DRY_POND: 'SUN_DRY_POND',
    HARVEST: 'HARVEST',
    TROUBLESHOOTING: 'TROUBLESHOOTING',
} as const;
