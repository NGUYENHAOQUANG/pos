import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { JobType } from '@/features/farm/components/pondwork/JobItem';
import { JobExecution } from '@/features/farm/types/farm.types';
import { formatDate, parseDate, compareTime } from '@/features/farm/utils/dateUtils';

// Core Slices
import { createPondListStore, PondListStore } from './core/pondListStore';
import { createSeasonStore, SeasonStore } from './core/seasonStore';
import { createSettingStore, SettingStore } from './core/settingStore';
import { createCycleStore, CycleStore } from './core/cycleStore';
import { createZoneStore, ZoneStore } from './core/zoneStore';

// Job Slices
import { createFeedSlice, FeedSlice } from './pondwork/feedStore';
import {
    createShrimpInspectionSlice,
    ShrimpInspectionSlice,
} from './pondwork/shrimpInspectionStore';
import { createMeasureSizeSlice, MeasureSizeSlice } from './pondwork/measureSizeStore';
import { createEnvironmentSlice, EnvironmentSlice } from './pondwork/environmentStore';
import { createWaterTreatmentSlice, WaterTreatmentSlice } from './pondwork/waterTreatmentStore';
import { createWaterChangeSlice, WaterChangeSlice } from './pondwork/waterChangeStore';
import { createSiphonSlice, SiphonSlice } from './pondwork/siphonStore';
import { createTroubleshootingSlice, TroubleshootingSlice } from './pondwork/troubleshootingStore';
import { createTransferPondSlice, TransferPondSlice } from './pondwork/transferPondStore';
import { createCleanPondSlice, CleanPondSlice } from './pondwork/cleanPondStore';
import { createSunDrySlice, SunDryStore as SunDrySlice } from './pondwork/sunDryStore';
import { createHarvestSlice, HarvestSlice } from './pondwork/harvestStore';

interface FarmProxyActions {
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
}

export type FarmState = PondListStore &
    SeasonStore &
    SettingStore &
    CycleStore &
    ZoneStore &
    FeedSlice &
    ShrimpInspectionSlice &
    MeasureSizeSlice &
    EnvironmentSlice &
    WaterTreatmentSlice &
    WaterChangeSlice &
    SiphonSlice &
    TroubleshootingSlice &
    TransferPondSlice &
    CleanPondSlice &
    SunDrySlice &
    HarvestSlice &
    FarmProxyActions;

export const useFarmStore = create<FarmState>()(
    persist(
        immer((...a) => ({
            // Core Logic
            ...createPondListStore(...a),
            ...createSeasonStore(...a),
            ...createSettingStore(...a),
            ...createCycleStore(...a),
            ...createZoneStore(...a),

            // Job Logic
            ...createFeedSlice(...a),
            ...createShrimpInspectionSlice(...a),
            ...createMeasureSizeSlice(...a),
            ...createEnvironmentSlice(...a),
            ...createWaterTreatmentSlice(...a),
            ...createWaterChangeSlice(...a),
            ...createSiphonSlice(...a),
            ...createTroubleshootingSlice(...a),
            ...createTransferPondSlice(...a),
            ...createCleanPondSlice(...a),
            ...createSunDrySlice(...a),
            ...createHarvestSlice(...a),

            // Proxy Actions
            updatePondJob: (pondId, jobType, items) => {
                const state = a[1]();
                switch (jobType) {
                    case 'FEED':
                        state.updateFeedJob(pondId, items);
                        break;
                    case 'SHRIMP_INSPECTION':
                        state.updateShrimpInspectionJob(pondId, items);
                        break;
                    case 'MEASURE_SIZE':
                        state.updateMeasureSizeJob(pondId, items);
                        break;
                    case 'ENVIRONMENT':
                        state.updateEnvironmentJob(pondId, items);
                        break;
                    case 'WATER_TREATMENT':
                        state.updateWaterTreatmentJob(pondId, items);
                        break;
                    case 'WATER_CHANGE':
                        state.updateWaterChangeJob(pondId, items);
                        break;
                    case 'SIPHON':
                        state.updateSiphonJob(pondId, items);
                        break;
                    case 'TROUBLESHOOTING':
                        state.updateTroubleshootingJob(pondId, items);
                        break;
                    case 'TRANSFER_POND':
                        state.updateTransferPondJob(pondId, items);
                        break;
                    case 'CLEAN_POND':
                        state.updateCleanPondJob(pondId, items);
                        break;
                    case 'SUN_DRY_POND':
                        state.updateSunDryJob(pondId, items);
                        break;
                    case 'HARVEST':
                        state.updateHarvestJob(pondId, items);
                        break;
                }
            },

            getPondJobItems: (pondId, jobType) => {
                const state = a[1]();
                switch (jobType) {
                    case 'FEED':
                        return state.feedJobs[pondId] || [];
                    case 'SHRIMP_INSPECTION':
                        return state.shrimpInspectionJobs[pondId] || [];
                    case 'MEASURE_SIZE':
                        return state.measureSizeJobs[pondId] || [];
                    case 'ENVIRONMENT':
                        return state.environmentJobs[pondId] || [];
                    case 'WATER_TREATMENT':
                        return state.waterTreatmentJobs[pondId] || [];
                    case 'WATER_CHANGE':
                        return state.waterChangeJobs[pondId] || [];
                    case 'SIPHON':
                        return state.siphonJobs[pondId] || [];
                    case 'TROUBLESHOOTING':
                        return state.troubleshootingJobs[pondId] || [];
                    case 'TRANSFER_POND':
                        return state.transferPondJobs[pondId] || [];
                    case 'CLEAN_POND':
                        return state.cleanPondJobs[pondId] || [];
                    case 'SUN_DRY_POND':
                        return state.sunDryJobs[pondId] || [];
                    case 'HARVEST':
                        return state.harvestJobs[pondId] || [];
                    default:
                        return [];
                }
            },

            getPondJobItemsByDateRange: (pondId, jobType, startDate, endDate) => {
                const items = a[1]().getPondJobItems(pondId, jobType);
                const startOfStartDate = new Date(startDate);
                startOfStartDate.setHours(0, 0, 0, 0);
                const endOfEndDate = new Date(endDate);
                endOfEndDate.setHours(23, 59, 59, 999);

                return items.filter(item => {
                    const itemDate = item.date ? parseDate(item.date) : new Date();
                    const startOfItemDate = new Date(itemDate);
                    startOfItemDate.setHours(0, 0, 0, 0);
                    return startOfItemDate >= startOfStartDate && startOfItemDate <= endOfEndDate;
                });
            },

            getPondJobItemsGroupedByDate: (pondId, jobType, startDate, endDate) => {
                const raw = a[1]().getPondJobItemsByDateRange(pondId, jobType, startDate, endDate);
                const grouped = new Map<string, JobExecution[]>();
                raw.forEach(item => {
                    const date = item.date ? parseDate(item.date) : new Date();
                    const dateKey = formatDate(date);
                    if (!grouped.has(dateKey)) grouped.set(dateKey, []);
                    grouped.get(dateKey)!.push(item);
                });
                grouped.forEach(items =>
                    items.sort((a, b) => compareTime(b.time ?? '00:00', a.time ?? '00:00'))
                );
                return grouped;
            },

            getLatestPondActivity: pondId => {
                const state = a[1]();
                const allJobsRecords: Record<JobType, JobExecution[]> = {
                    FEED: state.feedJobs[pondId] || [],
                    SHRIMP_INSPECTION: state.shrimpInspectionJobs[pondId] || [],
                    MEASURE_SIZE: state.measureSizeJobs[pondId] || [],
                    ENVIRONMENT: state.environmentJobs[pondId] || [],
                    WATER_TREATMENT: state.waterTreatmentJobs[pondId] || [],
                    WATER_CHANGE: state.waterChangeJobs[pondId] || [],
                    SIPHON: state.siphonJobs[pondId] || [],
                    TROUBLESHOOTING: state.troubleshootingJobs[pondId] || [],
                    TRANSFER_POND: state.transferPondJobs[pondId] || [],
                    CLEAN_POND: state.cleanPondJobs[pondId] || [],
                    SUN_DRY_POND: state.sunDryJobs[pondId] || [],
                    HARVEST: state.harvestJobs[pondId] || [],
                };

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

                Object.entries(allJobsRecords).forEach(([type, items]) => {
                    items.forEach(item => {
                        const [hours, minutes] = item.time.split(':').map(Number);
                        const date = item.date ? parseDate(item.date) : new Date();
                        date.setHours(hours, minutes, 0, 0);
                        if (date > maxDate) {
                            maxDate = date;
                            latestUpdateStr = `${date.toLocaleDateString('vi-VN')}, ${item.time}`;
                            latestActivityStr = jobNames[type] || type;
                        }
                    });
                });

                return latestActivityStr
                    ? { lastUpdate: latestUpdateStr, lastActivity: latestActivityStr }
                    : null;
            },
        })),
        {
            name: 'farm-storage-v3',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: state => ({
                feedJobs: state.feedJobs,
                shrimpInspectionJobs: state.shrimpInspectionJobs,
                measureSizeJobs: state.measureSizeJobs,
                environmentJobs: state.environmentJobs,
                waterTreatmentJobs: state.waterTreatmentJobs,
                waterChangeJobs: state.waterChangeJobs,
                siphonJobs: state.siphonJobs,
                troubleshootingJobs: state.troubleshootingJobs,
                transferPondJobs: state.transferPondJobs,
                cleanPondJobs: state.cleanPondJobs,
                sunDryJobs: state.sunDryJobs,
                harvestJobs: state.harvestJobs,
                activeCycles: state.activeCycles,
                ponds: state.ponds,
                seasons: state.seasons,
                cycles: state.cycles,
                environmentSettings: state.environmentSettings,
                zones: state.zones,
                selectedZoneId: state.selectedZoneId,
            }),
        }
    )
);

export const useFarm = () => {
    const store = useFarmStore();
    return {
        ...store,
        seasonOptions: store.getSeasonOptions(),
    };
};

export const getFarmState = () => useFarmStore.getState();
