export interface IWaterSupplyRecord {
    id: string;
    no?: number;
    createdAt?: string;
    editor?: {
        fullName?: string;
    };
    creator?: {
        fullName?: string;
    };
    pondId: string;
    documentIds?: string[]; // Kept for backward compatibility if needed, but primary is inside detail
    waterChangeDetail?: {
        documentIds?: string[]; // Added
        targetWaterLevel?: number; // Updated
        waterAdded?: number; // Updated
        notes?: string;
        materials?: Array<{
            materialId: string; // Updated
            quantity: number;
            warehouseItemName?: string;
            unitName?: string;
        }>;
    };
}

export interface IWaterSupplyRecordResponse {
    items: IWaterSupplyRecord[];
    totalCount: number;
}

export interface IWaterSupplyParams {
    Page?: number;
    PageSize?: number;
    CreatedAdmin?: boolean;
    cycleId?: string;
}

export interface CreateWaterSupplyCommand {
    waterChangeDetail: {
        documentIds?: string[]; // Added
        targetWaterLevel: number; // Updated from targetLevel
        waterAdded: number; // Updated from supplyLevel
        waterRemoved?: number; // Added
        previousVolume?: number; // Added
        finalVolume?: number; // Added
        addedVolume?: number; // Added
        note?: string; // Corrected from 'notes' to 'note'
        materials: Array<{
            materialId: string; // Updated from warehouseItemId
            quantity: number;
        }>;
    };
}
