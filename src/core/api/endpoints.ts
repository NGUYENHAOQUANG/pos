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
    // Units
    UNITS: {
        LIST: '/units',
    },
} as const;
