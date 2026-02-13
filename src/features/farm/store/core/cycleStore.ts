import { StateCreator } from 'zustand';
import { BreedOption } from '@/features/farm/types/farm.types';
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
});
