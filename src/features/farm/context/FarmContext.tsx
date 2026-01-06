import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

interface FarmContextType {
    // Job Management
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

    // Cycle Management (deprecated - use cycles instead)
    activeCycles: Record<string, CycleData>;
    saveActiveCycle: (pondId: string, data: CycleData) => void;
    deleteActiveCycle: (pondId: string) => void;

    // Data Options
    breedOptions: BreedOption[];
    seasonOptions: DropdownItem[];

    // Pond Data Management
    ponds: PondData[];
    getPondById: (pondId: string) => PondData | undefined;
    updatePondType: (pondId: string, newType: PondType) => void;

    // Season Data Management
    seasons: SeasonData[];
    updateSeason: (seasonId: string, data: Partial<SeasonData>) => void;

    // Cycle Data Management
    cycles: CycleData[];
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

    // Environment Settings Persistence
    environmentSettings: {
        defaultParameters: EnvironmentParameter[];
        advancedParameters: EnvironmentParameter[];
    };
    updateEnvironmentSettings: (
        settings: Partial<{
            defaultParameters: EnvironmentParameter[];
            advancedParameters: EnvironmentParameter[];
        }>
    ) => void;
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

export const FarmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [pondJobs, setPondJobs] = useState<Record<string, Record<JobType, JobExecution[]>>>({});
    const [activeCycles, setActiveCycles] = useState<Record<string, CycleData>>({});

    // Initialize data from mock data
    const [ponds, setPonds] = useState<PondData[]>(DUMMY_POND_DATA);
    const [seasons, setSeasons] = useState<SeasonData[]>(DUMMY_SEASON_DATA);
    const [cycles, setCycles] = useState<CycleData[]>(DUMMY_CYCLE_DATA);

    // Environment Settings State
    const [environmentSettings, setEnvironmentSettings] = useState<{
        defaultParameters: EnvironmentParameter[];
        advancedParameters: EnvironmentParameter[];
    }>({
        defaultParameters: DEFAULT_ENV_PARAMS,
        advancedParameters: DEFAULT_ADVANCED_ENV_PARAMS,
    });

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

    // Convert SeasonData to DropdownItem for seasonOptions
    const seasonOptions: DropdownItem[] = seasons.map(season => ({
        label: season.name,
        value: season.id,
    }));

    // Load job executions from mock API data (only once on mount)
    useEffect(() => {
        // Simulate API call to load job executions
        const loadJobExecutions = () => {
            // Map mock data arrays to JobType
            const jobExecutionsByType: Record<JobType, JobExecution[]> = {
                FEED: mockFeedJobExecutions,
                SHRIMP_INSPECTION: mockShrimpInspectionJobExecutions,
                MEASURE_SIZE: mockMeasureSizeJobExecutions,
                ENVIRONMENT: [], // No mock data for environment yet
                WATER_TREATMENT: mockWaterTreatmentJobExecutions,
                WATER_CHANGE: mockWaterSupplyJobExecutions, // WATER_CHANGE uses WATER_SUPPLY data
                SIPHON: mockSiphonJobExecutions,
                TROUBLESHOOTING: mockHandleProblemJobExecutions, // TROUBLESHOOTING uses HANDLE_PROBLEM data
                TRANSFER_POND: mockTransferJobExecutions,
                CLEAN_POND: [], // No mock data for clean pond yet
                SUN_DRY_POND: [], // No mock data for sun dry pond yet
                HARVEST: mockHarvestJobExecutions,
            };

            // Group jobs by pondId
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

            // Only set if pondJobs is empty (initial load)
            // This preserves any user-created data
            setPondJobs(prev => {
                const isEmpty = Object.keys(prev).length === 0;
                return isEmpty ? groupedByPond : prev;
            });
        };

        loadJobExecutions();
    }, []);

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
        const items = pondJobs[pondId]?.[jobType] || [];
        return items.filter(item => !item.pondId || item.pondId === pondId);
    };

    const saveActiveCycle = (pondId: string, data: CycleData) => {
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

    // Pond CRUD
    const getPondById = (pondId: string) => {
        return ponds.find(pond => pond.id === pondId);
    };

    // Update pond type (e.g., "Ao vèo" -> "Ao sẵn sàng")
    const updatePondType = (pondId: string, newType: PondType) => {
        setPonds(prev =>
            prev.map(pond => (pond.id === pondId ? { ...pond, type: newType } : pond))
        );
    };

    const updateSeason = (seasonId: string, data: Partial<SeasonData>) => {
        setSeasons(prev =>
            prev.map(season => (season.id === seasonId ? { ...season, ...data } : season))
        );
    };

    const getCyclesByPondId = (pondId: string) => {
        return cycles.filter(
            cycle => cycle.sourcePonds?.includes(pondId) || cycle.receivingPonds?.includes(pondId)
        );
    };

    // Get current cycle for a pond (prioritize activeCycles, then cycles with pondId in receivingPonds)
    const getCurrentCycleForPond = (pondId: string): CycleData | null => {
        if (!pondId) return null;

        const currentCycle = activeCycles[pondId];
        if (currentCycle) return currentCycle;

        const cyclesForPond = getCyclesByPondId(pondId);
        const cycleInReceiving = cyclesForPond.find(cycle =>
            cycle.receivingPonds?.includes(pondId)
        );

        return cycleInReceiving || cyclesForPond[0] || null;
    };

    // Calculate total estimated shrimp (kg): (Số lượng thả thực tế × Tỉ lệ sống dự kiến) / Cỡ tôm (con/kg)
    // Returns estimated production in kg
    const calculateTotalEstimatedShrimp = (
        actualStockingQuantity: number,
        shrimpSize: string,
        pondId?: string
    ): number => {
        if (!actualStockingQuantity || !shrimpSize || !pondId) {
            console.log('Early return: missing params');
            return 0;
        }

        const size = parseFloat(shrimpSize);
        if (isNaN(size) || size <= 0) {
            return 0;
        }

        // Get latest measure size job to get survival rate
        const measureSizeItems = getPondJobItems(pondId, 'MEASURE_SIZE');
        let survivalRate: number | null = null;

        if (measureSizeItems.length > 0) {
            // Sort by date (newest first), then by time (newest first)
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

        // If no survival rate available, return 0
        if (survivalRate === null || survivalRate <= 0) {
            return 0;
        }

        // Formula: (Số lượng thả thực tế × Tỉ lệ sống dự kiến) / Cỡ tôm (con/kg)
        const estimatedProductionKg = (actualStockingQuantity * survivalRate) / size;
        return Math.round(estimatedProductionKg);
    };

    const updateCycle = (cycleId: string, data: Partial<CycleData>) => {
        setCycles(prev =>
            prev.map(cycle => (cycle.id === cycleId ? { ...cycle, ...data } : cycle))
        );
    };

    const createCycle = (data: CycleData) => {
        setCycles(prev => [...prev, data]);
    };

    const deleteCycle = (cycleId: string) => {
        setCycles(prev => prev.filter(cycle => cycle.id !== cycleId));
    };

    // Handle transfer pond: create cycles for receiving ponds and close source cycle
    const handleTransferPond = (
        sourcePondId: string,
        receivingPondsData: Array<{ receivingPond?: string; quantity: string }>,
        transferDate: string,
        shrimpSize: string,
        totalEstimatedShrimp: number
    ) => {
        console.log('=== handleTransferPond called ===');
        console.log('sourcePondId:', sourcePondId);
        console.log('receivingPondsData:', receivingPondsData);

        // Get source pond info
        const sourcePond = getPondById(sourcePondId);
        console.log('sourcePond:', sourcePond);
        if (!sourcePond) {
            console.log('Source pond not found, returning');
            return;
        }

        console.log('sourcePond.type:', sourcePond.type);

        // Get current cycle of source pond
        const sourceCycle = activeCycles[sourcePondId];
        const cyclesForSourcePond = getCyclesByPondId(sourcePondId);
        console.log('sourceCycle from activeCycles:', sourceCycle);
        console.log('cyclesForSourcePond:', cyclesForSourcePond);

        const cycleToClose =
            sourceCycle ||
            cyclesForSourcePond.find(cycle => cycle.sourcePonds?.includes(sourcePondId)) ||
            cyclesForSourcePond[0];

        console.log('cycleToClose:', cycleToClose);
        if (!cycleToClose) {
            console.log('No cycle to close, returning');
            return;
        }

        // Calculate DOC at source pond
        const sourceDOC = calculateDOC(cycleToClose.stockingDate);

        // Get breed option for calculating estimated cost
        const breedOption = breedOptions.find(b => b.value === cycleToClose.breedSource);

        // Process each receiving pond
        receivingPondsData.forEach(({ receivingPond, quantity }) => {
            if (!receivingPond) return;

            const quantityNum = parseFloat(quantity.replace(/\D/g, '')) || 0;
            if (quantityNum <= 0) return;

            const receivingPondData = getPondById(receivingPond);
            if (!receivingPondData) return;

            // Create transferInfo to store original cycle data from nursery pond
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

            // Check if receiving pond already has a cycle
            const existingCycle =
                activeCycles[receivingPond] || getCurrentCycleForPond(receivingPond);

            if (existingCycle) {
                // If receiving pond already has a cycle, just add transferInfo to it
                const updatedCycle: CycleData = {
                    ...existingCycle,
                    transferInfo, // Add transfer info from nursery pond
                };

                // Update the existing cycle with transferInfo
                saveActiveCycle(receivingPond, updatedCycle);
                updateCycle(existingCycle.id, { transferInfo });
            } else {
                // If receiving pond has no cycle, create a new one
                // Calculate density for receiving pond (con/m² = quantity / area)
                const areaMatch = receivingPondData.area.match(/(\d+(\.\d+)?)\s*m²/);
                const area = areaMatch ? parseFloat(areaMatch[1]) : undefined;
                const density = area && area > 0 ? quantityNum / area : 0;

                // Calculate estimated cost: price per 1000 PLs * quantity (in thousands)
                const estimatedCost = breedOption?.price
                    ? breedOption.price * (quantityNum / 1000)
                    : 0;

                // Create new cycle for receiving pond with transferInfo
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
                    transferInfo, // Store transfer info from nursery pond
                };

                // Save as active cycle for receiving pond
                saveActiveCycle(receivingPond, newCycle);
                // Also add to cycles array
                createCycle(newCycle);
            }
        });

        // Change source pond type from "Ao vèo" to "Ao sẵn sàng" (ready/preparation state)
        console.log('=== Changing source pond status ===');
        console.log('Before updatePondType - sourcePondId:', sourcePondId);
        updatePondType(sourcePondId, 'Ao sẵn sàng');
        console.log('After updatePondType');

        // Remove source pond from ALL cycles that reference it
        // This ensures the source pond no longer has any cycle association
        console.log('Removing sourcePondId from all related cycles...');
        setCycles(prevCycles =>
            prevCycles.map(cycle => {
                // Remove from sourcePonds array if exists
                if (cycle.sourcePonds?.includes(sourcePondId)) {
                    const newSourcePonds = cycle.sourcePonds.filter(id => id !== sourcePondId);
                    console.log(`Removed ${sourcePondId} from cycle ${cycle.id} sourcePonds`);
                    return { ...cycle, sourcePonds: newSourcePonds };
                }
                return cycle;
            })
        );

        // Delete from activeCycles
        console.log('Deleting from activeCycles...');
        deleteActiveCycle(sourcePondId);
        console.log('Deleted from activeCycles');

        console.log('=== handleTransferPond completed ===');
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
            const itemDate = item.date ? parseDate(item.date) : new Date();
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
    };

    // Calculate DOC (Days of Culture) from stocking date to today
    const calculateDOC = (stockingDate: string | null | undefined): number => {
        if (!stockingDate) return 0;

        // Parse date: if string contains "/", it's dd/mm/yyyy format, use parseDate
        // Otherwise, it's ISO string, use new Date()
        const start =
            typeof stockingDate === 'string' && stockingDate.includes('/')
                ? parseDate(stockingDate)
                : new Date(stockingDate);

        const now = new Date();
        const diffTime = Math.abs(now.getTime() - start.getTime());
        return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
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
    };

    const updateEnvironmentSettings = (
        settings: Partial<{
            defaultParameters: EnvironmentParameter[];
            advancedParameters: EnvironmentParameter[];
        }>
    ) => {
        setEnvironmentSettings(prev => ({
            ...prev,
            ...settings,
        }));
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
                // Cycle Management
                activeCycles,
                saveActiveCycle,
                deleteActiveCycle,
                // Data Options
                breedOptions,
                seasonOptions,
                // Pond Data Management
                ponds,
                getPondById,
                updatePondType,
                // Season Data Management
                seasons,
                updateSeason,
                // Cycle Data Management
                cycles,
                getCyclesByPondId,
                getCurrentCycleForPond,
                updateCycle,
                createCycle,
                deleteCycle,
                handleTransferPond,
                calculateDOC,
                calculateTotalEstimatedShrimp,
                environmentSettings,
                updateEnvironmentSettings,
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
