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
        UPDATE_PROFILE: '/auth/profile',
    },
    DEVICE: {
        TOGGLE: '/device/toggle',
        TOGGLE_TEST: '/device/toggle/test',
        SCHEDULE: '/device/schedule',
        SCHEDULE_TEST: '/device/schedule/test',
        HEALTH: '/device/health',
        HEALTH_DETAIL: (deviceId: string) => `/device/health/${deviceId}`,
        DEVICE_ID_REFERENCE: '/device/device-id-reference',
    },
    POND: {
        CYCLE: {
            LIST: (pondId: string) => `/pond/${pondId}/cycle`,
            DETAIL: (pondId: string, id: string) => `/pond/${pondId}/cycle/${id}`,
            CREATE: (pondId: string) => `/pond/${pondId}/cycle`,
            UPDATE: (pondId: string, id: string) => `/pond/${pondId}/cycle/${id}`,
            DELETE: (pondId: string, id: string) => `/pond/${pondId}/cycle/${id}`,
        },
        SIPHON_RECORDS: {
            LIST: (pondId: string) => `/pond/${pondId}/siphon-records`,
            DETAIL: (pondId: string, id: string) => `/pond/${pondId}/siphon-records/${id}`,
            CREATE: (pondId: string) => `/pond/${pondId}/siphon-records`,
            UPDATE: (pondId: string, id: string) => `/pond/${pondId}/siphon-records/${id}`,
            DELETE: (pondId: string, id: string) => `/pond/${pondId}/siphon-records/${id}`,
        },
        FEEDING_RECORDS: {
            LIST: (pondId: string) => `/pond/${pondId}/feeding-records`,
            DETAIL: (pondId: string, id: string) => `/pond/${pondId}/feeding-records/${id}`,
            CREATE: (pondId: string) => `/pond/${pondId}/feeding-records`,
            UPDATE: (pondId: string, id: string) => `/pond/${pondId}/feeding-records/${id}`,
            DELETE: (pondId: string, id: string) => `/pond/${pondId}/feeding-records/${id}`,
        },
        INCIDENT: {
            LIST: (pondId: string) => `/pond/${pondId}/incident`,
            DETAIL: (pondId: string, id: string) => `/pond/${pondId}/incident/${id}`,
            CREATE: (pondId: string) => `/pond/${pondId}/incident`,
            UPDATE: (pondId: string, id: string) => `/pond/${pondId}/incident/${id}`,
            DELETE: (pondId: string, id: string) => `/pond/${pondId}/incident/${id}`,
        },
        SHRIMP_HEALTH: {
            LIST: (pondId: string) => `/pond/${pondId}/shrimp-healths`,
            DETAIL: (pondId: string, id: string) => `/pond/${pondId}/shrimp-healths/${id}`,
            CREATE: (pondId: string) => `/pond/${pondId}/shrimp-healths`,
            UPDATE: (pondId: string, id: string) => `/pond/${pondId}/shrimp-healths/${id}`,
            DELETE: (pondId: string, id: string) => `/pond/${pondId}/shrimp-healths/${id}`,
        },
        SIZE_MEASUREMENT: {
            LIST: (pondId: string) => `/pond/${pondId}/sizemeasurement`,
            DETAIL: (pondId: string, id: string) => `/pond/${pondId}/sizemeasurement/${id}`,
            CREATE: (pondId: string) => `/pond/${pondId}/sizemeasurement`,
            UPDATE: (pondId: string, id: string) => `/pond/${pondId}/sizemeasurement/${id}`,
            DELETE: (pondId: string, id: string) => `/pond/${pondId}/sizemeasurement/${id}`,
        },
        ENV_MEASUREMENT: {
            LIST: (pondId: string) => `/pond/${pondId}/envmeasurement`,
            DETAIL: (pondId: string, id: string) => `/pond/${pondId}/envmeasurement/${id}`,
            CREATE: (pondId: string) => `/pond/${pondId}/envmeasurement`,
            UPDATE: (pondId: string, id: string) => `/pond/${pondId}/envmeasurement/${id}`,
            DELETE: (pondId: string, id: string) => `/pond/${pondId}/envmeasurement/${id}`,
        },
        CLEAN_RENOVATION: {
            LIST: (pondId: string) => `/pond/${pondId}/clean-renovation`,
            DETAIL: (pondId: string, id: string) => `/pond/${pondId}/clean-renovation/${id}`,
            CREATE: (pondId: string) => `/pond/${pondId}/clean-renovation`,
            UPDATE: (pondId: string, id: string) => `/pond/${pondId}/clean-renovation/${id}`,
            DELETE: (pondId: string, id: string) => `/pond/${pondId}/clean-renovation/${id}`,
        },
        DRY_RENOVATION: {
            LIST: (pondId: string) => `/pond/${pondId}/dry-renovation`,
            DETAIL: (pondId: string, id: string) => `/pond/${pondId}/dry-renovation/${id}`,
            CREATE: (pondId: string) => `/pond/${pondId}/dry-renovation`,
            UPDATE: (pondId: string, id: string) => `/pond/${pondId}/dry-renovation/${id}`,
            DELETE: (pondId: string, id: string) => `/pond/${pondId}/dry-renovation/${id}`,
        },
        WATER_CHANGE_RECORD: {
            LIST: (pondId: string) => `/pond/${pondId}/waterchange-record`,
            DETAIL: (pondId: string, id: string) => `/pond/${pondId}/waterchange-record/${id}`,
            CREATE: (pondId: string) => `/pond/${pondId}/waterchange-record`,
            UPDATE: (pondId: string, id: string) => `/pond/${pondId}/waterchange-record/${id}`,
            DELETE: (pondId: string, id: string) => `/pond/${pondId}/waterchange-record/${id}`,
        },
    },
    POND_TYPES: {
        LIST: '/pondcategory',
    },
    POND_OPERATION: {
        LIST: '/pondoperation',
        DETAIL: (id: string) => `/pondoperation/${id}`,
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

    METRIC: {
        LIST: '/metric',
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
    },
    PARAMETER_SETTING: {
        LIST: (zoneId: string) => `/zone/${zoneId}/settings`,
        DETAIL: (zoneId: string, id: string) => `/zone/${zoneId}/settings/${id}`,
        CREATE: (zoneId: string) => `/zone/${zoneId}/settings`,
        UPDATE: (zoneId: string, id: string) => `/zone/${zoneId}/settings/${id}`,
        DELETE: (zoneId: string, id: string) => `/zone/${zoneId}/settings/${id}`,
    },
    WAREHOUSE: {
        LIST: '/warehouses',
        DETAIL: (id: string) => `/warehouses/${id}`,
        CREATE: '/warehouses',
        UPDATE: (id: string) => `/warehouses/${id}`,
        DELETE: (id: string) => `/warehouses/${id}`,
        ITEMS: (id: string) => `/warehouses/${id}/items`,
        SHRIMP_SEEDS: (id: string) => `/warehouses/${id}/shrimp-seeds`,
    },
    IMPORT_RECEIPT: {
        LIST: '/importreceipt',
        CREATE: '/importreceipt',
        DETAIL: (id: string) => `/importreceipt/${id}`,
        UPDATE: (id: string) => `/importreceipt/${id}`,
        DELETE: (id: string) => `/importreceipt/${id}`,
        ITEMS: (id: string) => `/importreceipt/${id}/items`,
        ITEM_DETAIL: (receiptId: string, itemId: string) =>
            `/importreceipt/${receiptId}/items/${itemId}`,
        SUBMISSION: (id: string) => `/importreceipt/${id}/submission`,
        APPROVAL: (id: string) => `/importreceipt/${id}/approval`,
        REJECTION: (id: string) => `/importreceipt/${id}/rejection`,
    },
    EXPORT_RECEIPT: {
        LIST: '/exportreceipt',
        CREATE: '/exportreceipt',
        DETAIL: (id: string) => `/exportreceipt/${id}`,
        UPDATE: (id: string) => `/exportreceipt/${id}`,
        DELETE: (id: string) => `/exportreceipt/${id}`,
        ITEMS: (id: string) => `/exportreceipt/${id}/items`,
        UPDATE_ITEMS: (id: string) => `/exportreceipt/${id}/items`,
        DELETE_ITEM: (receiptId: string, itemId: string) =>
            `/exportreceipt/${receiptId}/items/${itemId}`,
        SUBMISSION: (id: string) => `/exportreceipt/${id}/submission`,
        APPROVAL: (id: string) => `/exportreceipt/${id}/approval`,
        REJECTION: (id: string) => `/exportreceipt/${id}/rejection`,
    },
    SUPPLIER: {
        LIST: '/supplier',
    },
    DOCUMENT: {
        UPLOAD: '/document',
        GET_URL: (id: string) => `/document/get-url/${id}`,
        DELETE: (id: string) => `/document/${id}`,
        UPLOAD_BASE64: '/document/upload-base64',
    },
} as const;
