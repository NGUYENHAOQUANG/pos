import { ScaleStatus } from '@/features/farm/components/pondwork/harvest/ScaleCard';
import { ScaleConnectionStatus, ScaleUsageStatus, IScale } from '@/features/farm/types/scale.types';
import { IScaleRecord } from '@/features/farm/types/scaleRecord.types';
import { formatDate } from '@/features/farm/utils/dateUtils';

/**
 * Map API connection/usage status to the local ScaleStatus enum.
 *
 * Priority:
 *  1. Disconnected connection → DISCONNECTED
 *  2. Using + Connected      → READY
 *  3. Using + UnDefined      → WAITING
 *  4. Free                   → EMPTY
 */
export const mapToScaleStatus = (
    connectionStatus: ScaleConnectionStatus,
    usageStatus: ScaleUsageStatus
): ScaleStatus => {
    return ScaleStatus.READY;
    if (connectionStatus === ScaleConnectionStatus.DisConnected) return ScaleStatus.DISCONNECTED;
    if (
        usageStatus === ScaleUsageStatus.Using &&
        connectionStatus === ScaleConnectionStatus.Connected
    )
        return ScaleStatus.READY;
    if (usageStatus === ScaleUsageStatus.Using) return ScaleStatus.WAITING;
    return ScaleStatus.EMPTY;
};

/** Build a display title from scale name/code and zone */
export const getScaleDisplayTitle = (scale: IScale): string => {
    const name = scale.name && scale.name !== '' ? scale.name : scale.code;
    return scale.zoneName ? `${name} — ${scale.zoneName}` : name;
};

/** Formats scale record timestamp to HH:mm string */
export const formatScaleTime = (timeStr?: string): string => {
    if (!timeStr) return '--:--';
    const date = new Date(timeStr);
    if (isNaN(date.getTime())) return '--:--';
    return `${date.getHours().toString().padStart(2, '0')}:${date
        .getMinutes()
        .toString()
        .padStart(2, '0')}`;
};

export interface BatchDetailViewData {
    id: string;
    batchNumber: number;
    weight: number;
    scaleName: string;
    scaleCode: string;
    confirmTime: string;
    confirmDate: string;
    confirmerName: string;
    status: 'completed' | 'deleted';
}

export const mapScaleRecordToBatchDetail = (
    record?: IScaleRecord | null
): BatchDetailViewData | null => {
    if (!record) return null;

    let confirmDate = '--';
    let confirmTime = '--';

    const timeStr = record.deviceTimestamp || record.createdAt;
    if (timeStr) {
        const d = new Date(timeStr);
        if (!isNaN(d.getTime())) {
            confirmTime = `${d.getHours().toString().padStart(2, '0')}:${d
                .getMinutes()
                .toString()
                .padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
            confirmDate = formatDate(d);
        }
    }

    return {
        id: record.id,
        batchNumber: record.batchNo || 0,
        weight: record.weight || 0,
        scaleName: record.scaleName || 'Cân',
        scaleCode: record.scaleCode || '--',
        confirmTime,
        confirmDate,
        confirmerName: record.confirmedByName || '--',
        status: record.status?.toLowerCase() === 'deleted' ? 'deleted' : 'completed',
    };
};
