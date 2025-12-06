export type MaterialGroupType =
  | 'Nuôi'
  | 'Vật tư nội bộ'
  | 'CCDC'
  | 'Thiết bị điện'
  | 'Chi phí khác'
  | string;

export interface IMaterial {
  id: string;
  name: string;
  group: MaterialGroupType;
  type?: string;
  unit: string;
  usage?: string;
  unitOfUse?: string;
  dosage?: string;
  manufacturer?: string;
  remaining?: number;
  price?: number; // Sometimes used in warehouse context
  quantity?: string | number; // Sometimes used in warehouse context
}

export interface IWarehouseMaterialItem {
  id: string;
  materialName: string;
  quantity: string;
  price: string;
  unit?: string;
  // Helper for total calculation
  total?: number;
}

export interface IWarehouseReceipt {
  id: string;
  date: Date | string;
  supplier?: string;
  materials: IWarehouseMaterialItem[];
  totalAmount: number;
}

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
}

export interface IInventoryFormItem {
  name: string;
  oldStock: number;
  newStock: number;
  diff: number;
}

export interface IInventoryFormData {
  date: string;
  note: string;
  items: IInventoryFormItem[];
}
