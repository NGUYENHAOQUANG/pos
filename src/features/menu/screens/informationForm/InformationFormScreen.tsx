import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { Asset } from 'react-native-image-picker';

import { InformationForm } from './InformationForm';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { useUserProfile } from '@/features/menu/hooks/useUserProfile';
import { useUserFarmStats } from '@/features/menu/hooks/useUserFarmStats';
import { authApi } from '@/features/auth/api/authApi';
import { documentApi } from '@/features/material/api/documentApi';
import { informationService } from '@/features/menu/services/informationService';
import { InformationFormValues } from '@/features/menu/schemas/informationFormSchema';
import { Loading } from '@/shared/components/ui/Loading';
import { handleError } from '@/shared/utils';

export const InformationFormScreen: React.FC = () => {
    const navigation = useNavigation();
    const { setTabBarVisible } = useTabBarVisibility();

    // Global queries & state
    const { userData, refetch } = useUserProfile();
    const { totalFarms, totalPonds } = useUserFarmStats();

    // Local state for avatar & form submission
    const [avatarUri, setAvatarUri] = useState<string | null>(null);
    const [avatarAsset, setAvatarAsset] = useState<Asset | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Derived states
    const level = userData?.level || '';
    const isFarmManager = level?.toLowerCase().includes('trại');
    const isPondManager = level?.toLowerCase().includes('ao');
    const showFarms = isFarmManager || (!isPondManager && !isFarmManager);

    // Maintain fallback of 2 for empty states like in original code
    const totalCount = showFarms
        ? totalFarms > 0
            ? totalFarms
            : 2
        : totalPonds > 0
        ? totalPonds
        : 2;

    // Initial Data mapping
    const initialData = useMemo(() => {
        return informationService.mapDetailToForm(userData);
    }, [userData]);

    const isAvatarInitialized = React.useRef(false);
    useEffect(() => {
        if (userData && !isAvatarInitialized.current) {
            if (userData.avatarUri && typeof userData.avatarUri === 'string') {
                setAvatarUri(userData.avatarUri);
            } else if (userData.avatarUri && typeof userData.avatarUri === 'object') {
                // Determine the correct field for the image URL from object payload
                const avatarObj = userData.avatarUri as { url?: string; publicUrl?: string };
                const safeAvatar = avatarObj.url || avatarObj.publicUrl || null;
                setAvatarUri(safeAvatar);
            } else {
                setAvatarUri(null);
            }
            setAvatarAsset(null);
            isAvatarInitialized.current = true;
        }
    }, [userData]);

    useFocusEffect(
        React.useCallback(() => {
            setTabBarVisible(false);
            return () => {
                setTabBarVisible(true);
            };
        }, [setTabBarVisible])
    );

    const handleAvatarChange = (uri: string | null, asset: Asset | null) => {
        setAvatarUri(uri);
        setAvatarAsset(asset);
    };

    const handleBackPress = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    const handleSubmit = async (formData: InformationFormValues) => {
        setIsSaving(true);
        try {
            let finalAvatarId = '';

            // Handle Image Upload Side-Effect
            if (avatarAsset && avatarAsset.uri) {
                const fileToUpload = {
                    uri: avatarAsset.uri,
                    type: avatarAsset.type || 'image/jpeg',
                    name: avatarAsset.fileName || `avatar_${Date.now()}.jpg`,
                };

                const uploadedDocs = await documentApi.upload([fileToUpload]);

                if (uploadedDocs && uploadedDocs.length > 0) {
                    finalAvatarId = uploadedDocs[0].id;
                }
            }

            // Execute the mapped payload
            const payload = informationService.mapFormToPayload(formData, finalAvatarId);
            await authApi.updateProfile(payload);

            Toast.show({
                type: 'success',
                text1: 'Cập nhật thông tin thành công',
            });

            await refetch();
            navigation.goBack();
        } catch (error) {
            handleError(error);
        } finally {
            setIsSaving(false);
        }
    };

    // Show loading skeleton if no user data yet
    if (!userData) {
        return <Loading isLoading={true} />;
    }

    return (
        <Loading isLoading={isSaving}>
            <InformationForm
                isSubmitting={isSaving}
                initialData={initialData}
                totalCount={totalCount}
                showFarms={showFarms}
                avatarUri={avatarUri}
                onAvatarChange={handleAvatarChange}
                onSubmit={handleSubmit}
                onCancel={handleBackPress}
            />
        </Loading>
    );
};
