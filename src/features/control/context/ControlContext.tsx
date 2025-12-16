import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Pond } from '../types/control.types';

interface ControlContextType {
  ponds: Pond[];
  addPond: () => void;
  connectDeviceToPond: (pondName: string) => void;
}

const ControlContext = createContext<ControlContextType | undefined>(undefined);

export const ControlProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [ponds, setPonds] = useState<Pond[]>([]);

  const addPond = React.useCallback(() => {
    const newPondId = (ponds.length + 1).toString();
    const newPondName = `Ao ${ponds.length + 1}`;
    // Create new list to ensure immutability
    setPonds(prev => [...prev, { id: newPondId, name: newPondName, hasDevices: false }]);
  }, [ponds.length]); // Depend on length for id generation

  const connectDeviceToPond = React.useCallback((pondName: string) => {
    setPonds(prevPonds =>
      prevPonds.map(p => {
        if (p.name === pondName) {
          return {
            ...p,
            hasDevices: true,
            deviceStats: {
              fan: { active: 0, warning: 0, inactive: 0 },
              feeder: { active: 0, warning: 0, inactive: 0 },
              oxy: { active: 0, warning: 0, inactive: 0 },
              syphon: { active: 0, warning: 0, inactive: 0 },
            },
          };
        }
        return p;
      })
    );
  }, []);

  const value = React.useMemo(
    () => ({
      ponds,
      addPond,
      connectDeviceToPond,
    }),
    [ponds, addPond, connectDeviceToPond]
  );

  return <ControlContext.Provider value={value}>{children}</ControlContext.Provider>;
};

export const useControl = () => {
  const context = useContext(ControlContext);
  if (!context) {
    throw new Error('useControl must be used within a ControlProvider');
  }
  return context;
};
