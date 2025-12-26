import React, { createContext, useContext, useState, ReactNode } from 'react';
import { JobType } from '@/features/farm/components/pondwork/JobItem';
import {
    CycleData,
    DropdownItem,
    BreedOption,
    JobExecution,
    PondData,
    SeasonData,
} from '@/features/farm/types/farm.types';
import { formatDate, parseDate, compareTime } from '@/features/farm/utils/dateUtils';
import { DUMMY_POND_DATA } from '@/features/farm/data/pondData';
import { DUMMY_SEASON_DATA } from '@/features/farm/data/seasonData';
import { DUMMY_CYCLE_DATA } from '@/features/farm/data/cycleData';

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
        transferDate: string
    ) => void;
    calculateDOC: (stockingDate: string | null | undefined) => number;
    calculateTotalEstimatedShrimp: (
        actualStockingQuantity: number,
        shrimpSize: string,
        pondId?: string
    ) => number;
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

export const FarmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [pondJobs, setPondJobs] = useState<Record<string, Record<JobType, JobExecution[]>>>({});
    const [activeCycles, setActiveCycles] = useState<Record<string, CycleData>>({});

    // Initialize data from mock data
    const [ponds] = useState<PondData[]>(DUMMY_POND_DATA);
    const [seasons, setSeasons] = useState<SeasonData[]>(DUMMY_SEASON_DATA);
    const [cycles, setCycles] = useState<CycleData[]>(DUMMY_CYCLE_DATA);

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
        receivingPonds: Array<{ receivingPond?: string; quantity: string }>,
        transferDate: string
    ) => {
        // Get source pond info
        const sourcePond = getPondById(sourcePondId);
        if (!sourcePond) return;

        // Only process if source pond is "Ao vèo" (nursery pond)
        if (sourcePond.type !== 'Ao vèo') return;

        // Get current cycle of source pond
        const sourceCycle = activeCycles[sourcePondId];
        const cyclesForSourcePond = getCyclesByPondId(sourcePondId);
        const cycleToClose =
            sourceCycle ||
            cyclesForSourcePond.find(cycle => cycle.sourcePonds?.includes(sourcePondId)) ||
            cyclesForSourcePond[0];

        if (!cycleToClose) return;

        // Get breed option for calculating estimated cost
        const breedOption = breedOptions.find(b => b.value === cycleToClose.breedSource);

        // Create new cycles for receiving ponds
        receivingPonds.forEach(({ receivingPond, quantity }, index) => {
            if (!receivingPond) return;

            const quantityNum = parseFloat(quantity.replace(/\D/g, '')) || 0;
            if (quantityNum <= 0) return;

            const receivingPondData = getPondById(receivingPond);
            if (!receivingPondData) return;

            // Calculate density for receiving pond (con/m² = quantity / area)
            const areaMatch = receivingPondData.area.match(/(\d+(\.\d+)?)\s*m²/);
            const area = areaMatch ? parseFloat(areaMatch[1]) : undefined;
            const density = area && area > 0 ? quantityNum / area : 0;

            // Calculate estimated cost: price per 1000 PLs * quantity (in thousands)
            const estimatedCost = breedOption?.price ? breedOption.price * (quantityNum / 1000) : 0;

            // Create new cycle for receiving pond
            const newCycle: CycleData = {
                id: `${receivingPond}-${Date.now()}-${index}`,
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
            };

            // Save as active cycle for receiving pond
            saveActiveCycle(receivingPond, newCycle);
            // Also add to cycles array
            createCycle(newCycle);
        });
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
