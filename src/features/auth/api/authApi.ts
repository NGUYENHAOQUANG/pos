/**
 * @file authApi.ts
 * @description Auth API
 * @author Kindy
 * @created 2025-11-16
 */
import {apiClient} from '@/core/api/client';
import {API_ENDPOINTS} from '@/core/api/endpoints';
import {AuthResponse, LoginCredentials, RegisterData} from '../types/auth.types';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const {data} = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials,
    );
    return data;
  },

  register: async (registerData: RegisterData): Promise<AuthResponse> => {
    const {data} = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      registerData,
    );
    return data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const {data} = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.REFRESH,
      {refreshToken},
    );
    return data;
  },
};

