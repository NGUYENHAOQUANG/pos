import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Dimensions,
    TouchableOpacity,
    Image,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { borderRadius, colors } from '@/styles';
import BackgroundMenu from '@/assets/backgrounds/BackgroundMenu.svg';
import LogoutIcon from '@/assets/Icon/IconMenu/LogoutOutlined.svg';
import AvatarIcon from '@/assets/Icon/IconMenu/Avatar.svg';
import { FarmOperation } from '@/features/menu/components/FarmOperation';
import { RecordManagement } from '@/features/menu/components/RecordManagement';
import { SecurityManagement } from '@/features/menu/components/SecurityManagement';
import { DeleteAccountButton } from '@/features/menu/components/DeleteAccountButton';
import { ConfirmationModalUI } from '@/shared/components/modal/ConfirmationModalUI';
import { useNavigation, useScrollToTop } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '@/app/navigation/AppStack';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useUserProfile, UserProfileData } from '@/features/menu/hooks/useUserProfile';
import { useQueryClient } from '@tanstack/react-query';

const { width } = Dimensions.get('window');

const ProfileCard = ({ onPress, userData }: { onPress: () => void; userData: UserProfileData }) => {
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
        <View style={styles.container}>
            {/* Background Header */}
            <View style={styles.headerBackground}>
                <BackgroundMenu
                    width={width}
                    height={width * 0.6}
                    style={StyleSheet.absoluteFillObject}
                />
            </View>

            <View style={[styles.safeArea, { paddingTop: insets.top + 22 }]}>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>Menu</Text>
                </View>

                <View style={styles.fixedContent}>
                    <ProfileCard onPress={handleProfilePress} userData={userData} />
                </View>

                <View style={styles.scrollWrapper}>
                    <ScrollView
                        ref={scrollViewRef}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.sectionContainer}>
                            <FarmOperation />
                            <RecordManagement />
                            <SecurityManagement />
                            <DeleteAccountButton />
                        </View>

                        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                            <LogoutIcon width={16} height={16} />
                            <Text style={styles.logoutText}>Đăng xuất</Text>
                        </TouchableOpacity>
                        {/* Version */}
                        <Text style={styles.versionText}>Phiên bản {DeviceInfo.getVersion()}</Text>

                        {/* Bottom spacer for tab bar */}
                        <View style={styles.bottomSpacer} />
                    </ScrollView>
                </View>
            </View>

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
    headerBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 300,
    },
    safeArea: {
        flex: 1,
    },
    headerTitleContainer: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 18,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.white,
    },
    scrollWrapper: {
        flex: 1,
        marginTop: 16,
        marginHorizontal: 16,
        borderTopLeftRadius: borderRadius.md,
        borderTopRightRadius: borderRadius.md,
        overflow: 'hidden',
    },
    scrollContent: {
        paddingHorizontal: 0,
        paddingTop: 0,
        paddingBottom: 100,
    },
    fixedContent: {
        paddingHorizontal: 16,
        zIndex: 1,
        paddingBottom: 0,
    },
    profileCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 0,
        borderWidth: 1,
        borderColor: colors.defaultBorder,
    },
    avatarContainer: {
        marginRight: 16,
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        // backgroundColor: colors.gray[200], // SVG handles background or should be transparent
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    avatarImage: {
        width: 64,
        height: 64,
        borderRadius: 32,
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 4,
    },
    roleTag: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: colors.blue[200],
        alignSelf: 'flex-start',
        backgroundColor: colors.blue[50],
    },
    roleText: {
        color: colors.blue[600],
        fontSize: 12,
        fontWeight: '400',
    },
    sectionContainer: {
        gap: 16,
        marginBottom: 16,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.red[600],
        borderRadius: borderRadius.md,
        paddingVertical: 12,
        gap: 8,
    },
    logoutText: {
        fontSize: 14,
        color: colors.red[600], // Adjust specific red if needed
        fontWeight: '400',
    },
    bottomSpacer: {
        height: 8,
    },
    versionText: {
        textAlign: 'center',
        marginTop: 25,
        fontSize: 13,
        color: colors.textSecondary,
        fontWeight: '400',
    },
});
