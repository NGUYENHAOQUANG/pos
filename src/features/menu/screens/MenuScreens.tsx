import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/styles';
import BackgroundMenu from '@/assets/backgrounds/BackgroundMenu.svg';
import LogoutIcon from '@/assets/Icon/IconMenu/LogoutOutlined.svg';
import AvatarIcon from '@/assets/Icon/IconMenu/Avatar.svg';
import { FarmOperation } from '@/features/menu/components/FarmOperation';
import { RecordManagement } from '@/features/menu/components/RecordManagement';
import { SecurityManagement } from '@/features/menu/components/SecurityManagement';
import { ConfirmationDeleteModal } from '@/shared/components/modal/ConfirmationDeleteModal';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

import { launchImageLibrary } from 'react-native-image-picker';
import { Image } from 'react-native';

const ProfileCard = ({ onPress }: { onPress: () => void }) => {
    const [avatarUri, setAvatarUri] = React.useState<string | null>(null);

    const handleChoosePhoto = async () => {
        const result = await launchImageLibrary({
            mediaType: 'photo',
            quality: 1,
        });

        if (result.assets && result.assets.length > 0) {
            setAvatarUri(result.assets[0].uri || null);
        }
    };

    return (
        <TouchableOpacity style={styles.profileCard} onPress={onPress}>
            <View style={styles.avatarContainer}>
                <TouchableOpacity onPress={handleChoosePhoto}>
                    <View style={styles.avatar}>
                        {avatarUri ? (
                            <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                        ) : (
                            <AvatarIcon width={64} height={64} />
                        )}
                    </View>
                </TouchableOpacity>
            </View>
            <View style={styles.profileInfo}>
                <Text style={styles.profileName}>Nguyễn Văn A</Text>
                <View style={styles.roleTag}>
                    <Text style={styles.roleText}>{'Quản trị viên'}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export const MenuScreens: React.FC = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const [isLogoutModalVisible, setIsLogoutModalVisible] = React.useState(false);

    const handleLogout = () => {
        setIsLogoutModalVisible(true);
    };

    const onConfirmLogout = () => {
        setIsLogoutModalVisible(false);
        // Navigate deeply to Auth stack, specifically Login screen
        navigation.reset({
            index: 0,
            routes: [{ name: 'Auth', state: { routes: [{ name: 'Login' }] } }],
        });
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
                    <ProfileCard onPress={handleProfilePress} />
                </View>

                <View style={styles.scrollWrapper}>
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.sectionContainer}>
                            <FarmOperation />
                            <RecordManagement />
                            <SecurityManagement />
                        </View>

                        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                            <LogoutIcon width={16} height={16} />
                            <Text style={styles.logoutText}>Đăng xuất</Text>
                        </TouchableOpacity>

                        {/* Bottom spacer for tab bar */}
                        <View style={styles.bottomSpacer} />
                    </ScrollView>
                </View>
            </View>

            <ConfirmationDeleteModal
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
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        overflow: 'hidden',
    },
    scrollContent: {
        paddingHorizontal: 0, // Wrapper handles margin
        paddingTop: 0,
        paddingBottom: 20,
    },
    fixedContent: {
        paddingHorizontal: 16,
        zIndex: 1,
        // backgroundColor: colors.backgroundPrimary, // Not strictly needed unless overlapping
        paddingBottom: 0,
    },
    profileCard: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 0,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: colors.border,
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
        fontSize: 18,
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
        fontWeight: '500',
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
        borderRadius: 8,
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
});
