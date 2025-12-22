import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Aquaculture } from '../types/menu.types';

interface MenuContextType {
  aquacultures: Aquaculture[];
  addAquaculture: (aquaculture: Omit<Aquaculture, 'id' | 'createdAt'>) => void;
  updateAquaculture: (id: string, aquaculture: Omit<Aquaculture, 'id' | 'createdAt'>) => void;
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

  return (
    <MenuContext.Provider value={{ aquacultures, addAquaculture, updateAquaculture }}>
      {children}
    </MenuContext.Provider>
  );
};
