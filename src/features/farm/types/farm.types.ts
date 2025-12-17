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

export interface FarmData {
  id: string;
  name: string;
  code: string;
  area?: string;
  address?: string;
}

export interface ShrimpInspectionData {
  id: string;
  pondId: string;
  pondName?: string;
  date?: string;
  time?: string;
  notes?: string;
}

/**
 * Meta data types for different job types
 */

// Shrimp Inspection Meta
export interface ShrimpInspectionMeta {
  date?: Date | string;
  foodAmount?: string;
  leftoverFood?: string;
  intestine?: string;
  intestineColor?: string;
  stoolColor?: string;
  liver?: string;
  notes?: string;
  images?: string[];
}

// Environment Meta
export interface EnvironmentMeta {
  date?: Date | string;
  pH?: string;
  pHWarning?: boolean;
  do?: string;
  temperature?: string;
  salinity?: string;
  alkalinity?: string;
  transparency?: string;
  notes?: string;
}

// Union type for all meta types
export type JobMeta = ShrimpInspectionMeta | EnvironmentMeta;
