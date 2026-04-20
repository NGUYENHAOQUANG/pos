import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ManualScaleRecord {
    id: string;
    weight: number;
    status: 'completed' | 'deleted';
    createdAt: string;
    batchNo: number;
    scaleName: string;
    deviceTimestamp?: string;
}

interface ScaleStoreState {
    manualRecords: ManualScaleRecord[];
    addManualRecord: (record: ManualScaleRecord) => void;
    updateManualRecord: (id: string, weight: number) => void;
    deleteManualRecord: (id: string) => void;
    clearManualRecords: () => void;
}

export const useScaleStore = create<ScaleStoreState>()(
    persist(
        set => ({
            manualRecords: [],

            addManualRecord: record =>
                set(state => ({
                    manualRecords: [...state.manualRecords, record],
                })),

            updateManualRecord: (id, weight) =>
                set(state => ({
                    manualRecords: state.manualRecords.map(r =>
                        r.id === id ? { ...r, weight } : r
                    ),
                })),

            deleteManualRecord: id =>
                set(state => ({
                    manualRecords: state.manualRecords.filter(r => r.id !== id),
                })),

            clearManualRecords: () => set({ manualRecords: [] }),
        }),
        {
            name: 'manual-scale-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
