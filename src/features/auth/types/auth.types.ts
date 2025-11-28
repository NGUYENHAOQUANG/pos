/**
 * @file auth.types.ts
 * @description Auth types
 * @author Kindy
 * @created 2025-11-16
 */

export interface AuthUser {
  id: string;
  phone: string;
  name: string;
  avatar?: string;
}

export interface LoginCredentials {
  phone: string;
  password: string;
}

export interface RegisterData {
  phone: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
  refreshToken?: string;
}

