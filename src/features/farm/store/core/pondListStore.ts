import { StateCreator } from 'zustand';
import {
    OperationType,
    PondData,
    PondType,
    PondTypeOperation,
} from '@/features/farm/types/farm.types';
import { pondApi } from '@/features/farm/api/pondApi';

export interface PondListStore {
    ponds: PondData[];
    isLoadingPonds: boolean;
    page: number;
    hasMore: boolean;
    totalCount: number;
    pondTypes: PondType[];
    operationTypes: OperationType[];
    pondTypeOperations: PondTypeOperation[];
    // Map of pondTypeId -> operations available for that pond type
    operationsByPondType: Record<string, PondTypeOperation[]>;
    isLoadingMasterData: boolean; // Loading state for master data

    fetchPondsByZone: (
        zoneId: number | string,
        updates?: { isBackground?: boolean; isLoadMore?: boolean }
    ) => Promise<void>;
    fetchMasterData: () => Promise<void>;

    getPondById: (pondId: string) => PondData | undefined;
    getOperationsForPond: (pondId: string) => PondTypeOperation[];
    updatePondType: (pondId: string, newType: PondType) => void;
}

export const createPondListStore: StateCreator<
    PondListStore,
    [['zustand/immer', never]],
    [],
    PondListStore
> = (set, get) => ({
    ponds: [],
    pondTypes: [],
    operationTypes: [],
    pondTypeOperations: [],
    operationsByPondType: {},
    isLoadingMasterData: false,
    isLoadingPonds: false,
    page: 1,
    hasMore: true,
    totalCount: 0,

    fetchPondsByZone: async (zoneId, updates = {}) => {
        const { isBackground = false, isLoadMore = false } = updates;

        // Reset if fresh load (not load more)
        if (!isLoadMore) {
            set({ page: 1, hasMore: true });
            if (!isBackground) set({ isLoadingPonds: true, ponds: [] });
        } else {
            // If loading more but no more data, stop
            if (!get().hasMore) {
                return;
            }
        }

        const store = get();
        const currentPage = store.page;
        const pageSize = 100;

        // Ensure master data is available for mapping
        if (store.pondTypes.length === 0) {
            await store.fetchMasterData();
        }

        // console.log('Current Pond Types in Store:', JSON.stringify(get().pondTypes, null, 2));

        try {
            const { items: ponds, total } = await pondApi.getPondsByZone(zoneId, {
                PageSize: pageSize,
                PageNumber: currentPage,
            });

            // Update total count
            set({ totalCount: total });

            const currentTypes = get().pondTypes;
            // console.log(`Fetched ${ponds.length} ponds. Mapping types...`);

            // Map pondTypeId to type object
            const mappedPonds = ponds.map(pond => {
                // @ts-ignore
                const typeId = (pond as unknown as { pondCategoryId: string }).pondCategoryId;
                const matchedType = currentTypes.find(t => t.id === typeId);

                // console.log(`Pond ${pond.name} (ID: ${pond.id}) - Raw Category ID: ${typeId}`);

                // If matched, assign it. If not, keeping undefined/partial is better than crashing.
                if (matchedType) {
                    pond.type = matchedType;
                } else {
                    if (typeId) {
                        pond.type = typeId;
                    }
                }
                return pond;
            });

            if (isLoadMore) {
                // Deduplicate: Filter out ponds that already exist in state
                const currentPonds = get().ponds;
                const currentIds = new Set(currentPonds.map(p => p.id));
                const uniqueNewPonds = mappedPonds.filter(p => !currentIds.has(p.id));

                console.log(
                    `Load More: Received ${mappedPonds.length}, Unique ${uniqueNewPonds.length}`
                );

                // If we received data but all were duplicates, maybe we are looping pages or API is broken
                // In that case, we should probably stop.
                const distinctItemsCount = uniqueNewPonds.length;

                set(state => ({
                    ponds: [...state.ponds, ...uniqueNewPonds],
                    isLoadingPonds: false,
                    page: state.page + 1,
                    hasMore: mappedPonds.length === pageSize && distinctItemsCount > 0,
                }));
            } else {
                set({
                    ponds: mappedPonds,
                    isLoadingPonds: false,
                    page: 2, // Next page will be 2
                    hasMore: mappedPonds.length === pageSize,
                });
            }
        } catch (error) {
            console.error(`Failed to fetch ponds for zone ${zoneId}:`, error);
            set({ isLoadingPonds: false });
        }
    },
    fetchMasterData: async () => {
        set({ isLoadingMasterData: true });
        try {
            // Step 1: Fetch pond types and operation types
            const [types, operationTypes] = await Promise.all([
                pondApi.getPondTypes(),
                pondApi.getOperationTypes(),
            ]);

            // Step 2: Fetch all operations for all pond types at once
            const allOperations = await pondApi.getPondTypeOperations();

            // operationsByPondType: Record<string, PondTypeOperation[]>
            const operationsByPondType: Record<string, PondTypeOperation[]> = {};

            // Group by pondCategoryId
            allOperations.forEach(op => {
                const typeId = op.pondCategoryId;
                if (!typeId) return;

                if (!operationsByPondType[typeId]) {
                    operationsByPondType[typeId] = [];
                }
                operationsByPondType[typeId].push(op);
            });

            // allOperations is already flat list from API

            set({
                pondTypes: types,
                operationTypes,
                pondTypeOperations: allOperations,
                operationsByPondType,
                isLoadingMasterData: false,
            });
        } catch (_error) {
            set({ isLoadingMasterData: false });
        }
    },

    getPondById: pondId => {
        return get().ponds.find(pond => pond.id === pondId);
    },
    // Get available operations for a pond based on its type
    getOperationsForPond: (pondId: string) => {
        const pond = get().ponds.find(p => p.id === pondId);
        if (!pond || typeof pond.type === 'string') return [];

        const pondTypeId = pond.type.id;
        return get().operationsByPondType[pondTypeId] || [];
    },
    updatePondType: (pondId, newType) => {
        set(state => {
            const pond = state.ponds.find(p => p.id === pondId);
            if (pond) {
                pond.type = newType;
            }
        });
    },
});
