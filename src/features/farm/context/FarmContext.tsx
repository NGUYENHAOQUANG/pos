import React, { createContext, useContext, useState, ReactNode } from 'react';
import { JobType } from '../components/pondwork/JobItem';

export interface JobExecution {
  id: string;
  label: string;
  time: string;
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
      value={{ pondJobs, updatePondJob, getPondJobItems, getLatestPondActivity }}
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
