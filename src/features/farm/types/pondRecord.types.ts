import type { IApiResponse, IPaginate, ICreatorEditor } from '@/shared/types/common.types';

export enum PondRecordOperationType {
    ReleaseShrimp = 'ReleaseShrimp',
    Feeding = 'Feeding',
    ShrimpHealthCheck = 'ShrimpHealthCheck',
    SizeMeasurement = 'SizeMeasurement',
    EnvMeasurement = 'EnvMeasurement',
    WaterTreatment = 'WaterTreatment',
    WaterChange = 'WaterChange',
    Siphon = 'Siphon',
    Incident = 'Incident',
    StockTransfer = 'StockTransfer',
    CleanRenovation = 'CleanRenovation',
    DryRenovation = 'DryRenovation',
    Harvest = 'Harvest',
}

/**
 * referenceData is a generic object whose fields depend on operationType.
 * Each operationType has its own set of fields inside referenceData.
 */
export interface IPondRecordReferenceData {
    // Common
    OperationType?: string;
    notes?: string | null;

    // Feeding (operationType: "Feeding")
    materials?: {
        warehouseItemId: string;
        quantity: number;
        name?: string;
        unitName?: string;
    }[];

    // ReleaseShrimp (operationType: "ReleaseShrimp")
    warehouseItemId?: string;
    density?: number;
    quantity?: number;
    ageDays?: number;
    estimatedCost?: number;

    // EnvMeasurement (operationType: "EnvMeasurement")
    pH?: number | null;
    temperature?: number | null;
    dissolvedOxygen?: number | null;
    salinity?: number | null;
    alkalinity?: number | null;
    transparency?: number | null;
    kali?: number | null;
    tan?: number | null;
    magie?: number | null;
    no3?: number | null;

    // ShrimpHealthCheck (operationType: "ShrimpHealthCheck")
    foodAmount?: string | null;
    leftoverFood?: string | null;
    intestine?: string | null;
    intestineColor?: string | null;
    stoolColor?: string | null;
    liver?: string | null;

    // SizeMeasurement (operationType: "SizeMeasurement")
    shrimpSize?: number | null;
    remainingWeight?: number | null;
    totalShrimpCount?: number | null;
    survivalRate?: number | null;

    // Siphon (operationType: "Siphon")
    lossAmount?: number | null;

    // WaterChange (operationType: "WaterChange")
    targetLevel?: number | null;
    supplyLevel?: number | null;
    drainLevel?: number | null;
    volumeAfterDrain?: number | null;
    volumeSupply?: number | null;
    volumeAfterSupply?: number | null;

    // Harvest (operationType: "Harvest")
    harvestType?: string | null;
    totalWeightKg?: number | null;
    referencePrice?: number | null;
    revenue?: number | null;

    // StockTransfer (operationType: "StockTransfer")
    totalStocking?: number | null;
    toPonds?: {
        toPondId: string;
        quantity: number;
        toPondName?: string;
    }[];
    transferMethod?: string | null;
    receivingPonds?: {
        id: string;
        receivingPond?: string;
        quantity: string;
    }[];

    // Allow any other fields from API
    [key: string]: unknown;
}

/** Generic record item from GET /pond/{pondId}/record (unified: operationType + referenceData) */
export interface IPondRecordItem {
    id: string;
    no?: number;
    creatorId?: string;
    editorId?: string | null;
    createdAt?: string;
    editedAt?: string;
    creator?: ICreatorEditor;
    editor?: ICreatorEditor | null;
    operationType?: PondRecordOperationType | string;
    referenceData?: IPondRecordReferenceData | null;
}

/**
 * Raw record from API: có thể là dạng unified (referenceData) hoặc dạng api riêng (xxxDetail).
 * Dùng normalizeRecordToRef() để đưa về một dạng trước khi convert → ActivityData / TrackingDayCard.
 */
export type RawPondRecordItem = IPondRecordItem & {
    sizeMeasurementDetail?: Record<string, unknown>;
    waterChangeDetail?: Record<string, unknown>;
    siphonDetail?: Record<string, unknown>;
    healthCheck?: Record<string, unknown>;
    feedingDetail?: Record<string, unknown>;
    waterTreatmentDetail?: Record<string, unknown>;
    /** CleanRenovation / DryRenovation */
    detail?: Record<string, unknown>;
    /** StockTransfer (flat) */
    toPonds?: { toPondId: string; quantity: number; toPondName?: string }[];
    totalStocking?: number;
    fromPondId?: string;
    fromCycleId?: string;
};

/** Query params for record list */
export interface IPondRecordListParams {
    PondId?: string;
    CycleId?: string;
    OperationTypes?: string[];
    Id?: string;
    CreatedAt?: string;
    CreateAtFrom?: string;
    CreateAtTo?: string;
    Page?: number;
    PageSize?: number;
    OrderBy?: string;
}

/** Response type */
export type PondRecordListResponse = IApiResponse<IPaginate<IPondRecordItem>>;
