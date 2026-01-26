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
    // Products
    PRODUCTS: {
        LIST: '/products',
        DETAIL: (id: string) => `/products/${id}`,
        CREATE: '/products',
        UPDATE: (id: string) => `/products/${id}`,
        DELETE: (id: string) => `/products/${id}`,
    },
    // Ponds
    PONDS: {
        LIST: '/ponds',
        DETAIL: (id: string) => `/ponds/${id}`,
        CREATE: '/ponds',
        UPDATE: (id: string) => `/ponds/${id}`,
        DELETE: (id: string) => `/ponds/${id}`,
    },
    POND_TYPES: {
        LIST: '/pond-types',
    },
    OPERATION_TYPES: {
        LIST: '/operation-types',
        DETAIL: (id: number) => `/operation-types/${id}`,
    },
    POND_TYPE_OPERATIONS: {
        LIST: '/pond-type-operations',
        BY_POND_TYPE: (pondTypeId: number) => `/pond-type-operations/${pondTypeId}`,
    },
    // Zones / Farms
    ZONE: {
        LIST: '/zone',
        DETAIL: (id: number | string) => `/zone/${id}`,
        CREATE: '/zone',
        UPDATE: (id: number | string) => `/zone/${id}`,
        DELETE: (id: number | string) => `/zone/${id}`,
        PONDS: (id: number | string) => `/zone/${id}/ponds`,
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
        LIST: '/materialtype',
        DETAIL: (id: string) => `/materialtype/${id}`,
        CREATE: '/materialtype',
        UPDATE: (id: string) => `/materialtype/${id}`,
        DELETE: (id: string) => `/materialtype/${id}`,
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
} as const;
