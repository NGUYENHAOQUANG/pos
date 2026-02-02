export interface IInventoryTicketItem {
    id: string;
    materialName: string;
    beforeQuantity: number;
    afterQuantity: number;
}

export interface IInventoryTicket {
    id: string;
    checkerName: string;
    date: string;
    note: string;
    totalDifference: number;
    items: IInventoryTicketItem[];
    status: string;
}

export interface GetInventoryParams {
    Search?: string;
    Page?: number;
    PageSize?: number;
    WarehouseId?: string;
}
