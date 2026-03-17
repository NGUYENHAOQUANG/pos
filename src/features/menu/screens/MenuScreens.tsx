import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/styles';
import { useBottomTabBarHeight } from '@/app/navigation/BottomBarContext';
import AntDesign from 'react-native-vector-icons/AntDesign';
import TrashIcon from '@/assets/Icon/IconMenu/Trash.svg';
import SignOutIcon from '@/assets/Icon/IconMenu/SignOut.svg';
import AvatarIcon from '@/assets/Icon/IconMenu/AvatarNew.svg';
import { FarmOperation } from '@/features/menu/components/FarmOperation';
import { RecordManagement } from '@/features/menu/components/RecordManagement';
import { SecurityManagement } from '@/features/menu/components/SecurityManagement';
import { ConfirmationModalUI } from '@/shared/components/modal/ConfirmationModalUI';
import { useNavigation, useScrollToTop } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '@/app/navigation/AppStack';
import DeviceInfo from 'react-native-device-info';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useUserProfile, UserProfileData } from '@/features/menu/hooks/useUserProfile';
import { useQueryClient } from '@tanstack/react-query';

interface ProfileCardProps {
    onPress: () => void;
    userData: UserProfileData;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ onPress, userData }) => {
    const { name, role, avatarUri } = userData;

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
        // Call store logout - this triggers AppNavigator state change
        await logout();
    };

    const handleProfilePress = () => {
        navigation.navigate('PersonalInformation');
    };

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
                    <FarmOperation />
                    <RecordManagement />
                    <SecurityManagement />

                    {/* Bottom Actions Group */}
                    <View style={styles.actionsContainer}>
                        {/* Delete Account */}
                        <View style={styles.actionCard}>
                            <TouchableOpacity
                                style={styles.actionRow}
                                onPress={() => navigation.navigate('DeleteAccount')}
                            >
                                <View style={styles.actionIconWrapper}>
                                    <TrashIcon width={18} height={18} />
                                </View>
                                <Text style={styles.actionText}>Xóa tài khoản</Text>
                                <AntDesign name="right" size={16} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        {/* Logout */}
                        <View style={styles.actionCard}>
                            <TouchableOpacity style={styles.actionRow} onPress={handleLogout}>
                                <View style={styles.actionIconWrapper}>
                                    <SignOutIcon width={18} height={18} />
                                </View>
                                <Text style={styles.actionText}>Đăng xuất</Text>
                            </TouchableOpacity>
                        </View>
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
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
        color: colors.text,
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
        backgroundColor: colors.gray[100],
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
        lineHeight: 20,
        color: colors.text,
        marginBottom: 4,
    },
    roleTag: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 200,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: colors.blue[200],
        backgroundColor: colors.blue[25],
        justifyContent: 'center',
        alignItems: 'center',
        height: 28,
    },
    roleText: {
        color: colors.blue[600],
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 20,
    },
    contentContainer: {
        gap: 32,
    },
    actionsContainer: {
        gap: 8,
    },
    actionCard: {
        backgroundColor: colors.white,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.gray[200],
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 44,
        paddingHorizontal: 12,
        gap: 16,
    },
    actionIconWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionText: {
        flex: 1,
        fontSize: 15,
        lineHeight: 20,
        color: colors.gray[950],
        fontWeight: '400',
    },
    bottomSpacer: {
        height: 8,
    },
    versionContainer: {
        alignItems: 'center',
        marginTop: -16,
    },
    versionText: {
        fontSize: 13,
        color: colors.textSecondary,
    },
});
