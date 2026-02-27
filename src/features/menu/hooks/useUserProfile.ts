import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/authStore';
import { authApi } from '@/features/auth/api/authApi';
import { documentApi } from '@/features/material/api/documentApi';
import { UserProfileData } from '@/features/auth/types/auth.types';

export type { UserProfileData };

export const useUserProfile = () => {
    const userProfileStore = useAuthStore(state => state.userProfile);
    const updateUserProfile = useAuthStore(state => state.updateUserProfile);

    // Fetch using React Query
    const {
        data: fetchedProfile,
        isLoading,
        refetch,
    } = useQuery({
        queryKey: ['userProfile'],
        queryFn: async () => {
            const response = await authApi.getMe();
            if (!response.success) {
                throw new Error(response.message || 'Failed to fetch profile');
            }
            const data = response.data as any;

            let avatarUrl = null;
            const rawAvatar = data.avatar || data.avatarUrl;

            if (rawAvatar) {
                if (typeof rawAvatar === 'string') {
                    avatarUrl = rawAvatar;
                } else if (typeof rawAvatar === 'object' && rawAvatar.id) {
                    try {
                        avatarUrl = await documentApi.getUrl(rawAvatar.id);
                    } catch (e) {
                        console.error('Failed to get avatar URL', e);
                    }
                }
            }

            const profile: UserProfileData = {
                id: data.userId || '',
                name: data.fullName || '',
                phone: data.phoneNumber || '',
                email: data.email || '',
                address: data.address || '',
                role: data.roleName || data.roleCode || 'Quản lý',
                level: 'Quản lý trại',
                avatarUri: avatarUrl,
                status: data.status || '',
                roleCode: data.roleCode || '',
                policies: data.policies || [],
            };
            return profile;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    // Sync to store
    useEffect(() => {
        if (fetchedProfile) {
            updateUserProfile(fetchedProfile);
        }
    }, [fetchedProfile, updateUserProfile]);

    return {
        userData: userProfileStore || {
            id: '',
            name: '',
            phone: '',
            email: '',
            address: '',
            role: 'Quản lý',
            level: 'Quản lý trại',
            avatarUri: null,
            status: '',
            roleCode: '',
        },
        isLoading,
        refetch,
    };
};
