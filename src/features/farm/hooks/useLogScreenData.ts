import { useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { JobExecution, JobMeta } from '@/features/farm/types/farm.types';
import { PondData } from '@/features/farm/types/farm.types';
import { JobType } from '@/features/farm/components/pondwork/JobItem';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { TrackingGroup, TimelineActivity } from '@/features/farm/components/TrackingList';
import { ActivityData } from '@/features/farm/components/ActivityCard';
import { parseDate, compareTime, formatDate } from '@/features/farm/utils/dateUtils';
import { useDateRangeFilter } from '@/shared/hooks/useDateRangeFilter';

type NavigationProp = NativeStackNavigationProp<FarmStackParamList>;

export interface LogScreenConfig<T extends JobMeta = JobMeta> {
    /** Job type to fetch */
    jobType: JobType;
    /** Pond data (can be undefined if using pondId) */
    pond?: PondData;
    /** Pond ID (alternative to pond object) */
    pondId?: string;
    /** Function to convert meta to ActivityData */
    metaConverter: (item: JobExecution, meta: T) => ActivityData[];
    /** Optional filter function to filter items before conversion */
    itemFilter?: (item: JobExecution, meta: T) => boolean;
    /** Navigation route for edit screen */
    editRoute: keyof FarmStackParamList;
    /** Function to get edit params */
    getEditParams: (pond: PondData, item: JobExecution) => any;
    /** Optional external data to use instead of store */
    externalData?: JobExecution[];
    /** Controlled start date */
    startDate?: Date;
    /** Controlled end date */
    endDate?: Date;
    /** Controlled set start date */
    setStartDate?: (date: Date) => void;
    /** Controlled set end date */
    setEndDate?: (date: Date) => void;
}

export interface UseLogScreenDataResult {
    /** Start date for filtering */
    startDate: Date;
    /** End date for filtering */
    endDate: Date;
    /** Setter for start date */
    setStartDate: (date: Date) => void;
    /** Setter for end date */
    setEndDate: (date: Date) => void;
    /** Grouped data ready for display */
    groupedData: TrackingGroup[];
    /** Whether data is empty */
    isEmpty: boolean;
}

/**
 * Hook to handle common log screen logic:
 * - Date range state management
 * - Data fetching and grouping by date
 * - Meta to ActivityData conversion
 * - Navigation for edit
 *
 * @example
 * ```tsx
 * const config: LogScreenConfig<EnvironmentMeta> = {
 *   jobType: 'ENVIRONMENT',
 *   pond,
 *   metaConverter: (item, meta) => {
 *     const data: ActivityData[] = [];
 *     if (meta.pH) data.push({ label: 'pH:', value: meta.pH });
 *     return data;
 *   },
 *   editRoute: 'AddEnvironmentScreen',
 *   getEditParams: (pond, item) => ({ pond, itemToEdit: item }),
 * };
 *
 * const { startDate, endDate, setStartDate, setEndDate, groupedData, isEmpty } =
 *   useLogScreenData(config);
 * ```
 */
export const useLogScreenData = <T extends JobMeta = JobMeta>(
    config: LogScreenConfig<T>
): UseLogScreenDataResult => {
    const navigation = useNavigation<NavigationProp>();

    const {
        startDate: internalStartDate,
        endDate: internalEndDate,
        setStartDate: setInternalStartDate,
        setEndDate: setInternalEndDate,
    } = useDateRangeFilter();

    const startDate = config.startDate || internalStartDate;
    const endDate = config.endDate || internalEndDate;
    const setStartDate = config.setStartDate || setInternalStartDate;
    const setEndDate = config.setEndDate || setInternalEndDate;

    const pondId = config.pond?.id || config.pondId;

    const groupedData: TrackingGroup[] = useMemo(() => {
        if (!pondId || !config.externalData) return [];

        // Data is already filtered by API via date params — just group by date
        const itemsByDate = new Map<string, JobExecution[]>();
        config.externalData.forEach(item => {
            const dateStr = item.date;
            const date = dateStr
                ? dateStr.includes('/')
                    ? parseDate(dateStr)
                    : new Date(dateStr)
                : new Date();
            const dateKey = formatDate(date);
            if (!itemsByDate.has(dateKey)) itemsByDate.set(dateKey, []);
            itemsByDate.get(dateKey)!.push(item);
        });

        itemsByDate.forEach(items =>
            items.sort((a, b) => compareTime(b.time ?? '00:00', a.time ?? '00:00'))
        );

        if (itemsByDate.size === 0) return [];

        const groups: TrackingGroup[] = [];

        itemsByDate.forEach((dateItems, dateKey) => {
            // Apply filter if provided
            const filteredItems = config.itemFilter
                ? dateItems.filter(item => {
                      const meta = (item.meta as T) || ({} as T);
                      return config.itemFilter!(item, meta);
                  })
                : dateItems;

            if (filteredItems.length === 0) return;

            const activities: TimelineActivity[] = filteredItems.map(item => {
                const meta = (item.meta as T) || ({} as T);
                return {
                    id: item.id,
                    time: item.time,
                    title: item.label,
                    data: config.metaConverter(item, meta),
                    note: item.note,
                    onEdit: () => {
                        if (config.pond) {
                            const params = config.getEditParams(config.pond, item);
                            navigation.navigate(config.editRoute as any, params);
                        } else if (config.pondId) {
                            const pondData = { id: config.pondId } as PondData;
                            const params = config.getEditParams(pondData, item);
                            navigation.navigate(config.editRoute as any, params);
                        }
                    },
                };
            });

            groups.push({
                id: dateKey,
                date: dateKey,
                activities: activities.sort((a, b) => {
                    const timeCompare = compareTime(b.time, a.time);
                    if (timeCompare !== 0) return timeCompare;

                    // If times are equal, sort by "Lần X" in title (descending - newest first)
                    const getInstanceNumber = (title: string): number | null => {
                        const match = title.match(/Lần\s+(\d+)/i);
                        return match ? parseInt(match[1], 10) : null;
                    };

                    const instanceA = getInstanceNumber(a.title);
                    const instanceB = getInstanceNumber(b.title);

                    if (instanceA !== null && instanceB !== null) {
                        return instanceB - instanceA;
                    }

                    return 0;
                }),
            });
        });

        // Sort groups by date (newest first)
        return groups.sort((a, b) => {
            const dateA = parseDate(a.date);
            const dateB = parseDate(b.date);
            return dateB.getTime() - dateA.getTime();
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pondId, config, navigation, config.externalData]);

    return {
        startDate,
        endDate,
        setStartDate,
        setEndDate,
        groupedData,
        isEmpty: groupedData.length === 0,
    };
};
