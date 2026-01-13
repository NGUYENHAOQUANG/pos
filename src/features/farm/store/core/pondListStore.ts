import { StateCreator } from 'zustand';
import { PondData, PondType, PondTypeOperation } from '@/features/farm/types/farm.types';
import { pondApi } from '@/features/farm/api/pondApi';

export interface PondListStore {
    ponds: PondData[];
    isLoadingPonds: boolean;
    page: number;
    hasMore: boolean;
    totalCount: number;
    pondTypes: PondType[];
    pondTypeOperations: PondTypeOperation[];
    fetchPonds: () => Promise<void>;
    fetchPondsByZone: (
        zoneId: number | string,
        updates?: { isBackground?: boolean; isLoadMore?: boolean }
    ) => Promise<void>;
    fetchMasterData: () => Promise<void>;
    getPondById: (pondId: string) => PondData | undefined;
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
    pondTypeOperations: [],
    isLoadingPonds: false,
    page: 1,
    hasMore: true,
    totalCount: 0,
    fetchPonds: async () => {
        set({ isLoadingPonds: true });
        try {
            const ponds = await pondApi.getPonds();
            set({ ponds, isLoadingPonds: false });
        } catch (error) {
            set({ isLoadingPonds: false });
            console.error('Error fetching ponds:', error);
        }
    },
    fetchPondsByZone: async (zoneId, updates = {}) => {
        const { isBackground = false, isLoadMore = false } = updates;
        console.log('fetchPondsByZone called:', {
            zoneId,
            isLoadMore,
            page: get().page,
            hasMore: get().hasMore,
        });

        // Reset if fresh load (not load more)
        if (!isLoadMore) {
            set({ page: 1, hasMore: true });
            if (!isBackground) set({ isLoadingPonds: true, ponds: [] });
        } else {
            // If loading more but no more data, stop
            if (!get().hasMore) {
                console.log('Stopping load more: hasMore is false');
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

        console.log('Current Pond Types in Store:', JSON.stringify(get().pondTypes, null, 2));

        try {
            const { items: ponds, total } = await pondApi.getPondsByZone(zoneId, {
                PageSize: pageSize,
                PageNumber: currentPage,
            });

            // Update total count
            set({ totalCount: total });

            const currentTypes = get().pondTypes;
            console.log(`Fetched ${ponds.length} ponds. Mapping types...`);

            // Map pondTypeId to type object
            const mappedPonds = ponds.map(pond => {
                // @ts-ignore - pondTypeId exists in API response but not yet in Interface?
                // We should probably add pondTypeId to PondData interface too, but for now access property directly
                const typeId = (pond as any).pondTypeId;
                const matchedType = currentTypes.find(t => t.id === typeId);

                // If matched, assign it. If not, keeping undefined/partial is better than crashing.
                if (matchedType) {
                    pond.type = matchedType;
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
                console.log(`Initial Load: Received ${mappedPonds.length}`);
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
        try {
            const [types, operations] = await Promise.all([
                pondApi.getPondTypes(),
                pondApi.getPondTypeOperations(),
            ]);
            set({ pondTypes: types, pondTypeOperations: operations });
        } catch (error) {
            console.error('Failed to fetch master data:', error);
        }
    },
    getPondById: pondId => {
        return get().ponds.find(pond => pond.id === pondId);
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
