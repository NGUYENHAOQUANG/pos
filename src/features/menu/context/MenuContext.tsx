import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Aquaculture, Member, DeviceData } from '../types/menu.types';
import { DEVICES_DATA } from '../data/devicesData';
import { membersData } from '../data/memberData';

interface MenuContextType {
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

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export const useMenuContext = () => {
    const context = useContext(MenuContext);
    if (!context) {
        throw new Error('useMenuContext must be used within a MenuProvider');
    }
    return context;
};

interface MenuProviderProps {
    children: ReactNode;
}

export const MenuProvider: React.FC<MenuProviderProps> = ({ children }) => {
    const [aquacultures, setAquacultures] = useState<Aquaculture[]>([
        // Mock data if needed, or empty
    ]);

    const [members, setMembers] = useState<Member[]>(membersData);

    const addAquaculture = (newAquaculture: Omit<Aquaculture, 'id' | 'createdAt'>) => {
        const aquaculture: Aquaculture = {
            ...newAquaculture,
            id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date(),
        };
        // Add to beginning of list
        setAquacultures(prev => [aquaculture, ...prev]);
    };

    const updateAquaculture = (id: string, updatedData: Omit<Aquaculture, 'id' | 'createdAt'>) => {
        setAquacultures(prev =>
            prev.map(item => (item.id === id ? { ...item, ...updatedData } : item))
        );
    };

    const addMember = (newMember: Omit<Member, 'id' | 'createdAt' | 'status'>) => {
        const member: Member = {
            ...newMember,
            id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date(),
            status: 'pending', // Default status
        };
        setMembers(prev => [member, ...prev]);
    };

    const updateMember = (id: string, updatedData: Partial<Member>) => {
        setMembers(prev => prev.map(item => (item.id === id ? { ...item, ...updatedData } : item)));
    };

    const deleteMember = (id: string) => {
        setMembers(prev => prev.filter(item => item.id !== id));
    };

    // Device Logic
    const [devices, setDevices] = useState<DeviceData[]>(DEVICES_DATA);

    const addDevice = (newDevice: Omit<DeviceData, 'id'>) => {
        const device: DeviceData = {
            ...newDevice,
            id: Math.random().toString(36).substr(2, 9),
        };
        setDevices(prev => [device, ...prev]);
    };

    const updateDevice = (id: string, updatedData: Partial<DeviceData>) => {
        setDevices(prev => prev.map(item => (item.id === id ? { ...item, ...updatedData } : item)));
    };

    const deleteDevice = (id: string) => {
        setDevices(prev => prev.filter(item => item.id !== id));
    };

    return (
        <MenuContext.Provider
            value={{
                aquacultures,
                addAquaculture,
                updateAquaculture,
                members,
                addMember,
                updateMember,
                deleteMember,
                devices,
                addDevice,
                updateDevice,
                deleteDevice,
            }}
        >
            {children}
        </MenuContext.Provider>
    );
};
