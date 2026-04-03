import { formatDate, parseDate, compareTime } from '@/features/farm/utils/dateUtils';
import { ActivityData } from '@/features/farm/components/ActivityCard';
import { TrackingGroup, TimelineActivity } from '@/features/farm/components/TrackingList';
import { JobExecution, JobMeta } from '@/features/farm/types/farm.types';
import { PondLogMaterialType } from '@/shared/types/common.types';

export type DailyCountMap = Record<string, number>;

/**
 * Sorts an array of log records descending by their `createdAt` timestamp.
 * Items without a `createdAt` value are treated as having a timestamp of 0.
 *
 * @param items Array of log records containing a `createdAt` field (string or Date).
 * @returns A new array sorted from newest to oldest.
 */
export const sortLogsByCreatedAtDesc = <T extends { createdAt?: string | Date }>(
    items: T[]
): T[] => {
    return [...items].sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
    });
};

/**
 * Calculates the execution index (Lần 1, Lần 2...) for jobs occurring on the same day.
 */
export const calculateDailyIndex = (
    createdDate: Date,
    dayCounts: DailyCountMap,
    totalPerDay: DailyCountMap
): number => {
    const dateKey = `${createdDate.getFullYear()}-${createdDate.getMonth()}-${createdDate.getDate()}`;

    if (!dayCounts[dateKey]) dayCounts[dateKey] = 0;
    dayCounts[dateKey]++;
    const total = totalPerDay[dateKey] ?? dayCounts[dateKey];
    return total - dayCounts[dateKey] + 1;
};

/**
 * Formats a Date object into standard time ('HH:mm') and date strings.
 */
export const formatTimeAndDate = (createdDate: Date): { timeStr: string; dateStr: string } => {
    return {
        timeStr: createdDate.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
        }),
        dateStr: formatDate(createdDate),
    };
};

export function pushMaterialRows(
    data: ActivityData[],
    materials: PondLogMaterialType[] | undefined,
    materialMap: Record<string, { name?: string; unitName?: string }>
): void {
    if (!materials || !materials.length) return;
    materials.forEach(m => {
        const mat = materialMap[m.warehouseItemId];
        const matName = mat?.name || m.name || 'Vật tư';
        const matUnit = mat?.unitName || m.unitName;
        const label = matUnit ? `${matName} (${matUnit})` : matName;
        data.push({ label, value: m.quantity });
    });
}

// ════════════════════════════════════════════════════════════════════
// Log Screen Grouping Utilities
// ════════════════════════════════════════════════════════════════════

/**
 * Group JobExecution items by date into a Map.
 * Items within each group are sorted DESC by time.
 */
export const groupJobsByDate = (items: JobExecution[]): Map<string, JobExecution[]> => {
    const itemsByDate = new Map<string, JobExecution[]>();

    items.forEach(item => {
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

    // Sort each group DESC by time
    itemsByDate.forEach(group =>
        group.sort((a, b) => compareTime(b.time ?? '00:00', a.time ?? '00:00'))
    );

    return itemsByDate;
};

/**
 * Extract the "Lần X" instance number from a title string.
 * Returns null if not found.
 */
export const getInstanceNumber = (title: string): number | null => {
    const match = title.match(/Lần\s+(\d+)/i);
    return match ? parseInt(match[1], 10) : null;
};

/**
 * Sort timeline activities: DESC by time, then DESC by instance number ("Lần X").
 */
export const sortActivitiesByTimeAndInstance = (
    activities: TimelineActivity[]
): TimelineActivity[] => {
    return [...activities].sort((a, b) => {
        const timeCompare = compareTime(b.time, a.time);
        if (timeCompare !== 0) return timeCompare;

        const instanceA = getInstanceNumber(a.title);
        const instanceB = getInstanceNumber(b.title);

        if (instanceA !== null && instanceB !== null) {
            return instanceB - instanceA;
        }
        return 0;
    });
};

/**
 * Convert grouped JobExecution items into sorted TrackingGroup[] for BaseLogScreen.
 *
 * @param items         - Flat list of JobExecution items
 * @param metaConverter - Function to convert (item, meta) → ActivityData[]
 * @param onEdit        - Optional callback when user taps edit on an activity
 * @param itemFilter    - Optional filter applied before conversion
 */
export const buildTrackingGroups = <T extends JobMeta = JobMeta>(
    items: JobExecution[],
    metaConverter: (item: JobExecution, meta: T) => ActivityData[],
    onEdit?: (item: JobExecution) => void,
    itemFilter?: (item: JobExecution, meta: T) => boolean
): TrackingGroup[] => {
    const itemsByDate = groupJobsByDate(items);

    if (itemsByDate.size === 0) return [];

    const groups: TrackingGroup[] = [];

    itemsByDate.forEach((dateItems, dateKey) => {
        const filteredItems = itemFilter
            ? dateItems.filter(item => {
                  const meta = (item.meta as T) || ({} as T);
                  return itemFilter(item, meta);
              })
            : dateItems;

        if (filteredItems.length === 0) return;

        const activities: TimelineActivity[] = filteredItems.map(item => {
            const meta = (item.meta as T) || ({} as T);
            return {
                id: item.id,
                time: item.time,
                title: item.label,
                data: metaConverter(item, meta),
                note: item.note,
                onEdit: onEdit ? () => onEdit(item) : undefined,
            };
        });

        groups.push({
            id: dateKey,
            date: dateKey,
            activities: sortActivitiesByTimeAndInstance(activities),
        });
    });

    // Sort groups by date (newest first)
    return groups.sort((a, b) => {
        const dateA = parseDate(a.date);
        const dateB = parseDate(b.date);
        return dateB.getTime() - dateA.getTime();
    });
};
