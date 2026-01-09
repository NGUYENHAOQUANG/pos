import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Aquaculture, Member, DeviceData } from '../types/menu.types';
import { MAINTENANCE_DEVICES } from '@/features/control/data/devicesData';
import { membersData } from '../data/memberData';

// Zustand Store Interface
interface MenuStore {
    aquacultures: Aquaculture[];
    addAquaculture: (aquaculture: Omit<Aquaculture, 'id' | 'createdAt'>) => void;
    updateAquaculture: (id: string, aquaculture: Omit<Aquaculture, 'id' | 'createdAt'>) => void;
    members: Member[];
    addMember: (member: Omit<Member, 'id' | 'createdAt' | 'status'>) => void;
    updateMember: (id: string, member: Partial<Member>) => void;
    deleteMember: (id: string) => void;
    devices: DeviceData[];
    addDevice: (device: Omit<DeviceData, 'id'>) => void;
    updateDevice: (id: string, device: Partial<DeviceData>) => void;
    deleteDevice: (id: string) => void;
}

// Zustand Store
export const useMenuStore = create<MenuStore>()(
    persist(
        immer(set => ({
            // Initial State
            aquacultures: [],
            members: membersData,
            devices: MAINTENANCE_DEVICES as unknown as DeviceData[],

            // Actions
            addAquaculture: newAquaculture => {
                const aquaculture: Aquaculture = {
                    ...newAquaculture,
                    id: Math.random().toString(36).substr(2, 9),
                    createdAt: new Date(),
                };
                set(state => {
                    state.aquacultures.unshift(aquaculture);
                });
            },

            updateAquaculture: (id, updatedData) => {
                set(state => {
                    const index = state.aquacultures.findIndex(item => item.id === id);
                    if (index !== -1) {
                        // Cast updatedData to any to bypass strict type checking for partial updates if needed,
                        // or better, just merge.
                        Object.assign(state.aquacultures[index], updatedData);
                    }
                });
            },

            addMember: newMember => {
                const member: Member = {
                    ...newMember,
                    id: Math.random().toString(36).substr(2, 9),
                    createdAt: new Date(),
                    status: 'pending',
                };
                set(state => {
                    state.members.unshift(member);
                });
            },

            updateMember: (id, updatedData) => {
                set(state => {
                    const member = state.members.find(item => item.id === id);
                    if (member) {
                        Object.assign(member, updatedData);
                    }
                });
            },

            deleteMember: id => {
                set(state => {
                    state.members = state.members.filter(item => item.id !== id);
                });
            },

            addDevice: newDevice => {
                const device: DeviceData = {
                    ...newDevice,
                    id: Math.random().toString(36).substr(2, 9),
                };
                set(state => {
                    state.devices.unshift(device);
                });
            },

            updateDevice: (id, updatedData) => {
                set(state => {
                    const device = state.devices.find(item => item.id === id);
                    if (device) {
                        Object.assign(device, updatedData);
                    }
                });
            },

            deleteDevice: id => {
                set(state => {
                    state.devices = state.devices.filter(item => item.id !== id);
                });
            },
        })),
        {
            name: 'menu-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);

// Backward compatibility hook
export const useMenuContext = () => {
    return useMenuStore();
};
