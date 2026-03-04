import { CycleData, JobExecution, JOB_TYPES } from '@/features/farm/types/farm.types';
import { JobType } from '@/features/farm/components/pondwork/JobItem';
import { PondTypeOperation } from '@/features/farm/types/pondOperation.types';
import { mapOperationTypeToJobType } from '@/features/farm/utils/operationTypeMapping';
import { parseDate } from '@/features/farm/utils/dateUtils';

export const pondDetailService = {
    calculateDOC: (startDateString: string | null | undefined): number => {
        if (!startDateString) return 0;
        const start =
            typeof startDateString === 'string' && startDateString.includes('/')
                ? parseDate(startDateString)
                : new Date(startDateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - start.getTime());
        return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    },

    getBreedName: (
        currentCycle: CycleData | null | undefined,
        shrimpSeeds: any[] | undefined,
        breedOptions: { value: string; label: string }[]
    ): string => {
        if (!currentCycle) return 'N/A';

        return (
            currentCycle.breedName ||
            shrimpSeeds?.find(
                (s: any) =>
                    s.id === currentCycle.breedSource ||
                    s.id === (currentCycle as any).warehouseItemId
            )?.materialName ||
            breedOptions.find(
                b =>
                    b.value === currentCycle.breedSource ||
                    b.value === (currentCycle as any).warehouseItemId
            )?.label ||
            'N/A'
        );
    },

    getTransferBreedName: (
        currentCycle: CycleData | null | undefined,
        breedOptions: { value: string; label: string }[]
    ): string => {
        if (!currentCycle?.transferInfo?.originalCycle) return 'N/A';
        return (
            breedOptions.find(b => b.value === currentCycle.transferInfo?.originalCycle.breedSource)
                ?.label || 'N/A'
        );
    },

    getLatestShrimpSize: (apiMeasureSizeJobs: JobExecution[]): string | undefined => {
        if (!apiMeasureSizeJobs || apiMeasureSizeJobs.length === 0) return undefined;

        const sorted = [...apiMeasureSizeJobs].sort((a, b) => {
            const dateA = a.date ? parseDate(a.date) : new Date(0);
            const dateB = b.date ? parseDate(b.date) : new Date(0);
            if (dateA.getTime() !== dateB.getTime()) {
                return dateB.getTime() - dateA.getTime();
            }
            const timeA = a.time || '00:00';
            const timeB = b.time || '00:00';
            const [hoursA, minutesA] = timeA.split(':').map(Number);
            const [hoursB, minutesB] = timeB.split(':').map(Number);
            return hoursB * 60 + minutesB - (hoursA * 60 + minutesA);
        });

        const latestItem = sorted[0];
        const latestMeta = latestItem?.meta as { shrimpSize?: string } | undefined;
        return latestMeta?.shrimpSize;
    },

    generateNextJobItem: (currentItems: JobExecution[], pondId: string): JobExecution => {
        let maxIndex = 0;
        currentItems.forEach(item => {
            const match = item.label.match(/Lần (\d+)/);
            if (match) {
                const index = parseInt(match[1], 10);
                if (index > maxIndex) maxIndex = index;
            }
        });
        const nextIndex = maxIndex + 1;
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
        });
        return {
            id: Date.now().toString(),
            label: `Lần ${nextIndex}`,
            time: timeString,
            pondId,
        };
    },

    mapJobsWithPriorities: (
        pondOperations: PondTypeOperation[],
        apiItemsByJobType: Partial<Record<JobType, JobExecution[]>>,
        fallbackItemsByJobType: (jobType: JobType) => JobExecution[]
    ): { type: JobType; items: JobExecution[] }[] => {
        const JOB_PRIORITY: Record<JobType, number> = {
            [JOB_TYPES.FEED]: 1,
            [JOB_TYPES.SHRIMP_INSPECTION]: 2,
            [JOB_TYPES.MEASURE_SIZE]: 3,
            [JOB_TYPES.ENVIRONMENT]: 4,
            [JOB_TYPES.WATER_TREATMENT]: 5,
            [JOB_TYPES.WATER_CHANGE]: 6,
            [JOB_TYPES.SIPHON]: 7,
            [JOB_TYPES.TROUBLESHOOTING]: 8,
            [JOB_TYPES.TRANSFER_POND]: 9,
            [JOB_TYPES.HARVEST]: 10,
            [JOB_TYPES.CLEAN_POND]: 11,
            [JOB_TYPES.SUN_DRY_POND]: 12,
        };

        const jobTypes: { type: JobType; items: JobExecution[] }[] = [];

        for (const operation of pondOperations) {
            const opName = operation.operationName || operation.operationTypeName || '';
            const jobType = mapOperationTypeToJobType(opName);

            if (!jobType) continue;

            const apiItems = apiItemsByJobType[jobType];
            const items = apiItems ?? fallbackItemsByJobType(jobType);

            jobTypes.push({ type: jobType, items });
        }

        return jobTypes.sort((a, b) => {
            const priorityA = JOB_PRIORITY[a.type] ?? 99;
            const priorityB = JOB_PRIORITY[b.type] ?? 99;
            return priorityA - priorityB;
        });
    },
};
