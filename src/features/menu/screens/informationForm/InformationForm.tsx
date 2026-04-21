import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { launchImageLibrary, Asset } from 'react-native-image-picker';

import { spacing } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { Input } from '@/shared/components/forms/Input';
import { ButtonBarMenu } from '@/features/menu/components/ButtonBarMenu';
import { HeaderMenu } from '@/features/menu/components/HeaderMenu';
import AvatarIcon from '@/assets/Icon/IconMenu/Avatar.svg';
import {
    informationFormSchema,
    InformationFormValues,
} from '@/features/menu/schemas/informationFormSchema';

interface InformationFormProps {
    isSubmitting: boolean;
    initialData?: InformationFormValues;
    totalCount: number;
    showFarms: boolean;
    avatarUri: string | null;
    onAvatarChange: (uri: string | null, asset: Asset | null) => void;
    onSubmit: (data: InformationFormValues) => void;
    onCancel: () => void;
}

export const InformationForm: React.FC<InformationFormProps> = ({
    isSubmitting,
    initialData,
    totalCount,
    showFarms,
    avatarUri,
    onAvatarChange,
    onSubmit,
    onCancel,
}) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<InformationFormValues>({
        resolver: zodResolver(informationFormSchema),
        defaultValues: initialData,
    });

    const initializedRef = useRef(false);

    useEffect(() => {
        if (initialData && !initializedRef.current) {
            reset(initialData);
            initializedRef.current = true;
        }
    }, [initialData, reset]);

    const handleChangePhoto = async () => {
        const result = await launchImageLibrary({
            mediaType: 'photo',
            quality: 1,
        });

        if (result.assets && result.assets.length > 0) {
            onAvatarChange(result.assets[0].uri || null, result.assets[0]);
        }
    };

    return (
        <View style={styles.container}>
            <HeaderMenu title="Sửa thông tin cá nhân" onBack={onCancel} />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Thông tin chung</Text>
                    <View style={styles.separator} />

                    {/* Avatar Section */}
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            {avatarUri && typeof avatarUri === 'string' ? (
                                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                            ) : (
                                <AvatarIcon width={80} height={80} />
                            )}
                        </View>
                        <TouchableOpacity onPress={handleChangePhoto}>
                            <Text style={styles.changePhotoText}>Đổi ảnh</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.separatortwo} />

                    {/* Form Fields */}
                    <Controller
                        control={control}
                        name="name"
                        render={({ field: { onChange, value } }) => (
                            <Input
                                label="Tên:"
                                value={value}
                                onChangeText={onChange}
                                placeholder="Nhập tên"
                                containerStyle={styles.inputContainer}
                                error={errors.name?.message}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="phone"
                        render={({ field: { value } }) => (
                            <Input
                                label="Số điện thoại:"
                                value={value}
                                placeholder="Nhập số điện thoại"
                                keyboardType="phone-pad"
                                containerStyle={styles.inputContainer}
                                disabled
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="email"
                        render={({ field: { onChange, value } }) => (
                            <Input
                                label="Email:"
                                value={value}
                                onChangeText={onChange}
                                placeholder="Nhập email"
                                keyboardType="email-address"
                                containerStyle={styles.inputContainer}
                                error={errors.email?.message}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="address"
                        render={({ field: { onChange, value } }) => (
                            <Input
                                label="Địa chỉ:"
                                value={value}
                                onChangeText={onChange}
                                placeholder="Nhập địa chỉ"
                                containerStyle={styles.inputContainer}
                                error={errors.address?.message}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="role"
                        render={({ field: { value } }) => (
                            <Input
                                label="Chức vụ:"
                                value={value}
                                placeholder="Chức vụ"
                                containerStyle={styles.inputContainer}
                                disabled
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="level"
                        render={({ field: { value } }) => (
                            <Input
                                label="Cấp quản lý:"
                                value={value}
                                placeholder="Ví dụ: Quản lý trại, Quản lý ao"
                                containerStyle={styles.inputContainer}
                                disabled
                            />
                        )}
                    />
                </View>

                {/* Connected Entity Footer */}
                <View style={styles.footerContainer}>
                    <Text style={styles.footerLabel}>
                        {showFarms ? 'Trang trại đã kết nối' : 'Ao đã kết nối'}
                    </Text>
                    <Text style={styles.footerValue}>
                        {totalCount} {showFarms ? 'trại' : 'ao'}
                    </Text>
                </View>

                <View style={styles.bottomSpacer} />
            </ScrollView>

            <ButtonBarMenu
                primaryTitle={isSubmitting ? 'Đang lưu thông tin...' : 'Lưu thông tin'}
                secondaryTitle="Hủy"
                onPrimaryPress={handleSubmit(onSubmit)}
                onSecondaryPress={onCancel}
                primaryDisabled={isSubmitting}
            />
        </View>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.backgroundPrimary,
        },
        scrollContent: {
            paddingBottom: 20,
        },
        sectionContainer: {
            backgroundColor: theme.white,
            marginTop: 12,
            paddingHorizontal: spacing.md,
            paddingBottom: spacing.lg,
        },
        sectionTitle: {
            fontSize: 14,
            fontWeight: '700',
            color: theme.text,
            paddingVertical: spacing.md,
        },
        separator: {
            height: 1.1,
            backgroundColor: theme.border,
            marginBottom: spacing.lg,
            marginHorizontal: -spacing.md,
        },
        separatortwo: {
            height: 1.1,
            backgroundColor: theme.border,
            marginBottom: spacing.lg,
        },
        avatarContainer: {
            alignItems: 'center',
            marginBottom: spacing.lg,
        },
        avatar: {
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: theme.gray[300],
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: spacing.xs,
            overflow: 'hidden',
        },
        avatarImage: {
            width: 80,
            height: 80,
            borderRadius: 40,
        },
        changePhotoText: {
            fontSize: 14,
            color: theme.primary,
            fontWeight: '400',
        },
        inputContainer: {
            marginBottom: spacing.md,
        },
        footerContainer: {
            backgroundColor: theme.white,
            marginTop: 12,
            padding: spacing.md,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        footerLabel: {
            fontSize: 14,
            fontWeight: '700',
            color: theme.text,
        },
        footerValue: {
            fontSize: 14,
            color: theme.textSecondary,
        },
        bottomSpacer: {
            height: 20,
        },
    });
