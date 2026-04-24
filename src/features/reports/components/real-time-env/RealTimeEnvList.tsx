import React from 'react';
import { View } from 'react-native';
import { RealTimeEnvCard } from './RealTimeEnvCard';
import Peformance from '@/assets/Icon/IconReport/Peformance.svg';
import DropIcon from '@/assets/Icon/IconReport/Drop.svg';

export interface SensorConfig {
    metricKey: string;
    title: string;
    defaultYMax: number;
    unit?: string;
    icon?: React.ReactNode;
}

/**
 * List of sensor configurations.
 * If there are new sensors in the future (DO, Salinity, ORP...),
 * you ONLY NEED to add an object to this array, and the UI will automatically render the Card.
 */
const SENSOR_CONFIGS: SensorConfig[] = [
    {
        metricKey: 'temp',
        title: 'Nhiệt độ',
        defaultYMax: 50,
        unit: '°C',
        icon: <Peformance width={20} height={20} />,
    },
    {
        metricKey: 'pH',
        title: 'pH',
        defaultYMax: 14,
        icon: <DropIcon width={20} height={20} />,
    },
    // Example for future additions:
    // {
    //     metricKey: 'do',
    //     title: 'Oxy hoà tan (DO)',
    //     defaultYMax: 20,
    //     icon: <DoIcon width={20} height={20} />
    // }
];

interface RealTimeEnvListProps {
    pondId?: string;
}

export const RealTimeEnvList = ({ pondId }: RealTimeEnvListProps) => {
    return (
        <View style={{ gap: 8 }}>
            {SENSOR_CONFIGS.map(config => (
                <RealTimeEnvCard
                    key={config.metricKey}
                    pondId={pondId}
                    metricKey={config.metricKey}
                    title={config.title}
                    defaultYMax={config.defaultYMax}
                    unit={config.unit}
                    icon={config.icon}
                />
            ))}
        </View>
    );
};
