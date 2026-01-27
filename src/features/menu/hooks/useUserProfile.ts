import { useState, useCallback } from 'react';
import { authApi } from '@/features/auth/api/authApi';
import { useFocusEffect } from '@react-navigation/native';

export interface UserProfileData {
    name: string;
    phone: string;
    email: string;
    role: string;
    level: string;
    avatarUri: string | null;
}

export const useUserProfile = () => {
    const [userData, setUserData] = useState<UserProfileData>({
        name: '',
        phone: '',
        email: '',
        role: 'Quản lý',
        level: 'Quản lý trại',
        avatarUri: null,
    });
    const [isLoading, setIsLoading] = useState(false);

    const fetchUserProfile = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await authApi.getMe();
            if (response.success || response.result) {
                const data = response.data as any; // Cast to access potential extra fields not in JwtResponse
                setUserData({
                    name: data.fullName || '',
                    phone: data.phoneNumber || '',
                    email: data.email || '',
                    role: data.roleName || data.roleCode || 'Quản lý',
                    level: 'Quản lý trại',
                    avatarUri: data.avatar || data.avatarUrl || null,
                });
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchUserProfile();
        }, [fetchUserProfile])
    );

    return {
        userData,
        isLoading,
        refetch: fetchUserProfile,
    };
};
