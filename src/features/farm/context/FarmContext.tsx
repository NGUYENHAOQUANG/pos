import React, { createContext, useContext, useState, ReactNode } from 'react';
import { JobType } from '@/features/farm/components/pondwork/JobItem';
import { IMaterial } from '@/features/material/types/material.types';

// --- INTERFACES ---
export interface DropdownItem {
  label: string;
  value: string;
}

export interface BreedOption extends DropdownItem {
  materialCode?: string;
  price?: number;
  supplier?: string;
}

export interface FormData {
  cycleName?: string;
  breedSource?: string;
  season?: string;
  stockingDate?: string | null;
  stockingQuantity?: number | null;
  age?: number | null;
  density?: string;
  estimatedCost?: string;
  notes?: string;
}

export interface JobExecution {
  id: string;
  label: string;
  time: string;
  date?: string;
  note?: string;
  materials?: {
    material: IMaterial;
    quantity: number;
    unit: string;
  }[];
  waterTreatmentType?: string;
  meta?: any;
}

interface FarmContextType {
  // Quản lý công việc (Jobs)
  pondJobs: Record<string, Record<JobType, JobExecution[]>>;
  updatePondJob: (pondId: string, jobType: JobType, items: JobExecution[]) => void;
  getPondJobItems: (pondId: string, jobType: JobType) => JobExecution[];
  getPondJobItemsByDateRange: (
    pondId: string,
    jobType: JobType,
    startDate: Date,
    endDate: Date
  ) => JobExecution[];
  getPondJobItemsGroupedByDate: (
    pondId: string,
    jobType: JobType,
    startDate: Date,
    endDate: Date
  ) => Map<string, JobExecution[]>;
  getLatestPondActivity: (pondId: string) => {
    lastUpdate: string;
    lastActivity: string;
  } | null;

  // Quản lý chu kỳ nuôi (Cycles)
  activeCycles: Record<string, FormData>;
  saveActiveCycle: (pondId: string, data: FormData) => void;
  deleteActiveCycle: (pondId: string) => void;

  // Options dữ liệu
  breedOptions: BreedOption[];
  seasonOptions: DropdownItem[];
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

export const FarmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // --- STATE ---
  const [pondJobs, setPondJobs] = useState<Record<string, Record<JobType, JobExecution[]>>>({});
  const [activeCycles, setActiveCycles] = useState<Record<string, FormData>>({});

  const [breedOptions] = useState<BreedOption[]>([
    {
      label: 'Tôm thẻ chân trắng - SIS PL12',
      value: 'A',
      materialCode: 'SIS-PL12',
      price: 120,
      supplier: 'Shrimp Improvement Systems',
    },
    {
      label: 'Tôm sú - SIS PL13',
      value: 'B',
      materialCode: 'SIS-PL13',
      price: 150,
      supplier: 'Shrimp Improvement Systems',
    },
  ]);

  const [seasonOptions] = useState<DropdownItem[]>([
    { label: 'Vụ nuôi 1', value: '1' },
    { label: 'Vụ nuôi 2', value: '2' },
  ]);

  // --- HÀM CƠ BẢN ---
  const updatePondJob = (pondId: string, jobType: JobType, items: JobExecution[]) => {
    if (!pondId) return;
    setPondJobs(prev => ({
      ...prev,
      [pondId]: {
        ...(prev[pondId] || {}),
        [jobType]: items,
      },
    }));
  };

  const getPondJobItems = (pondId: string, jobType: JobType) => {
    return pondJobs[pondId]?.[jobType] || [];
  };

  const saveActiveCycle = (pondId: string, data: FormData) => {
    if (!pondId) return;
    setActiveCycles(prev => ({
      ...prev,
      [pondId]: data,
    }));
  };

  const deleteActiveCycle = (pondId: string) => {
    if (!pondId) return;
    setActiveCycles(prev => {
      const newState = { ...prev };
      delete newState[pondId];
      return newState;
    });
  };

  // --- HÀM XỬ LÝ NÂNG CAO ---
  const getPondJobItemsByDateRange = (
    pondId: string,
    jobType: JobType,
    startDate: Date,
    endDate: Date
  ) => {
    const items = getPondJobItems(pondId, jobType);

    // Normalize dates to start of day for comparison
    const startOfStartDate = new Date(startDate);
    startOfStartDate.setHours(0, 0, 0, 0);

    const endOfEndDate = new Date(endDate);
    endOfEndDate.setHours(23, 59, 59, 999);

    return items.filter(item => {
      const itemDate = item.meta?.date ? new Date(item.meta.date) : new Date();
      const startOfItemDate = new Date(itemDate);
      startOfItemDate.setHours(0, 0, 0, 0);

      return startOfItemDate >= startOfStartDate && startOfItemDate <= endOfEndDate;
    });
  };

  const getPondJobItemsGroupedByDate = (
    pondId: string,
    jobType: JobType,
    startDate: Date,
    endDate: Date
  ): Map<string, JobExecution[]> => {
    const raw = getPondJobItemsByDateRange(pondId, jobType, startDate, endDate);

    const formatDate = (date: Date): string => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };

    const grouped = new Map<string, JobExecution[]>();

    raw.forEach(item => {
      const date = item.meta?.date ? new Date(item.meta.date) : new Date();
      const dateKey = formatDate(date);

      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(item);
    });

    grouped.forEach(items => {
      items.sort((a, b) => (b.time ?? '').localeCompare(a.time ?? ''));
    });

    return grouped;
  };

  const getLatestPondActivity = (pondId: string) => {
    const jobs = pondJobs[pondId];
    if (!jobs) return null;

    const jobNames: Record<string, string> = {
      FEED: 'Cho ăn',
      ENVIRONMENT: 'Đo môi trường',
      WATER_TREATMENT: 'Xử lý nước',
      WATER_CHANGE: 'Thay nước',
      CLEAN_POND: 'Rửa ao',
      SUN_DRY_POND: 'Phơi ao',
      SHRIMP_INSPECTION: 'Kiểm tra tôm',
      MEASURE_SIZE: 'Đo kích thước',
      SIPHON: 'Xi-phông',
      TROUBLESHOOTING: 'Xử lý sự cố',
      TRANSFER_POND: 'Sang ao',
      HARVEST: 'Thu hoạch',
    };

    let maxDate = new Date(0);
    let latestActivityStr = '';
    let latestUpdateStr = '';

    Object.entries(jobs).forEach(([type, items]) => {
      items.forEach(item => {
        const [hours, minutes] = item.time.split(':').map(Number);
        const date = item.meta?.date ? new Date(item.meta.date) : new Date();
        date.setHours(hours, minutes, 0, 0);

        if (date > maxDate) {
          maxDate = date;
          latestUpdateStr = `${date.toLocaleDateString('vi-VN')}, ${item.time}`;
          latestActivityStr = jobNames[type] || type;
        }
      });
    });

    if (latestActivityStr) {
      return {
        lastUpdate: latestUpdateStr,
        lastActivity: latestActivityStr,
      };
    }

    return null;
  };

  return (
    <FarmContext.Provider
      value={{
        pondJobs,
        updatePondJob,
        getPondJobItems,
        getPondJobItemsByDateRange,
        getPondJobItemsGroupedByDate,
        getLatestPondActivity,
        activeCycles,
        saveActiveCycle,
        deleteActiveCycle,
        breedOptions,
        seasonOptions,
      }}
    >
      {children}
    </FarmContext.Provider>
  );
};

export const useFarm = () => {
  const context = useContext(FarmContext);
  if (!context) {
    throw new Error('useFarm must be used within a FarmProvider');
  }
  return context;
};
