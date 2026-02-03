import React, { useState, useMemo } from 'react';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { BaseLogScreen } from '@/features/farm/components/BaseLogScreen';
import { TrackingGroup, TimelineActivity } from '@/features/farm/components/TrackingList';
import { ActivityData } from '@/features/farm/components/ActivityCard';
import { useEnvMeasurements } from '@/features/farm/hooks/useEnvMeasurement';
import {
    useEnvironmentInit,
    useZoneResolution,
} from '@/features/farm/hooks/envhooks/useEnvironmentLogic';
import { useFarmStore } from '@/features/farm/store/farmStore';
import { ENVIRONMENT_METRIC_IDS } from '@/features/farm/types/farm.types';

type NavigationProp = NativeStackNavigationProp<FarmStackParamList>;
type ScreenRouteProp = RouteProp<FarmStackParamList, 'EnvironmentLogScreen'>;

export const EnvironmentLogScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ScreenRouteProp>();
    const { pond } = route.params || {};

    const zones = useFarmStore(state => state.zones);
    const currentZone = useZoneResolution(pond, zones);

    // Initialize environment data (fetch metric types)
    const { metricTypes } = useEnvironmentInit(currentZone ? String(currentZone.id) : undefined);

    // Date range state
    const [startDate, setStartDate] = useState<Date>(() => {
        const date = new Date();
        return new Date(date.getFullYear(), date.getMonth(), 1);
    });
    const [endDate, setEndDate] = useState<Date>(new Date());

    // Fetch environment measurements from API
    const { data: envMeasurementsData, isLoading } = useEnvMeasurements(pond?.id || '', {
        // You can add date filtering params here if the API supports it
    });

    // Transform API data to TrackingGroup[] format expected by BaseLogScreen
    const groupedData: TrackingGroup[] = useMemo(() => {
        if (!envMeasurementsData?.data?.items || metricTypes.length === 0) return [];

        const measurements = envMeasurementsData.data.items;

        // 1. Group raw measurements by date
        const rawGrouped = new Map<string, any[]>();
        measurements.forEach((m: any) => {
            const date = new Date(m.createdAt);
            const dateKey = date.toLocaleDateString('en-CA'); // YYYY-MM-DD

            if (!rawGrouped.has(dateKey)) {
                rawGrouped.set(dateKey, []);
            }
            rawGrouped.get(dateKey)!.push(m);
        });

        const groups: TrackingGroup[] = [];

        // 2. Process each day
        rawGrouped.forEach((dayMeasurements, dateKey) => {
            // Sort ASC by creation time to assign sequential numbers (1, 2, 3...)
            dayMeasurements.sort(
                (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );

            // Map to Activity Data with calculated index
            const activities: TimelineActivity[] = dayMeasurements.map((measurement, index) => {
                const entryNumber = index + 1; // Local numbering: 1, 2, 3...
                const date = new Date(measurement.createdAt);

                // Convert measurements array to activity data format
                const activityData: ActivityData[] = [];

                measurement.envMeasurementDetails?.forEach((m: any) => {
                    const metric = metricTypes.find((mt: any) => mt.id === m.metricId);
                    if (!metric) return;

                    let label = '';
                    let unit = '';

                    switch (metric.code) {
                        case ENVIRONMENT_METRIC_IDS.PH:
                            label = 'pH';
                            unit = '';
                            break;
                        case ENVIRONMENT_METRIC_IDS.DO:
                            label = 'Oxy hòa tan';
                            unit = 'mg/L';
                            break;
                        case ENVIRONMENT_METRIC_IDS.TEMPERATURE:
                            label = 'Nhiệt độ';
                            unit = '°C';
                            break;
                        case ENVIRONMENT_METRIC_IDS.SALINITY:
                            label = 'Độ mặn';
                            unit = 'ppt';
                            break;
                        case ENVIRONMENT_METRIC_IDS.ALKALINITY:
                            label = 'Độ kiềm';
                            unit = 'mg/L';
                            break;
                        case ENVIRONMENT_METRIC_IDS.TRANSPARENCY:
                            label = 'Độ trong';
                            unit = 'cm';
                            break;
                        case ENVIRONMENT_METRIC_IDS.KALI:
                            label = 'Kali';
                            unit = 'mg/L';
                            break;
                        case ENVIRONMENT_METRIC_IDS.TAN:
                            label = 'TAN';
                            unit = 'mg/L';
                            break;
                        case ENVIRONMENT_METRIC_IDS.MAGIE:
                            label = 'Magie';
                            unit = 'mg/L';
                            break;
                        case ENVIRONMENT_METRIC_IDS.NO3:
                            label = 'NO3';
                            unit = 'mg/L';
                            break;
                        default:
                            label = metric.name;
                            unit = '';
                    }

                    activityData.push({
                        label,
                        value: m.value.toString(),
                        unit,
                        isWarning: m.isAlerted || false,
                    });
                });

                return {
                    id: measurement.id,
                    time: date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
                    title: `Lần ${entryNumber}`,
                    data: activityData,
                    onEdit: () => {
                        if (pond) {
                            const itemToEdit = {
                                id: measurement.id,
                                label: `Lần ${entryNumber}`,
                                time: date.toLocaleTimeString('en-GB', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                }),
                                date: dateKey,
                                pondId: measurement.pondId,
                            };

                            navigation.navigate('AddEnvironmentScreen', {
                                pond,
                                itemToEdit,
                            });
                        }
                    },
                };
            });

            // Sort activities DESC by time for display (Newest "Lần 3" on top)
            activities.sort((a, b) => {
                const timeA = a.time.split(':').map(Number);
                const timeB = b.time.split(':').map(Number);
                const minutesA = timeA[0] * 60 + timeA[1];
                const minutesB = timeB[0] * 60 + timeB[1];
                return minutesB - minutesA;
            });

            groups.push({
                id: dateKey,
                date: dateKey,
                activities,
            });
        });

        // Sort groups by date DESC (Newest date on top)
        return groups.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateB.getTime() - dateA.getTime();
        });
    }, [envMeasurementsData, metricTypes, pond, navigation]);

    const handleStartEnvironment = () => {
        if (pond) {
            navigation.navigate('AddEnvironmentScreen', { pond });
        }
    };

    return (
        <BaseLogScreen
            title="Nhật ký đo môi trường"
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            groupedData={groupedData}
            emptyMessage="Chưa có dữ liệu đo môi trường"
            emptyButtonTitle="Bắt đầu đo thông số môi trường"
            onEmptyButtonPress={handleStartEnvironment}
            isLoading={isLoading}
        />
    );
};
