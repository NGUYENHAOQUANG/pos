import { useState, useCallback } from 'react';
import { authApi } from '@/features/auth/api/authApi';
import { documentApi } from '@/features/material/api/documentApi';
import { useFocusEffect } from '@react-navigation/native';

export interface UserProfileData {
    name: string;
    phone: string;
    email: string;
    address?: string;
    role: string;
    level: string;
    avatarUri: string | null;
}

export const useUserProfile = () => {
    const [userData, setUserData] = useState<UserProfileData>({
        name: '',
        phone: '',
        email: '',
        address: '',
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

                let avatarUrl = null;
                const rawAvatar = data.avatar || data.avatarUrl;

                if (rawAvatar) {
                    if (typeof rawAvatar === 'string') {
                        avatarUrl = rawAvatar;
                    } else if (typeof rawAvatar === 'object' && rawAvatar.id) {
                        try {
                            // If it's a document object, fetch the public URL using the ID
                            avatarUrl = await documentApi.getUrl(rawAvatar.id);
                        } catch (e) {
                            console.error('Failed to get avatar URL', e);
                        }
                    }
                }

                setUserData({
                    name: data.fullName || '',
                    phone: data.phoneNumber || '',
                    email: data.email || '',
                    address: data.address || '',
                    role: data.roleName || data.roleCode || 'Quản lý',
                    level: 'Quản lý trại',
                    avatarUri: avatarUrl,
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
