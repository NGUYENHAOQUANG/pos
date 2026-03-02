import type { IApiResponse, IPaginate, ICreatorEditor } from '@/shared/types/common.types';

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

/** Generic record item from GET /pond/{pondId}/record */
export interface IPondRecordItem {
    id: string;
    no?: number;
    creatorId?: string;
    editorId?: string | null;
    createdAt?: string;
    editedAt?: string;
    creator?: ICreatorEditor;
    editor?: ICreatorEditor | null;
    operationType?: string;
    referenceData?: IPondRecordReferenceData | null;
}

/** Query params for record list */
export interface IPondRecordListParams {
    Page?: number;
    PageSize?: number;
    OrderBy?: string;
    CreatedAt?: string;
    CreateAtFrom?: string;
    CreateAtTo?: string;
    OperationType?: string;
}

/** Response type */
export type PondRecordListResponse = IApiResponse<IPaginate<IPondRecordItem>>;
