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
    refreshTokenExpireIn: number;
    refreshTokenExpires: string;
    accessTokenExpireIn: number;
    accessTokenExpires: string;
}

// Swagger: JwtResponseAppResponse
export interface AuthResponse {
    result: boolean;
    statusCode: number;
    message?: string;
    data: JwtResponse;
}

export interface OtpData {
    testOtp?: string;
    expiredIn?: number;
}

export interface OtpResponse {
    result: boolean;
    statusCode: number;
    message?: string;
    data: OtpData;
}
