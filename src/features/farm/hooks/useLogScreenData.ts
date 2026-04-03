import { useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { JobExecution, JobMeta, PondData } from '@/features/farm/types/farm.types';
import { JobType } from '@/features/farm/components/pondwork/JobItem';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { TrackingGroup } from '@/features/farm/components/TrackingList';
import { ActivityData } from '@/features/farm/components/ActivityCard';
import { useDateRangeFilter } from '@/shared/hooks/useDateRangeFilter';
import { buildTrackingGroups } from '@/features/farm/utils/work-log.utils';

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
 * - Data grouping by date (delegated to utils)
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

        const handleEdit = (item: JobExecution) => {
            if (config.pond) {
                const params = config.getEditParams(config.pond, item);
                navigation.navigate(config.editRoute as any, params);
            } else if (config.pondId) {
                const pondData = { id: config.pondId } as PondData;
                const params = config.getEditParams(pondData, item);
                navigation.navigate(config.editRoute as any, params);
            }
        };

        return buildTrackingGroups<T>(
            config.externalData,
            config.metaConverter,
            handleEdit,
            config.itemFilter
        );
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
