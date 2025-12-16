import React, { createContext, useContext, useState, ReactNode } from 'react';
import { JobType } from '@/features/farm/components/pondwork/JobItem';

export interface JobExecution {
  id: string;
  label: string;
  time: string;
  meta?: any;
}

export interface PondJobData {
  type: JobType;
  items: JobExecution[];
}

interface FarmContextType {
  // Map of pondId -> Record<JobType, JobExecution[]>
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
  getLatestPondActivity: (pondId: string) => { lastUpdate: string; lastActivity: string } | null;
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

export const FarmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [pondJobs, setPondJobs] = useState<Record<string, Record<JobType, JobExecution[]>>>({});

  const updatePondJob = (pondId: string, jobType: JobType, items: JobExecution[]) => {
    setPondJobs(prev => ({
      ...prev,
      [pondId]: {
        ...prev[pondId],
        [jobType]: items,
      },
    }));
  };

  const getPondJobItems = (pondId: string, jobType: JobType) => {
    return pondJobs[pondId]?.[jobType] || [];
  };

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
      // Get date from meta.date or use current date if not available
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
      return `${day}-${month}-${year}`;
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

    // Sort items within each date group by time descending
    grouped.forEach(items => {
      items.sort((a, b) => {
        const ta = a.time ?? '';
        const tb = b.time ?? '';
        return tb.localeCompare(ta);
      });
    });

    const today = new Date();
    const todayKey = formatDate(today);

    const sortedEntries = Array.from(grouped.entries()).sort((a, b) => {
      const dateKeyA = a[0];
      const dateKeyB = b[0];

      // Today always comes first
      if (dateKeyA === todayKey) return -1;
      if (dateKeyB === todayKey) return 1;

      // Other dates: sort ascending (oldest first)
      const dateA = new Date(dateKeyA.split('-').reverse().join('-'));
      const dateB = new Date(dateKeyB.split('-').reverse().join('-'));
      return dateA.getTime() - dateB.getTime();
    });

    return new Map(sortedEntries);
  };

  const getLatestPondActivity = (pondId: string) => {
    const jobs = pondJobs[pondId];
    if (!jobs) return null;

    let latestActivityStr = '';
    let latestUpdateStr = '';

    // JobType display names mapping (simplified)
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
    };

    let maxDate = new Date(0);

    Object.entries(jobs).forEach(([type, items]) => {
      items.forEach(item => {
        // Parse time "HH:mm" assuming today
        const [hours, minutes] = item.time.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);

        if (date > maxDate) {
          maxDate = date;
          latestUpdateStr = `${date.toLocaleDateString('en-GB')}, ${item.time}`; // dd/mm/yyyy, hh:mm
          latestActivityStr = jobNames[type] || type;
        }
      });
    });

    if (latestActivityStr) {
      return { lastUpdate: latestUpdateStr, lastActivity: latestActivityStr };
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
