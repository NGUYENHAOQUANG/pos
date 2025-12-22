import { TagStatus } from '@/features/menu/components/Tag';

export interface Aquaculture {
  id: string;
  farmId: string;
  farmName: string;
  name: string;
  code: string;
  startDate: Date;
  endDate?: Date;
  status: TagStatus;
  note?: string;
  createdAt: Date;
}

export interface Member {
  id: string;
  name: string;
  role: string;
  managementLevel: string;
  contact: string;
  status: TagStatus;
  createdAt: Date;
  permissions?: string[];
  unitIds?: string[];
}
