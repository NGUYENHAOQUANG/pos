/**
 * @file operationTypeMapping.ts
 * @description Mapping between API OperationType names and app JobType codes
 */

import { JobType } from '@/features/farm/components/pondwork/JobItem';

// Mapping from API operationTypeName to app JobType
// This allows us to convert API response to app-specific job types
export const OPERATION_TYPE_TO_JOB_TYPE: Record<string, JobType> = {
    // Vietnamese names from API
    'Cho ăn': 'FEED',
    'Kiểm tra tôm': 'SHRIMP_INSPECTION',
    'Kiểm tra tôm (Canh nhá)': 'SHRIMP_INSPECTION', // API returns with uppercase C
    'Kiểm tra tôm (canh nhá)': 'SHRIMP_INSPECTION', // Fallback for lowercase
    'Đo kích thước tôm': 'MEASURE_SIZE',
    'Đo thông số môi trường': 'ENVIRONMENT',
    'Xử lý nước': 'WATER_TREATMENT',
    'Thay/Cấp nước': 'WATER_CHANGE',
    'Thay nước': 'WATER_CHANGE',
    'Cấp nước': 'WATER_CHANGE',
    'Xi-phông': 'SIPHON',
    'Xi - phông': 'SIPHON',
    Siphon: 'SIPHON',
    'Xử lý sự cố': 'TROUBLESHOOTING',
    'Sang ao': 'TRANSFER_POND',
    'Rửa ao': 'CLEAN_POND',
    'Phơi ao': 'SUN_DRY_POND',
    'Thu hoạch': 'HARVEST',
};

// Reverse mapping: JobType to Vietnamese display name
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

/**
 * Convert API operationTypeName to app JobType
 * @param operationTypeName - Name from API (e.g., "Cho ăn", "Sang ao")
 * @returns Corresponding JobType or undefined if not found
 */
export const mapOperationTypeToJobType = (operationTypeName: string): JobType | undefined => {
    return OPERATION_TYPE_TO_JOB_TYPE[operationTypeName];
};

/**
 * Check if an operationTypeName has a valid mapping to JobType
 */
export const isValidOperationType = (operationTypeName: string): boolean => {
    return operationTypeName in OPERATION_TYPE_TO_JOB_TYPE;
};
