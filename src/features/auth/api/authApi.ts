/**
 * @file authApi.ts
 * @description Auth API
 * @author Kindy
 * @created 2025-11-16
 */
import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import {
    AuthResponse,
    CompleteProfilePayload,
    LoginCredentials,
    OtpResponse,
} from '../types/auth.types';

export const authApi = {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const { data } = await apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);
        return data;
    },

    requestOtp: async (phoneNumber: string): Promise<OtpResponse> => {
        const { data } = await apiClient.post<OtpResponse>(API_ENDPOINTS.AUTH.SEND_OTP, {
            phoneNumber,
        });
        return data;
    },

    verifyOtp: async (phoneNumber: string, otpCode: string): Promise<AuthResponse> => {
        const { data } = await apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.VERIFY_OTP, {
            phoneNumber,
            otpCode,
        });
        return data;
    },

    register: async (registerData: { phoneNumber: string }): Promise<OtpResponse> => {
        const { data } = await apiClient.post<OtpResponse>(
            API_ENDPOINTS.AUTH.REGISTER,
            registerData
        );
        return data;
    },

    logout: async (refreshToken: string): Promise<void> => {
        await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, { refreshToken });
    },

    refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
        const { data } = await apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.REFRESH, {
            refreshToken,
        });
        return data;
    },

    completeProfile: async (payload: CompleteProfilePayload): Promise<AuthResponse> => {
        const { data } = await apiClient.post<AuthResponse>(
            API_ENDPOINTS.AUTH.COMPLETE_PROFILE,
            payload
        );
        return data;
    },

    getMe: async (): Promise<AuthResponse> => {
        const { data } = await apiClient.get<AuthResponse>(API_ENDPOINTS.AUTH.PROFILE);
        return data;
    },

    updateProfile: async (profileData: {
        fullName: string;
        email: string;
        address: string;
        avatarId?: string;
    }): Promise<AuthResponse> => {
        const { data } = await apiClient.patch<AuthResponse>(
            API_ENDPOINTS.AUTH.UPDATE_PROFILE,
            profileData
        );
        return data;
    },

    deleteAccount: async (payload: {
        phoneNumber: string;
        selectedReasons: string[];
        otherReasonNote: string;
        otpCode: string;
    }): Promise<void> => {
        await apiClient.delete(API_ENDPOINTS.AUTH.DELETE_ACCOUNT, {
            data: payload,
        });
    },
};
