export type PondType = 'Ao nuôi' | 'Ao vèo' | 'Ao sẵn sàng' | 'Ao lắng' | 'Ao thải';

export interface PondData {
  id: string;
  name: string;
  area: string;
  type: PondType;
  lastUpdate?: string;
  lastActivity?: string;
}

export interface FarmData {
  id: string;
  name: string;
  code: string;
  area?: string;
  address?: string;
}
