import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { ScaleSessionAction } from '@/features/farm/types/harvestRecord.types';

// Core Slices
import { createPondListStore, PondListStore } from '@/features/farm/store/core/pondListStore';
import { createZoneStore, ZoneStore } from '@/features/farm/store/core/zoneStore';

export interface IScaleSessionCtx {
    sessionId: string;
    status: ScaleSessionAction;
}

export type FarmState = PondListStore &
    ZoneStore & {
        scaleSessions: Record<string, IScaleSessionCtx>;
        setScaleSessionId: (
            cycleId: string,
            id: string | null,
            status?: ScaleSessionAction
        ) => void;
    };

export const useFarmStore = create<FarmState>()(
    immer((...a) => ({
        ...createPondListStore(...a),
        ...createZoneStore(...a),
        scaleSessions: {},
        setScaleSessionId: (cycleId, id, status = ScaleSessionAction.ACTIVE) =>
            a[0](state => {
                if (id === null) {
                    delete state.scaleSessions[cycleId];
                } else {
                    state.scaleSessions[cycleId] = { sessionId: id, status };
                }
            }),
    }))
);

export const useFarm = () => {
    const store = useFarmStore();
    return {
        ...store,
    };
};

export const getFarmState = () => useFarmStore.getState();
