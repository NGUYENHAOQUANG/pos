import { JobExecution } from '@/features/farm/types/farm.types';
import { ActivityData } from '@/features/farm/components/ActivityCard';
import { DailyCountMap } from '@/features/farm/utils/work-log.utils';
import { IPondRecordReferenceData } from '@/features/farm/types/pondRecord.types';

export interface IBaseLogService<TRawRecord> {
    mapRecordsToJobs(rawItems: TRawRecord[], ...extraContexts: unknown[]): JobExecution[];

    mapRecordToJobExecution(
        item: TRawRecord,
        dayCounts: DailyCountMap,
        totalPerDay: DailyCountMap,
        ...extraContexts: unknown[]
    ): JobExecution;

    convertReferenceDataToActivityData(
        ref: IPondRecordReferenceData | Record<string, unknown>,
        ...extraContexts: unknown[]
    ): ActivityData[];
}
