import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Text, Image, TouchableOpacity } from 'react-native';
import Toast from 'react-native-toast-message';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import { colors, spacing } from '@/styles';
import { HeaderMenu } from '@/features/menu/components/HeaderMenu';
import { ButtonBarMenu } from '@/features/menu/components/ButtonBarMenu';
import { Input } from '@/shared/components/forms/Input';
import AvatarIcon from '@/assets/Icon/IconMenu/Avatar.svg';

import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { useFarmStore } from '@/features/farm/store/farmStore';
import { pondApi } from '@/features/farm/api/pondApi';
import { useUserStore } from '@/features/menu/store/userStore';

export const EditPersonalInformationScreens: React.FC = () => {
    const navigation = useNavigation();
    const { setTabBarVisible } = useTabBarVisibility();

    // Global User Store
    const userStore = useUserStore();

    // Local Form State (initialized from User Store)
    const [name, setName] = useState(userStore.name);
    const [phone, setPhone] = useState(userStore.phone);
    const [email, setEmail] = useState(userStore.email);
    const [role, setRole] = useState(userStore.role);
    const [level, setLevel] = useState(userStore.level);
    const [avatarUri, setAvatarUri] = useState<string | null>(userStore.avatarUri);

    // Sync local state when store changes (optional, but good if store updates elsewhere)
    useEffect(() => {
        setName(userStore.name);
        setPhone(userStore.phone);
        setEmail(userStore.email);
        setRole(userStore.role);
        setLevel(userStore.level);
        setAvatarUri(userStore.avatarUri);
    }, [
        userStore.name,
        userStore.phone,
        userStore.email,
        userStore.role,
        userStore.level,
        userStore.avatarUri,
    ]);

    // Farm/Pond State
    const { zones, fetchZones } = useFarmStore();
    const [totalCount, setTotalCount] = useState<number>(0);

    const isFarmManager = level?.toLowerCase().includes('trại');
    const isPondManager = level?.toLowerCase().includes('ao');
    const showFarms = isFarmManager || (!isPondManager && !isFarmManager);

    useFocusEffect(
        React.useCallback(() => {
            setTabBarVisible(false);
            return () => {
                setTabBarVisible(true);
            };
        }, [setTabBarVisible])
    );

    const fetchPondCount = useCallback(async () => {
        // If zones are empty, return Mock count (2 ponds as per mock data)
        if (!zones || zones.length === 0) return 2;

        try {
            const promises = zones.map(zone => pondApi.getPondsByZone(zone.id));
            const results = await Promise.all(promises);
            const count = results.reduce((acc, res) => acc + (res.items?.length || 0), 0);

            // If real count is 0, return Mock count
            return count > 0 ? count : 2;
        } catch (error) {
            console.error('Error counting ponds:', error);
            return 2; // Return mock count on error
        }
    }, [zones]);

    useEffect(() => {
        const loadData = async () => {
            if (zones.length === 0) await fetchZones();

            if (showFarms) {
                // If zones present, use length, otherwise mock 2 farms
                setTotalCount(zones.length > 0 ? zones.length : 2);
            } else {
                // If showing ponds, we calculate total ponds
                const count = await fetchPondCount();
                setTotalCount(count);
            }
        };
        loadData();
    }, [zones, fetchZones, showFarms, fetchPondCount]);

    const handleChangePhoto = async () => {
        const result = await launchImageLibrary({
            mediaType: 'photo',
            quality: 1,
        });

        if (result.assets && result.assets.length > 0) {
            setAvatarUri(result.assets[0].uri || null);
        }
    };

    const handleSave = () => {
        // Update global store
        userStore.setUserInfo({
            name,
            phone,
            email,
            role,
            level,
            avatarUri,
        });

        Toast.show({
            type: 'success',
            text1: 'Cập nhật thông tin thành công',
            position: 'top',
        });
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <HeaderMenu title="Sửa thông tin cá nhân" onBack={() => navigation.goBack()} />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Thông tin chung</Text>
                    <View style={styles.separator} />

                    {/* Avatar Section */}
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            {avatarUri ? (
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
                    <Input
                        label="Tên:"
                        value={name}
                        onChangeText={setName}
                        placeholder="Nhập tên"
                        containerStyle={styles.inputContainer}
                    />
                    <Input
                        label="Số điện thoại:"
                        value={phone}
                        onChangeText={setPhone}
                        placeholder="Nhập số điện thoại"
                        keyboardType="phone-pad"
                        containerStyle={styles.inputContainer}
                    />
                    <Input
                        label="Email:"
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Nhập email"
                        keyboardType="email-address"
                        containerStyle={styles.inputContainer}
                    />
                    <Input
                        label="Chức vụ"
                        value={role}
                        onChangeText={setRole}
                        placeholder="Chức vụ"
                        containerStyle={styles.inputContainer}
                        disabled
                    />
                    <Input
                        label="Cấp quản lý"
                        value={level}
                        onChangeText={setLevel}
                        placeholder="Ví dụ: Quản lý trại, Quản lý ao"
                        containerStyle={styles.inputContainer}
                        disabled
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
                primaryTitle="Lưu thông tin"
                secondaryTitle="Huỷ"
                onPrimaryPress={handleSave}
                onSecondaryPress={() => navigation.goBack()}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    sectionContainer: {
        backgroundColor: colors.white,
        marginTop: 12,
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.lg,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.text,
        paddingVertical: spacing.md,
    },
    separator: {
        height: 1.1,
        backgroundColor: colors.border,
        marginBottom: spacing.lg,
        marginHorizontal: -spacing.md,
    },
    separatortwo: {
        height: 1.1,
        backgroundColor: colors.border,
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
        backgroundColor: colors.gray[300],
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
        color: colors.primary, // Blue color
        fontWeight: '400',
    },
    inputContainer: {
        marginBottom: spacing.md,
    },
    footerContainer: {
        backgroundColor: colors.white,
        marginTop: 12,
        padding: spacing.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footerLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.text,
    },
    footerValue: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    bottomSpacer: {
        height: 20,
    },
});
