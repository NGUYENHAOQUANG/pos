/**
 * @file auth.types.ts
 * @description Auth types
 * @author Kindy
 * @created 2025-11-16
 */

import { IApiResponse } from '@/shared/types/common.types';

// Swagger: ApplicationUser
export interface AuthUser {
    id: string; // sub
    name: string; // name
    phone?: string;
    email?: string;
    avatar?: string;
    roles?: string[];
    loginStatus?: string;
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

export interface JwtResponse {
    accessToken: string;
    refreshToken: string;
    issued?: string;
    refreshTokenExpiresAt?: string;
    accessTokenExpiresAt?: string;
    userId?: string;
    phoneNumber?: string;
    fullName?: string | null;
    roleCode?: string;
    policies?: string[];
    loginStatus?: 'REQUIRE_UPDATE_PROFILE' | 'COMPLETED' | string;
    isProfileCompleted?: boolean;
}

export interface CompleteProfilePayload {
    userId: string;
    fullName: string;
    email?: string;
    address?: string;
    avatarId?: string;
    avatarUrl?: string;
}

// Swagger: JwtResponseAppResponse
export type AuthResponse = IApiResponse<JwtResponse>;
// {
//     result?: boolean; // Keep for backward compatibility
//     success?: boolean; // New API format
//     statusCode?: number;
//     message?: string;
//     data: JwtResponse;
// }

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

export interface UserInfoResponse {
    userId: string;
    phoneNumber: string;
    address: string | null;
    email: string | null;
    fullName: string;
    avatar: string | { id: string; url: string } | null;
    status: string;
    roleCode: string;
    roleName: string;
    policies: string[];
    lastLoginAt: string;
    phoneNumberConfirmed: boolean;
    emailConfirmed: boolean;
}

export interface UserProfileData {
    id: string;
    name: string;
    phone: string;
    email: string;
    address?: string;
    role: string;
    level: string;
    avatarUri: string | null;
    status: string;
    roleCode: string;
    policies?: string[];
}
