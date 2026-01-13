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
        REFRESH: '/auth/refresh',
        FORGOT_PASSWORD: '/auth/forgot-password',
        RESET_PASSWORD: '/auth/reset-password',
        REQUEST_OTP: '/auth/request-otp',
        VERIFY_OTP: '/auth/verify-otp',
    },
    // Products
    PRODUCTS: {
        LIST: '/products',
        DETAIL: (id: string) => `/products/${id}`,
        CREATE: '/products',
        UPDATE: (id: string) => `/products/${id}`,
        DELETE: (id: string) => `/products/${id}`,
    },
    // Material Group
    MATERIAL_GROUP: {
        LIST: '/material-groups',
        DETAIL: (id: number) => `/material-groups/${id}`,
        CREATE: '/material-groups',
        UPDATE: (id: number) => `/material-groups/${id}`,
        DELETE: (id: number) => `/material-groups/${id}`,
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
} as const;
