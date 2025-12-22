import { useState, useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFarm } from '@/features/farm/context/FarmContext';
import { JobExecution, JobMeta } from '@/features/farm/types/farm.types';
import { PondData } from '@/features/farm/types/farm.types';
import { JobType } from '@/features/farm/components/pondwork/JobItem';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { TrackingGroup, TimelineActivity } from '@/features/farm/components/TrackingList';
import { ActivityData } from '@/features/farm/components/ActivityCard';
import { parseDate, compareTime } from '@/features/farm/utils/dateUtils';

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
  const { getPondJobItemsGroupedByDate } = useFarm();

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const pondId = config.pond?.id || config.pondId;

  const groupedData: TrackingGroup[] = useMemo(() => {
    if (!pondId) return [];

    // All job types now use item.date, so we can use getPondJobItemsGroupedByDate for all
    const itemsByDate = getPondJobItemsGroupedByDate(pondId, config.jobType, startDate, endDate);

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
            // Handle both pond object and pondId cases
            if (config.pond) {
              const params = config.getEditParams(config.pond, item);
              navigation.navigate(config.editRoute as any, params);
            } else if (config.pondId) {
              // Create a minimal pond object for getEditParams if only pondId is available
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
        activities: activities.sort((a, b) => compareTime(b.time, a.time)),
      });
    });

    // Sort groups by date (oldest first)
    return groups.sort((a, b) => {
      const dateA = parseDate(a.date);
      const dateB = parseDate(b.date);
      return dateA.getTime() - dateB.getTime();
    });
  }, [pondId, config, getPondJobItemsGroupedByDate, startDate, endDate, navigation]);

  return {
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    groupedData,
    isEmpty: groupedData.length === 0,
  };
};
