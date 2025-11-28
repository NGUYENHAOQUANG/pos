/**
 * @file useAuth.ts
 * @description useAuth hook
 * @author Kindy
 * @created 2025-11-16
 */
import {useAuthStore} from '../store/authStore';

export function useAuth() {
  const {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
  } = useAuthStore();

  return {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
  };
}

