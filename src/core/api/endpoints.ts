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
        PROFILE: '/auth/me',
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
        SEASONS: {
            LIST: (zoneId: string) => `/zone/${zoneId}/seasons`,
            DETAIL: (zoneId: string, id: string) => `/zone/${zoneId}/seasons/${id}`,
            CREATE: (zoneId: string) => `/zone/${zoneId}/seasons`,
            UPDATE: (zoneId: string, id: string) => `/zone/${zoneId}/seasons/${id}`,
            STATUS: (zoneId: string, id: string) => `/zone/${zoneId}/seasons/${id}/status`,
            DELETE: (zoneId: string, id: string) => `/zone/${zoneId}/seasons/${id}`,
        },
    },
    // Material Group
    MATERIAL_GROUP: {
        LIST: '/materialgroup',
    },
    // Material Type
    MATERIAL_TYPE: {
        LIST: '/materialtype',
    },
    // Units
    UNITS: {
        LIST: '/unit',
    },
    // Materials
    MATERIAL: {
        LIST: '/material',
        DETAIL: (id: string) => `/material/${id}`,
        CREATE: '/material',
        UPDATE: (id: string) => `/material/${id}`,
        DELETE: (id: string) => `/material/${id}`,
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
    INVENTORY_CHECK: {
        LIST: '/inventorycheck',
        CREATE: '/inventorycheck',
        DETAIL: (id: string) => `/inventorycheck/${id}`,
        UPDATE: (id: string) => `/inventorycheck/${id}`,
        DELETE: (id: string) => `/inventorycheck/${id}`,
        ITEMS: (id: string) => `/inventorycheck/${id}/items`,
        UPDATE_ITEMS: (id: string) => `/inventorycheck/${id}/items`,
        DELETE_ITEM: (checkId: string, itemId: string) =>
            `/inventorycheck/${checkId}/items/${itemId}`,
        SUBMISSION: (id: string) => `/inventorycheck/${id}/submission`,
        APPROVAL: (id: string) => `/inventorycheck/${id}/approval`,
        REJECTION: (id: string) => `/inventorycheck/${id}/rejection`,
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
    WAREHOUSE: {
        LIST: '/warehouses',
        DETAIL: (id: string) => `/warehouses/${id}`,
        CREATE: '/warehouses',
        UPDATE: (id: string) => `/warehouses/${id}`,
        DELETE: (id: string) => `/warehouses/${id}`,
    },
    IMPORT_RECEIPT: {
        LIST: '/importreceipt',
    },
    EXPORT_RECEIPT: {
        LIST: '/exportreceipt',
        CREATE: '/exportreceipt',
    },
    DOCUMENT: {
        UPLOAD: '/document',
        DELETE: (id: string) => `/document/${id}`,
    },
} as const;
