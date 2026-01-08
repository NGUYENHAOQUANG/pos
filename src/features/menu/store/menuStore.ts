import { create } from 'zustand';
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
export const useMenuStore = create<MenuStore>(set => ({
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
        set(state => ({
            aquacultures: [aquaculture, ...state.aquacultures],
        }));
    },

    updateAquaculture: (id, updatedData) => {
        set(state => ({
            aquacultures: state.aquacultures.map(item =>
                item.id === id ? { ...item, ...updatedData } : item
            ),
        }));
    },

    addMember: newMember => {
        const member: Member = {
            ...newMember,
            id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date(),
            status: 'pending',
        };
        set(state => ({
            members: [member, ...state.members],
        }));
    },

    updateMember: (id, updatedData) => {
        set(state => ({
            members: state.members.map(item =>
                item.id === id ? { ...item, ...updatedData } : item
            ),
        }));
    },

    deleteMember: id => {
        set(state => ({
            members: state.members.filter(item => item.id !== id),
        }));
    },

    addDevice: newDevice => {
        const device: DeviceData = {
            ...newDevice,
            id: Math.random().toString(36).substr(2, 9),
        };
        set(state => ({
            devices: [device, ...state.devices],
        }));
    },

    updateDevice: (id, updatedData) => {
        set(state => ({
            devices: state.devices.map(item =>
                item.id === id ? { ...item, ...updatedData } : item
            ),
        }));
    },

    deleteDevice: id => {
        set(state => ({
            devices: state.devices.filter(item => item.id !== id),
        }));
    },
}));

// Backward compatibility hook
export const useMenuContext = () => {
    return useMenuStore();
};
