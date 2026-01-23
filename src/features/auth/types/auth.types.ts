/**
 * @file auth.types.ts
 * @description Auth types
 * @author Kindy
 * @created 2025-11-16
 */

// Swagger: ApplicationUser
export interface AuthUser {
    id: string; // sub
    name: string; // name
    phone?: string;
    email?: string;
    avatar?: string;
    roles?: string[];
}

// Swagger: LoginRequest
export interface LoginCredentials {
    username: string; // Changed from phone
    password: string;
}

export interface RegisterData {
    phone: string;
    password: string;
    name: string;
}

// Swagger: JwtResponse
export interface JwtResponse {
    accessToken: string;
    refreshToken: string;
    issued: string;
    refreshTokenExpires: string;
    refreshTokenExpiresAt?: string; // New API format
    accessTokenExpires: string;
    accessTokenExpiresAt?: string; // New API format
}

// Swagger: JwtResponseAppResponse
export interface AuthResponse {
    result?: boolean; // Keep for backward compatibility
    success?: boolean; // New API format
    statusCode?: number;
    message?: string;
    data: JwtResponse;
}

export interface OtpData {
    status?: 'Unverified' | 'COMPLETED' | string;
    testOtp?: string;
    otpCode?: string; // Added based on new API response
    expiredInSeconds?: number;
    canResendAt?: string;
    message?: string;
    isPending?: boolean;
}

export interface OtpResponse {
    result?: boolean; // Keep for backward compatibility if needed
    success?: boolean; // New field
    statusCode?: number;
    message?: string;
    data: OtpData;
    errorCode?: string | null;
    validationErrors?: any | null;
    details?: any | null;
    timestamp?: string;
}
