import { IApiResponse, IPaginate, ICreatorEditor } from '@/shared/types/common.types';
import { OperationType, PondType, PondTypeOperation } from '@/features/farm/types/farm.types';

/** Stocking record embedded in cyclePond from pond list API */
export interface CyclePondRecord {
    warehouseItemId: string;
    density: number;
    quantity: number;
    ageDays: number;
    estimatedCost: number;
}

/** Active cycle data embedded directly in each pond from the list API */
export interface CyclePond {
    cycleId: string;
    cycleName: string;
    createAt: string;
    record: CyclePondRecord | null;
}

export enum PondShape {
    Rectangle = 'Rectangle',
    Circle = 'Circle',
    Square = 'Square',
    LShape = 'LShape',
    Irregular = 'Irregular',
}

export const POND_SHAPE_LABELS: Record<PondShape, string> = {
    [PondShape.Rectangle]: 'Hình chữ nhật',
    [PondShape.Circle]: 'Hình tròn',
    [PondShape.Square]: 'Hình vuông',
    [PondShape.LShape]: 'Hình chữ L',
    [PondShape.Irregular]: 'Không đều',
};

export interface PondData {
    id: string;
    code?: string;
    name: string;
    no?: number;
    area?: number | string;
    areaSqm?: number;
    shape?: PondShape;
    depth?: string | number;
    maxDepth?: number;
    pondPhase?: string;
    status?: string | PondStatus;
    pondCategoryId?: string;
    type?: PondType;
    zoneId?: string;
    farmCode?: string;
    zone?: string;
    lastUpdate?: string;
    lastActivity?: string;
    creatorId?: string;
    editorId?: string | null;
    createdAt?: string;
    editedAt?: string;
    creator?: ICreatorEditor | null;
    editor?: ICreatorEditor | null;
    pondCategoryName?: string;
    cyclePond?: CyclePond | null;
    canStockTransfer?: boolean;
}

export enum PondStatus {
    Available = 'Available',
    Framing = 'Framing',
    Null = 'Null',
}

export interface GetPondsParams {
    ZoneId?: string;
    PondCategoryId?: string;
    Name?: string;
    Status?: PondStatus;
    Id?: string;
    CreatedAt?: string;
    CreateAtFrom?: string;
    CreateAtTo?: string;
    Page?: number;
    PageSize?: number;
    OrderBy?: string;
    CanStockTransfer?: boolean;
}

export type GetPondsResponse = IApiResponse<IPaginate<PondData>>;
export type GetPondTypesResponse = IApiResponse<PondType[]>;
export type GetPondOperationTypesResponse = IApiResponse<OperationType[]>;
export type GetPondTypeOperationsResponse = IApiResponse<PondTypeOperation[]>;
export type GetPondByIdResponse = IApiResponse<PondData>;

export interface IStockTransferReadinessIssue {
    issueType: string;
    message: string;
    detail?: {
        totalPendingSessions?: number;
        totalPendingBatches?: number;
        totalPendingWeight?: number;
        sessions?: {
            sessionId: string;
            totalBatches: number;
            totalWeight: number;
        }[];
    };
}

export interface IStockTransferReadiness {
    isReady: boolean;
    issues: IStockTransferReadinessIssue[];
}

export type GetStockTransferReadinessResponse = IApiResponse<IStockTransferReadiness>;
