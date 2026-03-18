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
        waterRemoved?: number; // Added
        previousVolume?: number; // Added
        finalVolume?: number; // Added
        addedVolume?: number; // Added
        note?: string; // Corrected from 'notes' to 'note'
        materials?: Array<{
            materialId?: string; // Updated
            warehouseItemId?: string; // Added to cover both cases
            quantity: number;
            warehouseItemName?: string;
            unitName?: string;
        }>;
    };
}

/** Query params for water change list – matches Swagger /api/v1/pond/{pondId}/water-changes */
export interface IWaterSupplyParams {
    PondId?: string;
    CycleId?: string;
    Id?: string;
    CreatedAt?: string;
    CreateAtFrom?: string;
    CreateAtTo?: string;
    Page?: number;
    PageSize?: number;
    OrderBy?: string;
}

export interface CreateWaterSupplyCommand {
    documentIds?: string[];
    waterChangeDetail: {
        // documentIds removed as it is at root now
        targetWaterLevel: number; // Updated from targetLevel
        waterAdded: number; // Updated from supplyLevel
        waterRemoved?: number; // Added
        previousVolume?: number; // Added
        finalVolume?: number; // Added
        addedVolume?: number; // Added
        note?: string; // Corrected from 'notes' to 'note'
        materials: Array<{
            warehouseItemId: string; // Updated from materialId
            quantity: number;
        }>;
    };
}
