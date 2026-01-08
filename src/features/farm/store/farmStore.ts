import { create } from 'zustand';
import { JobType } from '@/features/farm/components/pondwork/JobItem';
import {
    CycleData,
    DropdownItem,
    BreedOption,
    JobExecution,
    PondData,
    SeasonData,
    TransferInfo,
    PondType,
} from '@/features/farm/types/farm.types';
import { formatDate, parseDate, compareTime } from '@/features/farm/utils/dateUtils';
import { DUMMY_POND_DATA } from '@/features/farm/data/pondData';
import { DUMMY_SEASON_DATA } from '@/features/farm/data/seasonData';
import { DUMMY_CYCLE_DATA } from '@/features/farm/data/cycleData';
import {
    mockFeedJobExecutions,
    mockShrimpInspectionJobExecutions,
    mockMeasureSizeJobExecutions,
    mockSiphonJobExecutions,
    mockHandleProblemJobExecutions,
    mockWaterSupplyJobExecutions,
    mockWaterTreatmentJobExecutions,
    mockTransferJobExecutions,
    mockHarvestJobExecutions,
} from '@/features/farm/data/jobData';
import { EnvironmentParameter } from '@/features/farm/components/pondwork/environment/EnvironmentParameterSection';

const DEFAULT_ENV_PARAMS: EnvironmentParameter[] = [
    { id: '1', name: 'pH', limit: '7.5 - 8.5', isChecked: true },
    { id: '2', name: 'DO (mg/L)', limit: '5 - 8', isChecked: true },
    { id: '3', name: 'Nhiệt độ (°C)', limit: '25 - 32', isChecked: true },
    { id: '4', name: 'Độ trong (cm)', limit: '20 - 40', isChecked: true },
    { id: '5', name: 'Độ mặn (ppt)', limit: '20 - 35', isChecked: true },
    { id: '6', name: 'Độ kiềm (mg/L)', limit: '150 - 250', isChecked: true },
];

const DEFAULT_ADVANCED_ENV_PARAMS: EnvironmentParameter[] = [
    { id: '7', name: 'Kali (mg/L)', limit: '250 - 400', isChecked: false },
    { id: '8', name: 'TAN (mg/L)', limit: '0 - 3', isChecked: false },
    { id: '9', name: 'Magie (mg/L)', limit: '750 - 1400', isChecked: false },
    { id: '10', name: 'NO3 (mg/L)', limit: '0 - 10', isChecked: false },
];

const INITIAL_BREED_OPTIONS: BreedOption[] = [
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
];

// Helper to initialize job executions
const initializeJobExecutions = () => {
    const jobExecutionsByType: Record<JobType, JobExecution[]> = {
        FEED: mockFeedJobExecutions,
        SHRIMP_INSPECTION: mockShrimpInspectionJobExecutions,
        MEASURE_SIZE: mockMeasureSizeJobExecutions,
        ENVIRONMENT: [],
        WATER_TREATMENT: mockWaterTreatmentJobExecutions,
        WATER_CHANGE: mockWaterSupplyJobExecutions,
        SIPHON: mockSiphonJobExecutions,
        TROUBLESHOOTING: mockHandleProblemJobExecutions,
        TRANSFER_POND: mockTransferJobExecutions,
        CLEAN_POND: [],
        SUN_DRY_POND: [],
        HARVEST: mockHarvestJobExecutions,
    };

    const groupedByPond: Record<string, Record<JobType, JobExecution[]>> = {};

    Object.entries(jobExecutionsByType).forEach(([jobType, executions]) => {
        executions.forEach(execution => {
            if (execution.pondId) {
                if (!groupedByPond[execution.pondId]) {
                    groupedByPond[execution.pondId] = {} as Record<JobType, JobExecution[]>;
                }
                if (!groupedByPond[execution.pondId][jobType as JobType]) {
                    groupedByPond[execution.pondId][jobType as JobType] = [];
                }
                groupedByPond[execution.pondId][jobType as JobType].push(execution);
            }
        });
    });
    return groupedByPond;
};

interface FarmState {
    // Job Management
    pondJobs: Record<string, Record<JobType, JobExecution[]>>;

    // Cycle Management (deprecated - use cycles instead)
    activeCycles: Record<string, CycleData>;

    // Data Options
    breedOptions: BreedOption[];
    // seasonOptions Derived from seasons state

    // Pond Data Management
    ponds: PondData[];

    // Season Data Management
    seasons: SeasonData[];

    // Cycle Data Management
    cycles: CycleData[];

    // Environment Settings Persistence
    environmentSettings: {
        defaultParameters: EnvironmentParameter[];
        advancedParameters: EnvironmentParameter[];
    };
}

interface FarmActions {
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

    saveActiveCycle: (pondId: string, data: CycleData) => void;
    deleteActiveCycle: (pondId: string) => void;

    getPondById: (pondId: string) => PondData | undefined;
    updatePondType: (pondId: string, newType: PondType) => void;

    updateSeason: (seasonId: string, data: Partial<SeasonData>) => void;
    getSeasonOptions: () => DropdownItem[];

    getCyclesByPondId: (pondId: string) => CycleData[];
    getCurrentCycleForPond: (pondId: string) => CycleData | null;
    updateCycle: (cycleId: string, data: Partial<CycleData>) => void;
    createCycle: (data: CycleData) => void;
    deleteCycle: (cycleId: string) => void;

    handleTransferPond: (
        sourcePondId: string,
        receivingPonds: Array<{ receivingPond?: string; quantity: string }>,
        transferDate: string,
        shrimpSize: string,
        totalEstimatedShrimp: number
    ) => void;

    calculateDOC: (stockingDate: string | null | undefined) => number;
    calculateTotalEstimatedShrimp: (
        actualStockingQuantity: number,
        shrimpSize: string,
        pondId?: string
    ) => number;

    updateEnvironmentSettings: (
        settings: Partial<{
            defaultParameters: EnvironmentParameter[];
            advancedParameters: EnvironmentParameter[];
        }>
    ) => void;
}

export const useFarmStore = create<FarmState & FarmActions>((set, get) => ({
    // Initial State
    pondJobs: initializeJobExecutions(),
    activeCycles: {},
    breedOptions: INITIAL_BREED_OPTIONS,
    ponds: DUMMY_POND_DATA,
    seasons: DUMMY_SEASON_DATA,
    cycles: DUMMY_CYCLE_DATA,
    environmentSettings: {
        defaultParameters: DEFAULT_ENV_PARAMS,
        advancedParameters: DEFAULT_ADVANCED_ENV_PARAMS,
    },

    // Actions
    updatePondJob: (pondId, jobType, items) => {
        if (!pondId) return;
        set(state => ({
            pondJobs: {
                ...state.pondJobs,
                [pondId]: {
                    ...(state.pondJobs[pondId] || {}),
                    [jobType]: items,
                },
            },
        }));
    },

    getPondJobItems: (pondId, jobType) => {
        const { pondJobs } = get();
        const items = pondJobs[pondId]?.[jobType] || [];
        return items.filter(item => !item.pondId || item.pondId === pondId);
    },

    getPondJobItemsByDateRange: (pondId, jobType, startDate, endDate) => {
        const items = get().getPondJobItems(pondId, jobType);

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
        const raw = get().getPondJobItemsByDateRange(pondId, jobType, startDate, endDate);
        const grouped = new Map<string, JobExecution[]>();

        raw.forEach(item => {
            const date = item.date ? parseDate(item.date) : new Date();
            const dateKey = formatDate(date);

            if (!grouped.has(dateKey)) {
                grouped.set(dateKey, []);
            }
            grouped.get(dateKey)!.push(item);
        });

        grouped.forEach(items => {
            items.sort((a, b) => compareTime(b.time ?? '00:00', a.time ?? '00:00'));
        });

        return grouped;
    },

    getLatestPondActivity: pondId => {
        const { pondJobs } = get();
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
                const date = item.date ? parseDate(item.date) : new Date();
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
    },

    saveActiveCycle: (pondId, data) => {
        if (!pondId) return;
        set(state => ({
            activeCycles: {
                ...state.activeCycles,
                [pondId]: data,
            },
        }));
    },

    deleteActiveCycle: pondId => {
        if (!pondId) return;
        set(state => {
            const newState = { ...state.activeCycles };
            delete newState[pondId];
            return { activeCycles: newState };
        });
    },

    getPondById: pondId => {
        return get().ponds.find(pond => pond.id === pondId);
    },

    updatePondType: (pondId, newType) => {
        set(state => ({
            ponds: state.ponds.map(pond =>
                pond.id === pondId ? { ...pond, type: newType } : pond
            ),
        }));
    },

    updateSeason: (seasonId, data) => {
        set(state => ({
            seasons: state.seasons.map(season =>
                season.id === seasonId ? { ...season, ...data } : season
            ),
        }));
    },

    getSeasonOptions: () => {
        return get().seasons.map(season => ({
            label: season.name,
            value: season.id,
        }));
    },

    getCyclesByPondId: pondId => {
        return get().cycles.filter(
            cycle => cycle.sourcePonds?.includes(pondId) || cycle.receivingPonds?.includes(pondId)
        );
    },

    getCurrentCycleForPond: pondId => {
        if (!pondId) return null;
        const { activeCycles } = get();

        const currentCycle = activeCycles[pondId];
        if (currentCycle) return currentCycle;

        const cyclesForPond = get().getCyclesByPondId(pondId);
        const cycleInReceiving = cyclesForPond.find(cycle =>
            cycle.receivingPonds?.includes(pondId)
        );

        return cycleInReceiving || cyclesForPond[0] || null;
    },

    updateCycle: (cycleId, data) => {
        set(state => ({
            cycles: state.cycles.map(cycle =>
                cycle.id === cycleId ? { ...cycle, ...data } : cycle
            ),
        }));
    },

    createCycle: data => {
        set(state => ({
            cycles: [...state.cycles, data],
        }));
    },

    deleteCycle: cycleId => {
        set(state => ({
            cycles: state.cycles.filter(cycle => cycle.id !== cycleId),
        }));
    },

    handleTransferPond: (
        sourcePondId,
        receivingPondsData,
        transferDate,
        shrimpSize,
        totalEstimatedShrimp
    ) => {
        const {
            getPondById,
            getCyclesByPondId,
            activeCycles,
            calculateDOC,
            breedOptions,
            saveActiveCycle,
            updateCycle,
            createCycle,
            updatePondType,
            deleteActiveCycle,
        } = get();

        const sourcePond = getPondById(sourcePondId);
        if (!sourcePond) return;

        const sourceCycle = activeCycles[sourcePondId];
        const cyclesForSourcePond = getCyclesByPondId(sourcePondId);

        const cycleToClose =
            sourceCycle ||
            cyclesForSourcePond.find(cycle => cycle.sourcePonds?.includes(sourcePondId)) ||
            cyclesForSourcePond[0];

        if (!cycleToClose) return;

        const sourceDOC = calculateDOC(cycleToClose.stockingDate);
        const breedOption = breedOptions.find(b => b.value === cycleToClose.breedSource);

        receivingPondsData.forEach(({ receivingPond, quantity }) => {
            if (!receivingPond) return;

            const quantityNum = parseFloat(quantity.replace(/\D/g, '')) || 0;
            if (quantityNum <= 0) return;

            const receivingPondData = getPondById(receivingPond);
            if (!receivingPondData) return;

            const transferInfo: TransferInfo = {
                transferDate,
                shrimpSize,
                totalEstimatedShrimp,
                sourcePondId,
                sourcePondName: sourcePond.name,
                quantity: quantityNum,
                originalCycle: {
                    cycleName: cycleToClose.cycleName,
                    season: cycleToClose.season,
                    breedSource: cycleToClose.breedSource,
                    stockingDate: cycleToClose.stockingDate,
                    stockingQuantity: cycleToClose.stockingQuantity,
                    doc: sourceDOC,
                },
            };

            const existingCycle =
                activeCycles[receivingPond] || get().getCurrentCycleForPond(receivingPond);

            if (existingCycle) {
                const updatedCycle: CycleData = {
                    ...existingCycle,
                    transferInfo,
                };
                saveActiveCycle(receivingPond, updatedCycle);
                updateCycle(existingCycle.id, { transferInfo });
            } else {
                const areaMatch = receivingPondData.area.match(/(\d+(\.\d+)?)\s*m²/);
                const area = areaMatch ? parseFloat(areaMatch[1]) : undefined;
                const density = area && area > 0 ? quantityNum / area : 0;

                const estimatedCost = breedOption?.price
                    ? breedOption.price * (quantityNum / 1000)
                    : 0;

                const newCycle: CycleData = {
                    id: `${receivingPond}-${Date.now()}`,
                    cycleName: cycleToClose.cycleName || `Chu kỳ ${receivingPond}`,
                    breedSource: cycleToClose.breedSource,
                    season: cycleToClose.season,
                    stockingDate: transferDate,
                    stockingQuantity: quantityNum,
                    age: cycleToClose.age || 0,
                    density,
                    estimatedCost,
                    sourcePonds: [sourcePondId],
                    receivingPonds: [],
                    status: 'Chưa hoàn thành',
                    notes: `Chuyển từ ${sourcePond.name}`,
                    transferInfo,
                };

                saveActiveCycle(receivingPond, newCycle);
                createCycle(newCycle);
            }
        });

        updatePondType(sourcePondId, 'Ao sẵn sàng');

        set(state => ({
            cycles: state.cycles.map(cycle => {
                if (cycle.sourcePonds?.includes(sourcePondId)) {
                    const newSourcePonds = cycle.sourcePonds.filter(id => id !== sourcePondId);
                    return { ...cycle, sourcePonds: newSourcePonds };
                }
                return cycle;
            }),
        }));

        deleteActiveCycle(sourcePondId);
    },

    calculateDOC: stockingDate => {
        if (!stockingDate) return 0;
        const start =
            typeof stockingDate === 'string' && stockingDate.includes('/')
                ? parseDate(stockingDate)
                : new Date(stockingDate);
        start.setHours(0, 0, 0, 0);
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const diffTime = Math.abs(now.getTime() - start.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    },

    calculateTotalEstimatedShrimp: (actualStockingQuantity, shrimpSize, pondId) => {
        if (!actualStockingQuantity || !shrimpSize || !pondId) return 0;

        const size = parseFloat(shrimpSize);
        if (isNaN(size) || size <= 0) return 0;

        const measureSizeItems = get().getPondJobItems(pondId, 'MEASURE_SIZE');
        let survivalRate: number | null = null;

        if (measureSizeItems.length > 0) {
            const sorted = [...measureSizeItems].sort((a, b) => {
                const dateA = a.date ? parseDate(a.date) : new Date(0);
                const dateB = b.date ? parseDate(b.date) : new Date(0);

                if (dateA.getTime() !== dateB.getTime()) {
                    return dateB.getTime() - dateA.getTime();
                }

                const timeA = a.time || '00:00';
                const timeB = b.time || '00:00';
                const [hoursA, minutesA] = timeA.split(':').map(Number);
                const [hoursB, minutesB] = timeB.split(':').map(Number);
                const totalMinutesA = hoursA * 60 + minutesA;
                const totalMinutesB = hoursB * 60 + minutesB;

                return totalMinutesB - totalMinutesA;
            });

            const latestItem = sorted[0];
            const latestMeta = latestItem?.meta as { survivalRate?: number | null } | undefined;
            survivalRate = latestMeta?.survivalRate ?? null;
        }

        if (survivalRate === null || survivalRate <= 0) return 0;
        const estimatedProductionKg = (actualStockingQuantity * survivalRate) / size;
        return Math.round(estimatedProductionKg);
    },

    updateEnvironmentSettings: settings => {
        set(state => ({
            environmentSettings: {
                ...state.environmentSettings,
                ...settings,
            },
        }));
    },
}));

// Legacy hook support with computed properties
export const useFarm = () => {
    const store = useFarmStore();

    // Derived state for backward compatibility
    const seasonOptions: DropdownItem[] = store.seasons.map(season => ({
        label: season.name,
        value: season.id,
    }));

    return {
        ...store,
        seasonOptions,
    };
};

// Utility to get state outside of components
export const getFarmState = () => useFarmStore.getState();
