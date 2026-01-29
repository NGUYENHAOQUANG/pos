/**
 * @file operationTypeMapping.ts
 * @description Mapping between API OperationType names and app JobType codes
 */

import { JobType } from '@/features/farm/components/pondwork/JobItem';
export const OPERATION_TYPE_TO_JOB_TYPE: Record<string, JobType> = {
    Feeding: 'FEED',
    ShrimpHealthCheck: 'SHRIMP_INSPECTION',
    SizeMeasurement: 'MEASURE_SIZE',
    EnvMeasurement: 'ENVIRONMENT',
    WaterTreatment: 'WATER_TREATMENT',
    WaterChange: 'WATER_CHANGE',
    Siphon: 'SIPHON',
    Incident: 'TROUBLESHOOTING',
    StockTransfer: 'TRANSFER_POND',
    CleanPond: 'CLEAN_POND',
    SunDryPond: 'SUN_DRY_POND',
    CleanRenovation: 'CLEAN_POND',
    DryRenovation: 'SUN_DRY_POND',
    Harvest: 'HARVEST',
};

export const JOB_TYPE_TO_DISPLAY_NAME: Record<JobType, string> = {
    FEED: 'Cho ăn',
    SHRIMP_INSPECTION: 'Kiểm tra tôm (canh nhá)',
    MEASURE_SIZE: 'Đo kích thước tôm',
    ENVIRONMENT: 'Đo thông số môi trường',
    WATER_TREATMENT: 'Xử lý nước',
    WATER_CHANGE: 'Thay/Cấp nước',
    SIPHON: 'Xi - phông',
    TROUBLESHOOTING: 'Xử lý sự cố',
    TRANSFER_POND: 'Sang ao',
    CLEAN_POND: 'Rửa ao',
    SUN_DRY_POND: 'Phơi ao',
    HARVEST: 'Thu hoạch',
};

export const mapOperationTypeToJobType = (operationTypeName: string): JobType | undefined => {
    return OPERATION_TYPE_TO_JOB_TYPE[operationTypeName];
};
export const isValidOperationType = (operationTypeName: string): boolean => {
    return operationTypeName in OPERATION_TYPE_TO_JOB_TYPE;
};
