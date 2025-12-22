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
