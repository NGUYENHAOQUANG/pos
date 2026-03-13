/**
 * @file config.ts
 * @description App configuration constants
 * @author Kindy
 * @created 2025-11-16
 */
import { JOB_TYPES } from '@/features/farm/types/farm.types';

export const APP_CONFIG = {
    APP_NAME: 'BaseStructure',
    VERSION: '0.0.1',
    MIN_PASSWORD_LENGTH: 8,
    MAX_UPLOAD_SIZE: 10 * 1024 * 1024, // 10MB
    IMAGE_SIZE_LIMIT_MB: 50,
    IMAGE_SIZE_LIMIT_BYTES: 50 * 1024 * 1024, // 50MB
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 50,
} as const;

export const ALLOWED_JOBS_WHEN_NO_CYCLE: string[] = [
    JOB_TYPES.ENVIRONMENT,
    JOB_TYPES.WATER_TREATMENT,
    JOB_TYPES.WATER_CHANGE,
    JOB_TYPES.CLEAN_POND,
    JOB_TYPES.SUN_DRY_POND,
];
