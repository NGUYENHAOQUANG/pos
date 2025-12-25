export type PondType = 'Ao nuôi' | 'Ao vèo' | 'Ao sẵn sàng' | 'Ao lắng' | 'Ao thải';

export interface PondData {
    id: string;
    name: string;
    area: string;
    type: PondType;
    lastUpdate?: string;
    lastActivity?: string;
}

export interface CycleData {
    id: string;
    breedSource: string; // Chọn tôm giống
    season: string; // Chọn vụ nuôi
    cycleName: string;
    stockingDate: string; // Ngày thả
    stockingQuantity: number; // Tổng số lượng thả (PLs)
    age: number; // Ngày tuổi (PLS)
    density: number; // Mật độ (con/m2)
    estimatedCost: number; // Tổng chi phí giống ước tính
    notes: string; // Ghi chú
    pondId: string;
}

/**
 * Cycle form data for creating/editing farm cycles
 */
export interface CycleFormData {
    cycleName?: string;
    breedSource?: string;
    season?: string;
    stockingDate?: string | null;
    stockingQuantity?: number | null;
    age?: number | null;
    density?: string;
    estimatedCost?: string;
    notes?: string;
}

export interface FarmData {
    id: string;
    name: string;
    code: string;
    area?: string;
    address?: string;
}

export interface DropdownItem {
    label: string;
    value: string;
}

export interface BreedOption extends DropdownItem {
    materialCode?: string;
    price?: number;
    supplier?: string;
}

export interface ShrimpInspectionMeta {
    foodAmount?: string;
    leftoverFood?: string;
    intestine?: string;
    intestineColor?: string;
    stoolColor?: string;
    liver?: string;
    images?: string[];
}

export interface EnvironmentMeta {
    pH?: string;
    pHWarning?: boolean;
    do?: string;
    temperature?: string;
    salinity?: string;
    alkalinity?: string;
    transparency?: string;
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
    | MeasureSizeMeta;

export interface JobExecution {
    id: string;
    label: string;
    time: string;
    date?: string;
    note?: string;
    materials?: {
        material: any;
        quantity: number;
        unit: string;
    }[];
    images?: string[];
    waterTreatmentType?: string;
    meta?: JobMeta;
}

export interface ShrimpInspectionData {
    id: string;
    pondId: string;
    pondName?: string;
    date?: string;
    time?: string;
    notes?: string;
}
