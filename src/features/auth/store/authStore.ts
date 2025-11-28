/**
 * @file authStore.ts
 * @description Auth Store - Zustand
 * @author Kindy
 * @created 2025-11-16
 */
import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import {Storage} from '@/core/services/storage.service';
import {AuthUser, LoginCredentials, RegisterData} from '../types/auth.types';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  setUser: (user: AuthUser | null) => void;
  setToken: (token: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,

      login: async (credentials: LoginCredentials) => {
        set({loading: true});
        try {
          // Demo: Mock login - không call API
          // Tạo mock user với phone
          const mockUser: AuthUser = {
            id: '1',
            phone: credentials.phone,
            name: 'Demo User',
          };
          const mockToken = 'mock-token-' + Date.now();
          
          set({
            user: mockUser,
            token: mockToken,
            isAuthenticated: true,
            loading: false,
          });
        } catch (error) {
          set({loading: false});
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        set({loading: true});
        try {
          // Demo: Mock register - không call API
          // Tạo mock user với phone
          const mockUser: AuthUser = {
            id: '1',
            phone: data.phone,
            name: data.name,
          };
          const mockToken = 'mock-token-' + Date.now();
          
          set({
            user: mockUser,
            token: mockToken,
            isAuthenticated: true,
            loading: false,
          });
        } catch (error) {
          set({loading: false});
          throw error;
        }
      },

      logout: async () => {
        // Demo: Mock logout - không call API
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      setUser: (user: AuthUser | null) => {
        set({user, isAuthenticated: !!user});
      },

      setToken: (token: string | null) => {
        set({token});
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => Storage),
    },
  ),
);

