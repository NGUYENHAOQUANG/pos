import { ScaleStatus } from '@/features/farm/components/pondwork/harvest/ScaleCard';
import { ScaleConnectionStatus, ScaleUsageStatus } from '@/features/farm/types/scale.types';

/**
 * Map API connection/usage status to the local ScaleStatus enum.
 *
 * Priority:
 *  1. Disconnected connection → DISCONNECTED
 *  2. InUse + Connected      → READY
 *  3. InUse + UnDefined      → WAITING
 *  4. Free                   → EMPTY
 */
export const mapToScaleStatus = (
    connectionStatus: ScaleConnectionStatus,
    usageStatus: ScaleUsageStatus
): ScaleStatus => {
    if (connectionStatus === 'Disconnected') return ScaleStatus.DISCONNECTED;
    if (usageStatus === 'InUse' && connectionStatus === 'Connected') return ScaleStatus.READY;
    if (usageStatus === 'InUse') return ScaleStatus.WAITING;
    return ScaleStatus.EMPTY;
};

/** Build a display title from scale name/code and zone */
export const getScaleDisplayTitle = (scale: IScaleItem): string => {
    const name = scale.name && scale.name !== '' ? scale.name : scale.code;
    return scale.zoneName ? `${name} — ${scale.zoneName}` : name;
};
