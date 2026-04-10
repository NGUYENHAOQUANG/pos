import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/authStore';
import { authApi } from '@/features/auth/api/authApi';
import { documentApi } from '@/features/material/api/documentApi';
import { UserProfileData } from '@/features/auth/types/auth.types';

export type { UserProfileData };

const DEFAULT_PROFILE: UserProfileData = {
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
};

export const useUserProfile = () => {
    // Get the current user's ID to scope the query cache per-user
    const userId = useAuthStore(state => state.user?.id);
    const updateUserProfile = useAuthStore(state => state.updateUserProfile);

    // Fetch using React Query
    const {
        data: fetchedProfile,
        isLoading,
        refetch,
    } = useQuery({
        queryKey: ['userProfile', userId],
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
        // Always refetch on mount to get fresh data (prevents stale cache after re-login)
        staleTime: 0,
        // Garbage collect old cache entries quickly so previous user's data doesn't linger
        gcTime: 1000 * 60 * 1,
        // Only run when we have a valid user
        enabled: !!userId,
    });

    // Sync to store
    useEffect(() => {
        if (fetchedProfile) {
            updateUserProfile(fetchedProfile);
        }
    }, [fetchedProfile, updateUserProfile]);

    // Prefer the freshly fetched data over the persisted store value
    return {
        userData: fetchedProfile || DEFAULT_PROFILE,
        isLoading,
        refetch,
    };
};
