import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Aquaculture, Member } from '../types/menu.types';

interface MenuContextType {
  aquacultures: Aquaculture[];
  addAquaculture: (aquaculture: Omit<Aquaculture, 'id' | 'createdAt'>) => void;
  updateAquaculture: (id: string, aquaculture: Omit<Aquaculture, 'id' | 'createdAt'>) => void;
  members: Member[];
  addMember: (member: Omit<Member, 'id' | 'createdAt' | 'status'>) => void;
  updateMember: (id: string, member: Partial<Member>) => void;
  deleteMember: (id: string) => void;
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

  const [members, setMembers] = useState<Member[]>([
    {
      id: '1',
      name: 'Nguyễn Văn A',
      role: 'Nhân viên',
      managementLevel: 'Cấp ao nuôi',
      contact: 'nguyenvana@gmail.com',
      status: 'pending',
      createdAt: new Date(),
    },
    {
      id: '2',
      name: 'Nguyễn Văn B',
      role: 'Quản lý',
      managementLevel: 'Cấp trại nuôi',
      contact: 'nguyenvanb@gmail.com',
      status: 'active',
      createdAt: new Date(),
    },
    {
      id: '3',
      name: 'Nguyễn Văn C',
      role: 'Nhân viên',
      managementLevel: 'Cấp ao nuôi',
      contact: 'nguyenvanc@gmail.com',
      status: 'paused',
      unitIds: ['101', '102'],
      createdAt: new Date(),
    },
  ]);

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
      }}
    >
      {children}
    </MenuContext.Provider>
  );
};
