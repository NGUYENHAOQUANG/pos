import { PondRecordOperationType } from '@/features/farm/types/pondRecord.types';

export const pondRecordService = {
    getOperationTypeName: (
        operationType: PondRecordOperationType | string | undefined | null
    ): string => {
        if (!operationType) return '-';

        switch (operationType) {
            case PondRecordOperationType.ReleaseShrimp:
                return 'Thả tôm giống';
            case PondRecordOperationType.Feeding:
                return 'Cho ăn';
            case PondRecordOperationType.ShrimpHealthCheck:
                return 'Kiểm tra tôm';
            case PondRecordOperationType.SizeMeasurement:
                return 'Đo kích thước tôm';
            case PondRecordOperationType.EnvMeasurement:
                return 'Đo thông số môi trường';
            case PondRecordOperationType.WaterTreatment:
                return 'Xử lý nước';
            case PondRecordOperationType.WaterChange:
                return 'Thay/Cấp nước';
            case PondRecordOperationType.Siphon:
                return 'Xi-phông';
            case PondRecordOperationType.Incident:
                return 'Xử lý sự cố';
            case PondRecordOperationType.StockTransfer:
                return 'Sang ao';
            case PondRecordOperationType.CleanPond:
            case PondRecordOperationType.CleanRenovation:
                return 'Rửa ao';
            case PondRecordOperationType.SunDryPond:
            case PondRecordOperationType.DryRenovation:
                return 'Phơi ao';
            case PondRecordOperationType.Harvest:
                return 'Thu hoạch';
            default:
                return operationType; // Fallback to raw string
        }
    },
};
