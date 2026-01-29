export interface ISiphonRecord {
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
    documentIds?: string[];
    value?: number;
    siphonDetail?: {
        shrimpLossKg?: number;
        notes?: string;
        materials?: Array<{
            warehouseItemId: string;
            quantity: number;
            warehouseItemName?: string;
            unitName?: string;
        }>;
    };
}

export interface ISiphonRecordResponse {
    items: ISiphonRecord[];
    totalCount: number;
}

export interface ISiphonParams {
    Page?: number;
    PageSize?: number;
    CreatedAdmin?: boolean; // mirrors sizeMeasurement params if exists
    // Add other params if needed
}

export interface CreateSiphonCommand {
    value: number;
    documentIds: string[];
    siphonDetail: {
        shrimpLossKg: number;
        notes: string;
        materials: Array<{
            warehouseItemId: string;
            quantity: number;
        }>;
    };
}
