/**
 * @file config.ts
 * @description App configuration constants
 * @author Kindy
 * @created 2025-11-16
 */
export const APP_CONFIG = {
    APP_NAME: 'BaseStructure',
    VERSION: '0.0.1',
    MIN_PASSWORD_LENGTH: 8,
    MAX_UPLOAD_SIZE: 10 * 1024 * 1024, // 10MB
    DEFAULT_PAGE_SIZE: 20,
} as const;
