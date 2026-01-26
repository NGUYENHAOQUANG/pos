/**
 * @file endpoints.ts
 * @description API Endpoints constants
 * @author Kindy
 * @created 2025-11-16
 */
export const API_ENDPOINTS = {
    // Auth
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
        REFRESH: '/auth/refresh-token',
        FORGOT_PASSWORD: '/auth/forgot-password',
        RESET_PASSWORD: '/auth/reset-password',
        SEND_OTP: '/auth/send-otp',
        VERIFY_OTP: '/auth/verify-otp',
        DELETE_ACCOUNT: '/auth/delete-account',
        COMPLETE_PROFILE: '/auth/complete-profile',
    },
    POND_TYPES: {
        LIST: '/pondcategory',
    },
    OPERATION_TYPES: {
        LIST: '/operation-types',
        DETAIL: (id: number) => `/operation-types/${id}`,
    },
    POND_TYPE_OPERATIONS: {
        LIST: '/pond-type-operations',
        BY_POND_TYPE: (pondTypeId: string | number) => `/pond-type-operations/${pondTypeId}`,
    },
    // Zones / Farms
    ZONE: {
        LIST: '/zone',
        DETAIL: (id: string) => `/zone/${id}`,
        PONDS: (id: string) => `/zone/${id}/ponds`,
    },
    // Material Group
    MATERIAL_GROUP: {
        LIST: '/materialgroup',
        DETAIL: (id: number) => `/materialgroup/${id}`,
        CREATE: '/materialgroup',
        UPDATE: (id: number) => `/materialgroup/${id}`,
        DELETE: (id: number) => `/materialgroup/${id}`,
    },
    // Material Type
    MATERIAL_TYPE: {
        LIST: '/material-types',
        DETAIL: (id: number) => `/material-types/${id}`,
        CREATE: '/material-types',
        UPDATE: (id: number) => `/material-types/${id}`,
        DELETE: (id: number) => `/material-types/${id}`,
    },
    // Units
    UNITS: {
        LIST: '/units',
    },
    // Materials
    MATERIAL: {
        LIST: '/materials',
        DETAIL: (id: number) => `/materials/${id}`,
        CREATE: '/materials',
        UPDATE: (id: number) => `/materials/${id}`,
        DELETE: (id: number) => `/materials/${id}`,
    },
    // Production Seasons
    PRODUCTION_SEASONS: {
        LIST: (zoneId: number | string) => `/zones/${zoneId}/seasons`,
        DETAIL: (zoneId: number | string, id: string) => `/zones/${zoneId}/seasons/${id}`,
        CREATE: (zoneId: number | string) => `/zones/${zoneId}/seasons`,
        UPDATE: (zoneId: number | string, id: string) => `/zones/${zoneId}/seasons/${id}`,
        DELETE: (zoneId: number | string, id: string) => `/zones/${zoneId}/seasons/${id}`,
    },
    ENV_METRIC_TYPES: {
        LIST: '/env-metric-types',
        DETAIL: (id: number) => `/env-metric-types/${id}`,
        CREATE: '/env-metric-types',
        UPDATE: (id: number) => `/env-metric-types/${id}`,
        DELETE: (id: number) => `/env-metric-types/${id}`,
    },
    ENVIRONMENTAL_PARAMETER: {
        LIST: (pondId: number | string) => `/pond/${pondId}/EnvironmentalParameter`,
    },
    PARAMETER_SETTING: {
        LIST: (zoneId: number | string) => `/zones/${zoneId}/parameter-setting`,
        DETAIL: (zoneId: number | string, id: number | string) =>
            `/zones/${zoneId}/parameter-setting/${id}`,
        CREATE: (zoneId: number | string) => `/zones/${zoneId}/parameter-setting`,
        UPDATE: (zoneId: number | string, id: number | string) =>
            `/zones/${zoneId}/parameter-setting/${id}`,
        DELETE: (zoneId: number | string, id: number | string) =>
            `/zones/${zoneId}/parameter-setting/${id}`,
    },
} as const;
