import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    RefreshControl,
    TouchableOpacity,
    Image,
} from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { launchImageLibrary, Asset } from 'react-native-image-picker';
import Toast from 'react-native-toast-message';

import { useUserFarmStats } from '@/features/menu/hooks/useUserFarmStats';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '@/app/navigation/AppStack';
import { colors } from '@/styles';
import { HeaderMenu } from '@/features/menu/components/HeaderMenu';
import { FarmConnecter } from '@/features/menu/components/information/FarmConnecter';
import { PondConnecter } from '@/features/menu/components/information/PondConnecter';
import { ButtonBarMenu } from '@/features/menu/components/ButtonBarMenu';
import { Input } from '@/shared/components/forms/Input';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { useFarmStore } from '@/features/farm/store/farmStore';
import AvatarIcon from '@/assets/Icon/IconMenu/AvatarNew.svg';

import { useUserProfile } from '@/features/menu/hooks/useUserProfile';
import {
    informationFormSchema,
    InformationFormValues,
} from '@/features/menu/schemas/informationFormSchema';
import { informationService } from '@/features/menu/services/informationService';
import { authApi } from '@/features/auth/api/authApi';
import { documentApi } from '@/features/material/api/documentApi';
import { Loading } from '@/shared/components/ui/Loading';
import { handleError } from '@/shared/utils';

export const PersonalInformationScreens: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
    const { setTabBarVisible } = useTabBarVisibility();
    const { userData, refetch } = useUserProfile();

    // Saving state
    const [isSaving, setIsSaving] = useState(false);

    // Avatar state
    const [avatarUri, setAvatarUri] = useState<string | null>(null);
    const [avatarAsset, setAvatarAsset] = useState<Asset | null>(null);

    useFocusEffect(
        React.useCallback(() => {
            setTabBarVisible(false);
            return () => {
                setTabBarVisible(true);
            };
        }, [setTabBarVisible])
    );

    const { setSelectedZoneId } = useFarmStore();
    const { allPonds, connectedFarms, totalFarms, totalPonds, isRefreshing, refetchAll } =
        useUserFarmStats();

    // Calculate totals based on what's being displayed (Mock or Real)
    const strTotalFarms = totalFarms.toString();
    const strTotalPonds = totalPonds.toString();

    // Determine if user manages farms or ponds based on level text
    const isFarmManager = userData.level?.toLowerCase().includes('trại');
    const isPondManager = userData.level?.toLowerCase().includes('ao');
    // Default to farm manager if ambiguous, or check exact strings if preferred
    const showFarms = isFarmManager || (!isPondManager && !isFarmManager);

    // Form setup - always editable
    const initialData = useMemo(() => {
        return informationService.mapDetailToForm(userData);
    }, [userData]);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isDirty },
    } = useForm<InformationFormValues>({
        resolver: zodResolver(informationFormSchema),
        defaultValues: initialData,
    });

    // Sync form when initialData changes
    const initializedRef = useRef(false);
    useEffect(() => {
        if (initialData && !initializedRef.current) {
            reset(initialData);
            initializedRef.current = true;
        }
    }, [initialData, reset]);

    // Initialize avatar from userData
    const isAvatarInitialized = useRef(false);
    useEffect(() => {
        if (userData && !isAvatarInitialized.current) {
            if (userData.avatarUri && typeof userData.avatarUri === 'string') {
                setAvatarUri(userData.avatarUri);
            } else if (userData.avatarUri && typeof userData.avatarUri === 'object') {
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

    const handleRefresh = async () => {
        await refetch();
        await refetchAll();
    };

    // Change avatar photo
    const handleChangePhoto = async () => {
        const result = await launchImageLibrary({
            mediaType: 'photo',
            quality: 1,
        });

        if (result.assets && result.assets.length > 0) {
            setAvatarUri(result.assets[0].uri || null);
            setAvatarAsset(result.assets[0]);
        }
    };

    // Cancel - reset form and go back
    const handleCancel = () => {
        reset(initialData);
        setAvatarUri(userData.avatarUri || null);
        setAvatarAsset(null);
        navigation.goBack();
    };

    // Submit form
    const handleFormSubmit = async (formData: InformationFormValues) => {
        setIsSaving(true);
        try {
            let finalAvatarId = '';

            // Handle image upload
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

    return (
        <Loading isLoading={isSaving}>
            <View style={styles.container}>
                <HeaderMenu title="Thông tin cá nhân" onBack={handleCancel} />

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={
                        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
                    }
                >
                    {/* General Info Section - Editable */}
                    <View style={styles.sectionWrapper}>
                        <Text style={styles.sectionTitle}>Thông tin chung</Text>

                        <View style={styles.cardContainer}>
                            {/* Avatar Section */}
                            <View style={styles.avatarContainer}>
                                <View style={styles.avatar}>
                                    {avatarUri && typeof avatarUri === 'string' ? (
                                        <Image
                                            source={{ uri: avatarUri }}
                                            style={styles.avatarImage}
                                        />
                                    ) : (
                                        <AvatarIcon width={64} height={64} />
                                    )}
                                </View>
                                <TouchableOpacity onPress={handleChangePhoto}>
                                    <Text style={styles.changePhotoText}>Đổi ảnh</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Editable Form Fields */}
                            <View style={styles.formFieldsWrapper}>
                                <Controller
                                    control={control}
                                    name="name"
                                    render={({ field: { onChange, value } }) => (
                                        <Input
                                            label="Tên"
                                            value={value}
                                            onChangeText={onChange}
                                            placeholder="Nhập tên"
                                            required
                                            error={errors.name?.message}
                                        />
                                    )}
                                />

                                <Controller
                                    control={control}
                                    name="phone"
                                    render={({ field: { value } }) => (
                                        <Input
                                            label="Số điện thoại"
                                            value={value}
                                            placeholder="Nhập số điện thoại"
                                            keyboardType="phone-pad"
                                            required
                                            disabled
                                        />
                                    )}
                                />

                                <Controller
                                    control={control}
                                    name="email"
                                    render={({ field: { onChange, value } }) => (
                                        <Input
                                            label="Email"
                                            value={value}
                                            onChangeText={onChange}
                                            placeholder="Nhập email"
                                            keyboardType="email-address"
                                            required
                                            error={errors.email?.message}
                                        />
                                    )}
                                />

                                <Controller
                                    control={control}
                                    name="address"
                                    render={({ field: { onChange, value } }) => (
                                        <Input
                                            label="Địa chỉ"
                                            value={value}
                                            onChangeText={onChange}
                                            placeholder="Nhập địa chỉ"
                                        />
                                    )}
                                />

                                <Controller
                                    control={control}
                                    name="role"
                                    render={({ field: { value } }) => (
                                        <Input
                                            label="Chức vụ"
                                            value={value}
                                            placeholder="Chức vụ"
                                            required
                                            disabled
                                        />
                                    )}
                                />

                                <Controller
                                    control={control}
                                    name="level"
                                    render={({ field: { value } }) => (
                                        <Input
                                            label="Cấp quản lý"
                                            value={value}
                                            placeholder="Ví dụ: Quản lý trại, Quản lý ao"
                                            required
                                            disabled
                                        />
                                    )}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Connected Section */}
                    {showFarms ? (
                        <FarmConnecter
                            totalFarms={strTotalFarms}
                            farms={connectedFarms}
                            onFarmPress={farm => {
                                setSelectedZoneId(farm.id);
                                navigation.navigate('MainTabs', { screen: 'Farm' });
                            }}
                        />
                    ) : (
                        <PondConnecter
                            totalPonds={strTotalPonds}
                            ponds={allPonds}
                            onPondPress={() => {
                                navigation.navigate('MainTabs', { screen: 'Farm' });
                            }}
                        />
                    )}

                    {/* Bottom Spacer before fixed bar */}
                    <View style={styles.bottomSpacer} />
                </ScrollView>

                {/* Sticky Bottom Action Bar */}
                <ButtonBarMenu
                    primaryTitle={isSaving ? 'Đang lưu thông tin...' : 'Lưu thông tin'}
                    secondaryTitle="Huỷ"
                    onPrimaryPress={handleSubmit(handleFormSubmit)}
                    onSecondaryPress={handleCancel}
                    primaryDisabled={isSaving || (!isDirty && !avatarAsset)}
                />
            </View>
        </Loading>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
    },
    scrollContent: {
        padding: 16,
        gap: 24,
    },
    bottomSpacer: {
        height: 20,
    },

    /* Section Styles */
    sectionWrapper: {
        gap: 12,
    },
    sectionTitle: {
        fontSize: 16,
        lineHeight: 20,
        fontWeight: '600',
        color: colors.gray[950],
    },
    cardContainer: {
        backgroundColor: colors.white,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.gray[200],
        padding: 12,
        gap: 24,
    },
    avatarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.gray[100],
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    avatarImage: {
        width: 64,
        height: 64,
        borderRadius: 32,
    },
    changePhotoText: {
        color: colors.blue[600],
        fontSize: 14,
        fontWeight: '500',
        textDecorationLine: 'underline',
    },
    formFieldsWrapper: {
        gap: 4,
    },
});
