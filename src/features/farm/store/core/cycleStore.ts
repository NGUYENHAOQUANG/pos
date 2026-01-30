import { StateCreator } from 'zustand';
import { CycleData, BreedOption, TransferInfo } from '@/features/farm/types/farm.types';
import { DUMMY_CYCLE_DATA } from '@/features/farm/data/cycleData';
import { parseDate } from '@/features/farm/utils/dateUtils';
import { PondListStore } from './pondListStore';
import { MeasureSizeSlice } from '../pondwork/measureSizeStore';

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

export interface CycleStore {
    // Data Options
    breedOptions: BreedOption[];

    // Cycle Management
    activeCycles: Record<string, CycleData>;
    cycles: CycleData[];

    // Actions
    getCyclesByPondId: (pondId: string) => CycleData[];
    getCurrentCycleForPond: (pondId: string) => CycleData | null;
    saveActiveCycle: (pondId: string, data: CycleData) => void;
    deleteActiveCycle: (pondId: string) => void;
    updateCycle: (cycleId: string, data: Partial<CycleData>) => void;
    createCycle: (data: CycleData) => void;
    setCycles: (cycles: CycleData[]) => void;
    deleteCycle: (cycleId: string) => void;

    // Complex Actions
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
}

// Need access to other slices for cross-slice logic
type FarmStoreSlice = CycleStore & PondListStore & MeasureSizeSlice;

export const createCycleStore: StateCreator<
    FarmStoreSlice,
    [['zustand/immer', never]],
    [],
    CycleStore
> = (set, get) => ({
    breedOptions: INITIAL_BREED_OPTIONS,
    activeCycles: {},
    cycles: DUMMY_CYCLE_DATA,

    getCyclesByPondId: pondId => {
        const state = get();
        const cycles = Array.isArray(state.cycles) ? state.cycles : [];
        return cycles.filter(
            cycle => cycle.sourcePonds?.includes(pondId) || cycle.receivingPonds?.includes(pondId)
        );
    },

    getCurrentCycleForPond: pondId => {
        if (!pondId) return null;
        const state = get();
        const activeCycles = state.activeCycles;

        const currentCycle = activeCycles[pondId];
        if (currentCycle) return currentCycle;

        const cyclesForPond = state.getCyclesByPondId(pondId);
        const cycleInReceiving = cyclesForPond.find(cycle =>
            cycle.receivingPonds?.includes(pondId)
        );

        return cycleInReceiving || cyclesForPond[0] || null;
    },

    saveActiveCycle: (pondId, data) => {
        if (!pondId) return;
        set(state => {
            state.activeCycles[pondId] = data;
        });
    },

    deleteActiveCycle: pondId => {
        if (!pondId) return;
        set(state => {
            delete state.activeCycles[pondId];
        });
    },

    updateCycle: (cycleId, data) => {
        set(state => {
            if (!state.cycles) state.cycles = []; // Safeguard
            const cycle = state.cycles.find(c => c.id === cycleId);
            if (cycle) {
                Object.assign(cycle, data);
            }
        });
    },

    setCycles: cycles => {
        set(state => {
            state.cycles = Array.isArray(cycles) ? cycles : []; // Safeguard
        });
    },

    createCycle: data => {
        set(state => {
            state.cycles.push(data);
        });
    },

    deleteCycle: cycleId => {
        set(state => {
            state.cycles = state.cycles.filter(cycle => cycle.id !== cycleId);
        });
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

        const state = get();
        const measureSizeItems = state.measureSizeJobs[pondId] || [];

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

    handleTransferPond: (
        sourcePondId,
        receivingPondsData,
        transferDate,
        shrimpSize,
        totalEstimatedShrimp
    ) => {
        const state = get();
        // Destructure dependencies to ensure they exist (Typescript check)
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
        } = state;

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
                activeCycles[receivingPond] || state.getCurrentCycleForPond(receivingPond);

            if (existingCycle) {
                const updatedCycle: CycleData = {
                    ...existingCycle,
                    transferInfo,
                };
                saveActiveCycle(receivingPond, updatedCycle);
                updateCycle(existingCycle.id, { transferInfo });
            } else {
                let area: number | undefined;
                if (receivingPondData.areaSqm) {
                    area = receivingPondData.areaSqm;
                } else if (receivingPondData.area) {
                    const areaMatch = receivingPondData.area.match(/(\d+(\.\d+)?)\s*m²/);
                    area = areaMatch ? parseFloat(areaMatch[1]) : undefined;
                }

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

        // updatePondType(sourcePondId, 'Ao sẵn sàng'); // Old string usage
        const stateStore = get();
        // Assuming 'Ao sẵn sàng' is the name we want.
        // If master data isn't loaded, we might have an issue.
        // We act optimistically or reuse existing type if possible?
        // Better: Find the type from pondTypes
        const readyType = stateStore.pondTypes.find(t => t.name === 'Ao sẵn sàng');
        if (readyType) {
            updatePondType(sourcePondId, readyType);
        } else {
            console.warn('Could not find PondType "Ao sẵn sàng" in master data');
            // Fallback: if updatePondType strictly requires PondType object, we can't pass string.
            // If we must update, and data is missing, we might skip or pass a dummy if allowed.
            // For now, only update if found.
        }

        set(draft => {
            draft.cycles = draft.cycles.map(cycle => {
                if (cycle.sourcePonds?.includes(sourcePondId)) {
                    cycle.sourcePonds = cycle.sourcePonds.filter(id => id !== sourcePondId);
                }
                return cycle;
            });
        });

        deleteActiveCycle(sourcePondId);
    },
});
