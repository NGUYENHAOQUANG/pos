import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { useBottomTabBarHeight } from '@/app/navigation/BottomBarContext';
import AntDesign from 'react-native-vector-icons/AntDesign';

import TrashIcon from '@/assets/Icon/IconMenu/Trash.svg';
import SignOutIcon from '@/assets/Icon/IconMenu/SignOut.svg';
import AvatarIcon from '@/assets/Icon/IconMenu/AvatarNew.svg';
import { MenuSectionItemData, MenuSection } from '@/features/menu/components/MenuSection';

import SwimmingPoolIcon from '@/assets/Icon/IconMenu/SwimmingPool.svg';
//import ToolboxIcon from '@/assets/Icon/IconMenu/Toolbox.svg';
import ChartBarIcon from '@/assets/Icon/IconMenu/ChartBar.svg';
import WeatherForecastIcon from '@/assets/Icon/IconMenu/WeatherForecast.svg';

import UserIcon from '@/assets/Icon/IconMenu/User.svg';
import UsersIcon from '@/assets/Icon/IconMenu/Users.svg';
import GearIcon from '@/assets/Icon/IconMenu/Gear.svg';

import GavelIcon from '@/assets/Icon/IconMenu/Gavel.svg';
import ArticleIcon from '@/assets/Icon/IconMenu/Article.svg';
import { ChatbotAvatar } from '@/features/menu/animation/ChatbotAvatar';
import { ConfirmationModalUI } from '@/shared/components/modal/ConfirmationModalUI';
import { useNavigation, useScrollToTop } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '@/app/navigation/AppStack';
import DeviceInfo from 'react-native-device-info';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useUserProfile, UserProfileData } from '@/features/menu/hooks/useUserProfile';
import { useQueryClient } from '@tanstack/react-query';
import { useSettingsStore } from '@/features/menu/store/settingsStore';

interface ProfileCardProps {
    onPress: () => void;
    userData: UserProfileData;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ onPress, userData }) => {
    const { name, role, avatarUri } = userData;
    const theme = useAppTheme();
    const styles = getStyles(theme);

    return (
        <TouchableOpacity style={styles.profileCard} onPress={onPress}>
            <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                    {avatarUri ? (
                        <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                    ) : (
                        <AvatarIcon width={64} height={64} />
                    )}
                </View>
            </View>
            <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{name}</Text>
                <View style={styles.roleTag}>
                    <Text style={styles.roleText}>{role || 'Quản lý'}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export const MenuScreens: React.FC = () => {
    const insets = useSafeAreaInsets();
    const bottomBarHeight = useBottomTabBarHeight();
    const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
    const { userData } = useUserProfile();
    const queryClient = useQueryClient();
    const theme = useAppTheme();
    const styles = getStyles(theme);
    const weatherEnabled = useSettingsStore(s => s.weatherEnabled);
    const chatbotEnabled = useSettingsStore(s => s.chatbotEnabled);

    // Ref for scroll to top
    const scrollViewRef = React.useRef<ScrollView>(null);
    useScrollToTop(scrollViewRef as any);

    const [isLogoutModalVisible, setIsLogoutModalVisible] = React.useState(false);

    const handleLogout = () => {
        setIsLogoutModalVisible(true);
    };

    const logout = useAuthStore(state => state.logout);

    const onConfirmLogout = async () => {
        setIsLogoutModalVisible(false);
        queryClient.clear();
        await logout();
    };

    const handleProfilePress = () => {
        navigation.navigate('PersonalInformation');
    };

    const operationsItem: MenuSectionItemData[] = [
        {
            id: 'cycle',
            title: 'Quản lý vụ nuôi',
            Icon: SwimmingPoolIcon,
            onPress: () => navigation.navigate('AquacultureManagement'),
        },
        // {
        //     id: 'device-maintenance',
        //     title: 'Quản lý bảo trì thiết bị',
        //     Icon: ToolboxIcon,
        //     onPress: () => navigation.navigate('DeviceManagement'),
        // },
        {
            id: 'environment',
            title: 'Thiết lập thông số môi trường',
            Icon: ChartBarIcon,
            onPress: () => navigation.navigate('SettingEnvironment' as any),
        },
        {
            id: 'shrimp-price',
            title: 'Tin tức và giá cả',
            Icon: ChartBarIcon,
            onPress: () => navigation.navigate('ShrimpPrice' as never),
        },
        ...(weatherEnabled
            ? [
                  {
                      id: 'weather',
                      title: 'Dự báo thời tiết',
                      Icon: WeatherForecastIcon,
                      onPress: () => navigation.navigate('WeatherScreen'),
                  },
              ]
            : []),
    ];

    const recordsItem: MenuSectionItemData[] = [
        {
            id: 'profile',
            title: 'Thông tin cá nhân',
            Icon: UserIcon,
            onPress: () => navigation.navigate('PersonalInformation'),
        },
        {
            id: 'members',
            title: 'Quản lý thành viên',
            Icon: UsersIcon,
            onPress: () => navigation.navigate('MemberManagement'),
        },
        {
            id: 'settings',
            title: 'Cài đặt',
            Icon: GearIcon,
            onPress: () => navigation.navigate('Settings'),
        },
    ];

    const securityItems: MenuSectionItemData[] = [
        {
            id: 'privacy',
            title: 'Chính sách bảo mật',
            Icon: GavelIcon,
            onPress: () =>
                navigation.navigate('PolicyWebView', {
                    url: 'https://mebieco.vn/policy-page',
                    title: 'Chính sách bảo mật',
                }),
        },
        {
            id: 'terms',
            title: 'Điều khoản và điều kiện',
            Icon: ArticleIcon,
            onPress: () =>
                navigation.navigate('PolicyWebView', {
                    url: 'https://mebieco.vn/policy-page',
                    title: 'Điều khoản và điều kiện',
                }),
        },
    ];

    const actionItems: MenuSectionItemData[] = [
        {
            id: 'delete-account',
            title: 'Xóa tài khoản',
            Icon: TrashIcon,
            onPress: () => navigation.navigate('DeleteAccount'),
        },
        {
            id: 'logout',
            title: 'Đăng xuất',
            Icon: SignOutIcon,
            hideArrow: true,
            onPress: handleLogout,
        },
    ];

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header title */}
            <View style={styles.headerTitleContainer}>
                <Text style={styles.headerTitle}>Tài Khoản</Text>
            </View>

            {/* Scrollable content */}
            <ScrollView
                ref={scrollViewRef}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomBarHeight }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Profile card */}
                <ProfileCard onPress={handleProfilePress} userData={userData} />

                {/* Content Container (wrapping all menu sections and actions) */}
                <View style={styles.contentContainer}>
                    <MenuSection title="Vận hành trại nuôi" items={operationsItem} />
                    <MenuSection title="Quản lý hồ sơ" items={recordsItem} />
                    <MenuSection title="Quản lý bảo mật" items={securityItems} />

                    {/* Chatbot (Beta) - only show when enabled in Settings */}
                    {chatbotEnabled && (
                        <View style={styles.chatbotSection}>
                            <Text style={styles.chatbotSectionTitle}>Trợ lý AI</Text>
                            <TouchableOpacity
                                style={styles.chatbotCard}
                                onPress={() => navigation.navigate('Chatbot')}
                                onLongPress={() => navigation.navigate('Ingest')}
                                delayLongPress={5000}
                                activeOpacity={0.8}
                            >
                                <View style={styles.chatbotIconWrapper}>
                                    <ChatbotAvatar size={32} animated />
                                </View>
                                <View style={styles.chatbotInfo}>
                                    <Text style={styles.chatbotTitle}>Mebieco AI Chatbot</Text>
                                    <Text style={styles.chatbotDesc}>Trợ lý ảo hỗ trợ quản lý</Text>
                                </View>
                                <View style={styles.chatbotBetaBadge}>
                                    <Text style={styles.chatbotBetaText}>BETA</Text>
                                </View>
                                <AntDesign name="right" size={16} color={theme.textSecondary} />
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Bottom Actions - each as individual card */}
                    <View style={styles.actionGroup}>
                        <MenuSection items={[actionItems[0]]} />
                        <MenuSection items={[actionItems[1]]} />
                    </View>

                    <View style={styles.versionContainer}>
                        <Text style={styles.versionText}>Phiên bản {DeviceInfo.getVersion()}</Text>
                    </View>
                </View>

                {/* Bottom spacer for tab bar */}
                <View style={styles.bottomSpacer} />
            </ScrollView>

            <ConfirmationModalUI
                visible={isLogoutModalVisible}
                onConfirm={onConfirmLogout}
                onCancel={() => setIsLogoutModalVisible(false)}
                title="Đăng xuất"
                message="Bạn có chắc chắn muốn đăng xuất khỏi tài khoản này không?"
                confirmText="Đồng ý"
                cancelText="Không"
                successMessage="Đăng xuất thành công"
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
        headerTitleContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            marginTop: 16,
        },
        headerTitle: {
            fontSize: 20,
            lineHeight: 28,
            fontWeight: '600',
            color: theme.text,
        },
        scrollContent: {
            paddingHorizontal: 16,
            paddingTop: 16,
            gap: 24,
        },
        profileCard: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 16,
        },
        avatarContainer: {},
        avatar: {
            width: 64,
            height: 64,
            borderRadius: 200,
            backgroundColor: theme.backgroundTertiary,
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
        },
        avatarImage: {
            width: 64,
            height: 64,
            borderRadius: 200,
        },
        profileInfo: {
            flex: 1,
        },
        profileName: {
            fontSize: 16,
            fontWeight: '500',
            color: theme.text,
            marginBottom: 4,
        },
        roleTag: {
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 200,
            alignSelf: 'flex-start',
            borderWidth: 1,
            borderColor: theme.blue[200],
            backgroundColor: theme.blue[25],
            justifyContent: 'center',
            alignItems: 'center',
            height: 28,
        },
        roleText: {
            color: theme.blue[600],
            fontSize: 14,
            fontWeight: '500',
        },
        contentContainer: {
            gap: 32,
        },
        bottomSpacer: {
            height: 8,
        },
        actionGroup: {
            gap: 8,
        },
        versionContainer: {
            alignItems: 'center',
            marginTop: -16,
        },
        versionText: {
            fontSize: 13,
            color: theme.textSecondary,
        },
        chatbotSection: {
            gap: 12,
        },
        chatbotSectionTitle: {
            fontSize: 16,
            lineHeight: 20,
            fontWeight: '600',
            color: theme.text,
        },
        chatbotCard: {
            flexDirection: 'row',
            alignItems: 'center',
            height: 56,
            paddingHorizontal: 12,
            gap: 12,
            backgroundColor: theme.background,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: theme.border,
        },
        chatbotIconWrapper: {
            width: 32,
            height: 32,
            justifyContent: 'center',
            alignItems: 'center',
        },
        chatbotInfo: {
            flex: 1,
        },
        chatbotTitle: {
            fontSize: 15,
            lineHeight: 20,
            fontWeight: '500',
            color: theme.text,
        },
        chatbotDesc: {
            fontSize: 12,
            lineHeight: 16,
            color: theme.textSecondary,
        },
        chatbotBetaBadge: {
            backgroundColor: theme.primaryOrange,
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 4,
        },
        chatbotBetaText: {
            color: '#FFFFFF',
            fontSize: 9,
            fontWeight: '700',
            letterSpacing: 0.5,
        },
    });
