import { colors } from '@/styles';
import { HealthDetectionBox } from '@/features/farm/components/boderbox/ShrimpHealthBoundingBoxOverlay';

export type HealthStatus = 'HEALTHY' | 'WARNING' | 'CRITICAL';

export interface HealthCheckItem {
    id: string;
    index: number;
    status: HealthStatus;
    diagnosis: string;
    confidence: number;
}

export interface HealthCheckResult {
    id: number;
    totalCount: number;
    items: HealthCheckItem[];
    healthStatusSummary: string;
    infectionRate: number;
}

interface ShrimpHealthPrediction {
    id: number;
    bbox: number[];
    segConf: number;
    prediction: {
        top1Class: string;
        top1Conf: number;
    };
}

export interface ShrimpHealthApiResponse {
    results: ShrimpHealthPrediction[];
}

export const mapClassToStatus = (
    className: string
): { status: HealthStatus; diagnosis: string } => {
    switch (className) {
        case 'Healthy':
            return { status: 'HEALTHY', diagnosis: 'Khỏe mạnh' };
        case 'Black Gill':
            return { status: 'WARNING', diagnosis: 'Mang đen' };
        case 'WSSV':
            return { status: 'CRITICAL', diagnosis: 'Đốm trắng' };
        case 'Yellowhead':
        case 'Yellow Head':
            return { status: 'CRITICAL', diagnosis: 'Đầu vàng' };
        default:
            return { status: 'WARNING', diagnosis: className };
    }
};

export const getStatusColor = (status: HealthStatus) => {
    switch (status) {
        case 'HEALTHY':
            return colors.healthStatus.healthy;
        case 'WARNING':
            return colors.healthStatus.warning;
        case 'CRITICAL':
            return colors.healthStatus.critical;
        default:
            return colors.healthStatus.default;
    }
};

export const getStatusIcon = (status: HealthStatus) => {
    switch (status) {
        case 'HEALTHY':
            return 'checkmark-circle-outline';
        case 'WARNING':
            return 'alert-circle-outline';
        case 'CRITICAL':
            return 'close-circle-outline';
        default:
            return 'help-circle-outline';
    }
};

export const shrimpHealthAIService = {
    mapPredictResponse: (
        response: ShrimpHealthApiResponse
    ): { result: HealthCheckResult; detections: HealthDetectionBox[] } => {
        const detailedItems: HealthCheckItem[] = response.results.map(r => {
            const { status, diagnosis } = mapClassToStatus(r.prediction.top1Class);
            return {
                id: `${Date.now()}-${r.id}`,
                index: r.id,
                status,
                diagnosis,
                confidence: Math.round(r.prediction.top1Conf * 100),
            };
        });

        const issuesCount = detailedItems.filter(i => i.status !== 'HEALTHY').length;
        const totalCount = detailedItems.length;
        const infectionRate =
            totalCount > 0 ? parseFloat(((issuesCount / totalCount) * 100).toFixed(2)) : 0;

        const result: HealthCheckResult = {
            id: Date.now(),
            totalCount,
            items: detailedItems,
            healthStatusSummary: issuesCount > 0 ? 'Phát hiện bệnh' : 'Tôm khỏe mạnh',
            infectionRate,
        };

        const detections: HealthDetectionBox[] = response.results.map(r => {
            const { status, diagnosis } = mapClassToStatus(r.prediction.top1Class);
            return {
                id: r.id,
                bbox: r.bbox,
                label: `${diagnosis} (${Math.round(r.prediction.top1Conf * 100)}%)`,
                confidence: r.segConf,
                color: getStatusColor(status),
            };
        });

        return { result, detections };
    },
};
