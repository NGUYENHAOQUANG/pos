import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Image,
    Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { launchImageLibrary, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '@/features/auth/store/authStore';

import { Button, ErrorBoundary, Logo } from '@/shared/components';
import { Loading } from '@/shared/components/ui/Loading';

import { colors, spacing, typography } from '@/styles';
import { Input } from '@/shared/components/forms/Input';
import AvatarIcon from '@/assets/Icon/IconMenu/Avatar.svg';

export default function InfoScreen() {
    const insets = useSafeAreaInsets();

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [avatar, setAvatar] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const { user, completeProfile } = useAuthStore();

    // Auto-fill phone if available from user store or params
    // But InfoScreen might need route params if user is not fully set in store?
    // Store sets user but isAuthenticated=false, so we can access user.

    const handleSubmit = async () => {
        if (!fullName.trim()) {
            Alert.alert('Thông báo', 'Vui lòng nhập họ và tên');
            return;
        }

        // Debug logging
        console.log('Complete Profile Payload:', {
            userId: user?.id,
            fullName,
            email,
            address,
            avatarUrl: avatar,
        });

        setIsLoading(true);
        try {
            if (!user?.id) throw new Error('Không tìm thấy thông tin người dùng');

            const payload: any = {
                userId: user.id,
                fullName,
            };

            if (email) payload.email = email;
            if (address) payload.address = address;
            if (avatar) payload.avatarUrl = avatar;

            await completeProfile(payload);

            // Success handler usually handled by store updating isAuthenticated
            Toast.show({
                type: 'success',
                text1: 'Cập nhật thông tin thành công',
            });
        } catch (error: any) {
            console.error('Complete Profile Error:', error);
            if (error.response) {
                console.log('Error Data:', error.response.data);
                console.log('Error Status:', error.response.status);
            }

            const message = error.response?.data?.message || error.message || 'Cập nhật thất bại';
            const validationErrors = error.response?.data?.validationErrors;

            let displayMessage = message;
            if (validationErrors) {
                displayMessage += '\n' + JSON.stringify(validationErrors);
            }

            Alert.alert('Lỗi', displayMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChoosePhoto = () => {
        launchImageLibrary(
            {
                mediaType: 'photo' as MediaType,
                quality: 0.8,
            },
            (response: ImagePickerResponse) => {
                if (response.didCancel) {
                    return;
                }
                if (response.errorMessage) {
                    Alert.alert('Lỗi', response.errorMessage);
                    return;
                }
                if (response.assets && response.assets[0]?.uri) {
                    setAvatar(response.assets[0].uri);
                }
            }
        );
    };

    return (
        <ErrorBoundary>
            <Loading isLoading={isLoading}>
                <SafeAreaView
                    style={styles.container}
                    edges={Platform.OS === 'ios' ? ['top', 'bottom'] : ['bottom']}
                >
                    <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

                    {Platform.OS === 'android' && (
                        <View style={[styles.androidStatusBar, { height: insets.top }]} />
                    )}

                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.keyboardView}
                    >
                        <ScrollView
                            style={styles.scrollView}
                            contentContainerStyle={styles.scrollContent}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        >
                            <View style={styles.formCard}>
                                <View style={styles.logoSection}>
                                    <ErrorBoundary>
                                        <Logo size="square" />
                                    </ErrorBoundary>
                                </View>

                                <View style={styles.spacer} />

                                <Text style={styles.screenTitle}>Tạo tài khoản</Text>

                                <View style={styles.avatarContainer}>
                                    <TouchableOpacity onPress={handleChoosePhoto}>
                                        <View style={styles.avatar}>
                                            {avatar ? (
                                                <Image
                                                    source={{ uri: avatar }}
                                                    style={styles.avatarImage}
                                                />
                                            ) : (
                                                <AvatarIcon width={64} height={64} />
                                            )}
                                        </View>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={handleChoosePhoto}>
                                        <Text style={styles.avatarText}>Chọn ảnh</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.formContent}>
                                    <Input
                                        label="Họ và tên"
                                        required
                                        placeholder="Nhập họ và tên"
                                        value={fullName}
                                        onChangeText={setFullName}
                                        containerStyle={{ marginBottom: 0 }}
                                    />

                                    <Input
                                        label="Email"
                                        placeholder="Nhập email của bạn"
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        containerStyle={{ marginBottom: 0 }}
                                    />

                                    <Input
                                        label="Địa chỉ"
                                        placeholder="Nhập địa chỉ của bạn"
                                        value={address}
                                        onChangeText={setAddress}
                                        containerStyle={{ marginBottom: 0 }}
                                    />

                                    <Button
                                        title="Tạo tài khoản"
                                        onPress={handleSubmit}
                                        variant="primary"
                                        fullWidth
                                        style={styles.loginButton}
                                    />
                                </View>
                            </View>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </SafeAreaView>
            </Loading>
        </ErrorBoundary>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
        overflow: 'hidden',
    },
    androidStatusBar: {
        backgroundColor: colors.backgroundPrimary,
    },
    keyboardView: { flex: 1, zIndex: 1 },
    scrollView: { flex: 1, zIndex: 1 },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.lg,
    },
    formCard: {
        backgroundColor: colors.white,
        borderRadius: 16,
        paddingVertical: spacing.md,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
        marginHorizontal: spacing.xs,
    },
    logoSection: {
        alignItems: 'center',
        marginBottom: spacing.md,
        paddingHorizontal: spacing.lg,
    },
    avatarContainer: {
        alignItems: 'center',
        marginTop: spacing.md,
    },
    avatarText: {
        marginTop: spacing.sm,
        color: colors.primary,
        fontWeight: '400',
        fontSize: 14,
        marginBottom: 5,
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    avatarImage: {
        width: 64,
        height: 64,
        borderRadius: 32,
    },
    spacer: {
        width: '100%',
        marginBottom: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    screenTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
        textAlign: 'center',
        marginBottom: spacing.sm,
        paddingHorizontal: spacing.lg,
    },
    formContent: {
        gap: spacing.md,
        marginTop: spacing.sm,
        paddingHorizontal: spacing.lg,
    },
    errorText: {
        fontSize: 14,
        color: colors.error,
        marginTop: 2, // 2px từ input container đến error text
    },
    unregisteredErrorContainer: {
        marginTop: 2, // 2px từ input container đến error text
    },
    unregisteredErrorText: {
        fontSize: typography.fontSize.sm, // 14px
        color: colors.error,
        lineHeight: 22, // 22px theo Figma
        fontWeight: typography.fontWeight.regular, // 400
        letterSpacing: 0,
    },
    unregisteredLinkText: {
        color: colors.primary,
        textDecorationLine: 'underline',
        fontWeight: typography.fontWeight.regular, // 400
        letterSpacing: 0,
    },
    loginButton: {
        backgroundColor: colors.primary,
        borderRadius: 8,
        minHeight: 40,
    },
});
