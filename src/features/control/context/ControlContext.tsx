import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Pond, EControlMode, DeviceData, PondDeviceStats } from '../types/control.types';
import FanIcon from '@/assets/images/Icon/IconDevices/fan.svg';
import FeederIcon from '@/assets/images/Icon/IconDevices/feeder.svg';
import OxyIcon from '@/assets/images/Icon/IconDevices/oxy.svg';
import SyphonIcon from '@/assets/images/Icon/IconDevices/syphon.svg';

interface ControlContextType {
  ponds: Pond[];
  addPond: () => void;
  connectDeviceToPond: (pondName: string, code?: string) => void;
  toggleDevice: (pondId: string, deviceId: string, isOn: boolean) => void;
}

const ControlContext = createContext<ControlContextType | undefined>(undefined);

const DEFAULT_PONDS: Pond[] = [
  {
    id: '1',
    name: 'Ao 1',
    hasDevices: true,
    deviceStats: {
      fan: { active: 2, warning: 0, inactive: 0 },
      feeder: { active: 1, warning: 0, inactive: 0 },
      oxy: { active: 0, warning: 1, inactive: 0 },
      syphon: { active: 0, warning: 0, inactive: 1 },
    },
    devices: [
      {
        id: 'f1',
        name: 'Máy cho ăn',
        icon: FeederIcon,
        mode: EControlMode.MANUAL,
        isOn: true,
        type: 'feeder',
      },
      {
        id: 'o1',
        name: 'Quạt nước 1',
        icon: FanIcon,
        mode: EControlMode.SCHEDULE,
        isOn: true,
        type: 'fan',
      },
      {
        id: 'o2',
        name: 'Quạt nước 2',
        icon: FanIcon,
        mode: EControlMode.LOCAL,
        isOn: true,
        type: 'fan',
      },
      {
        id: 'o3',
        name: 'Máy thổi khí',
        icon: OxyIcon,
        mode: EControlMode.SCHEDULE,
        isOn: true,
        errorMessage: 'Bị mất khí!',
        type: 'oxy',
      },
      {
        id: 'o4',
        name: 'Syphon',
        icon: SyphonIcon,
        mode: EControlMode.SCHEDULE,
        isOn: false,
        type: 'syphon',
      },
    ],
  },
  {
    id: '2',
    name: 'Ao 2',
    hasDevices: true,
    deviceStats: {
      fan: { active: 2, warning: 0, inactive: 1 },
      feeder: { active: 1, warning: 0, inactive: 1 },
      oxy: { active: 1, warning: 0, inactive: 0 },
      syphon: { active: 1, warning: 0, inactive: 0 },
    },
    devices: [
      // 2 Feeders: 1 ON, 1 OFF
      {
        id: 'a2_f1',
        name: 'Máy cho ăn 1',
        icon: FeederIcon,
        mode: EControlMode.MANUAL,
        isOn: true,
        type: 'feeder',
      },
      {
        id: 'a2_f2',
        name: 'Máy cho ăn 2',
        icon: FeederIcon,
        mode: EControlMode.MANUAL,
        isOn: false,
        type: 'feeder',
      },
      // 3 Fans: 2 ON, 1 OFF
      {
        id: 'a2_fan1',
        name: 'Quạt nước 1',
        icon: FanIcon,
        mode: EControlMode.MANUAL,
        isOn: true,
        type: 'fan',
      },
      {
        id: 'a2_fan2',
        name: 'Quạt nước 2',
        icon: FanIcon,
        mode: EControlMode.MANUAL,
        isOn: true,
        type: 'fan',
      },
      {
        id: 'a2_fan3',
        name: 'Quạt nước 3',
        icon: FanIcon,
        mode: EControlMode.MANUAL,
        isOn: false,
        type: 'fan',
      },
      // 1 Oxy: ON
      {
        id: 'a2_oxy1',
        name: 'Máy thổi khí',
        icon: OxyIcon,
        mode: EControlMode.MANUAL,
        isOn: true,
        type: 'oxy',
      },
      // 1 Syphon: ON
      {
        id: 'a2_syp1',
        name: 'Syphon',
        icon: SyphonIcon,
        mode: EControlMode.MANUAL,
        isOn: true,
        type: 'syphon',
      },
    ],
  },
];

const calculatePondStats = (devices: DeviceData[]): PondDeviceStats => {
  const stats: PondDeviceStats = {
    fan: { active: 0, warning: 0, inactive: 0 },
    feeder: { active: 0, warning: 0, inactive: 0 },
    oxy: { active: 0, warning: 0, inactive: 0 },
    syphon: { active: 0, warning: 0, inactive: 0 },
  };

  devices.forEach(device => {
    const type = device.type;
    if (!stats[type]) return; // Should not happen if typed correctly

    if (device.errorMessage) {
      stats[type].warning++;
    } else if (device.isOn) {
      stats[type].active++;
    } else {
      stats[type].inactive++;
    }
  });

  return stats;
};

export const ControlProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [ponds, setPonds] = useState<Pond[]>(DEFAULT_PONDS);

  // removed storage useEffect

  const addPond = React.useCallback(() => {
    // Disabled
  }, []);

  const connectDeviceToPond = React.useCallback((pondName: string, code?: string) => {
    if (!code) return;

    setPonds(prevPonds =>
      prevPonds.map(p => {
        if (p.name === pondName) {
          let updatedDevices = [...p.devices];
          let newDeviceName = '';

          // Determine type and base name
          const typeMap: Record<
            string,
            { type: 'feeder' | 'fan' | 'oxy' | 'syphon'; name: string; icon: any }
          > = {
            '1': { type: 'feeder', name: 'Máy cho ăn', icon: FeederIcon },
            '2': { type: 'fan', name: 'Quạt nước', icon: FanIcon },
            '3': { type: 'oxy', name: 'Máy thổi khí', icon: OxyIcon },
            '4': { type: 'syphon', name: 'Syphon', icon: SyphonIcon },
          };

          const config = typeMap[code];
          if (!config) return p;

          const targetType = config.type;
          const baseName = config.name;

          const existingTypeDevices = p.devices.filter(d => d.type === targetType);
          const count = existingTypeDevices.length;
          const nextIndex = count + 1;

          // Smart Renaming Logic
          if (['1', '3', '4'].includes(code)) {
            if (count > 0) {
              const firstIndex = updatedDevices.findIndex(d => d.type === targetType);
              if (firstIndex !== -1) {
                updatedDevices[firstIndex] = {
                  ...updatedDevices[firstIndex],
                  name: `${baseName} 1`,
                };
              }
              newDeviceName = `${baseName} ${nextIndex}`;
            } else {
              newDeviceName = `${baseName} ${nextIndex}`;
            }
          }

          const newDevice = createDeviceFromCode(code, nextIndex, newDeviceName);
          if (!newDevice) return p;

          const finalDevices = [...updatedDevices, newDevice];

          return {
            ...p,
            devices: finalDevices,
            hasDevices: true,
            deviceStats: calculatePondStats(finalDevices),
          };
        }
        return p;
      })
    );
  }, []);

  const toggleDevice = React.useCallback((pondId: string, deviceId: string, isOn: boolean) => {
    setPonds(prevPonds =>
      prevPonds.map(pond => {
        if (pond.id !== pondId) return pond;

        const updatedDevices = pond.devices.map(device =>
          device.id === deviceId ? { ...device, isOn } : device
        );

        return {
          ...pond,
          devices: updatedDevices,
          deviceStats: calculatePondStats(updatedDevices),
        };
      })
    );
  }, []);

  const value = React.useMemo(
    () => ({
      ponds,
      addPond,
      connectDeviceToPond,
      toggleDevice,
    }),
    [ponds, addPond, connectDeviceToPond, toggleDevice]
  );

  return <ControlContext.Provider value={value}>{children}</ControlContext.Provider>;
};

const createDeviceFromCode = (
  code: string,
  nextIndex: number,
  specificName?: string
): DeviceData | null => {
  const base = {
    id: `new_${Date.now()}`,
    mode: EControlMode.MANUAL,
    isOn: true,
    errorMessage: undefined,
  };

  switch (code) {
    case '1':
      return {
        ...base,
        name: specificName || `Máy cho ăn ${nextIndex}`, // Use specific name if provided
        icon: FeederIcon,
        type: 'feeder',
      };
    case '2':
      return {
        ...base,
        name: `Quạt nước ${nextIndex}`,
        icon: FanIcon,
        type: 'fan',
      };
    case '3':
      return {
        ...base,
        name: `Máy thổi khí ${nextIndex}`,
        icon: OxyIcon,
        type: 'oxy',
      };
    case '4':
      return {
        ...base,
        name: `Syphon ${nextIndex}`,
        icon: SyphonIcon,
        type: 'syphon',
      };
    default:
      return null;
  }
};

export const useControl = () => {
  const context = useContext(ControlContext);
  if (!context) {
    throw new Error('useControl must be used within a ControlProvider');
  }
  return context;
};
