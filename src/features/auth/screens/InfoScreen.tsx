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
import { CompleteProfilePayload } from '@/features/auth/types/auth.types';
import { documentApi } from '@/features/material/api/documentApi';

import { Button, ErrorBoundary, Logo } from '@/shared/components';
import { Loading } from '@/shared/components/ui/Loading';

import { colors, spacing, typography } from '@/styles';
import { Input } from '@/shared/components/forms/Input';
import AvatarIcon from '@/assets/Icon/IconMenu/Avatar.svg';

import { NormalizedError } from '@/core/api/errorHandler';
import { FloatingBubblesBackground } from '@/shared/components/ui/FloatingBubblesBackground';

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

        setIsLoading(true);
        try {
            if (!user?.id) throw new Error('Không tìm thấy thông tin người dùng');

            let finalAvatarId = '';

            // Handle avatar upload if it's a local URI
            if (avatar && (avatar.startsWith('file://') || avatar.startsWith('content://'))) {
                const fileToUpload = {
                    uri: avatar,
                    type: 'image/jpeg',
                    name: `avatar_${Date.now()}.jpg`,
                };

                const uploadedDocs = await documentApi.upload([fileToUpload]);

                if (uploadedDocs && uploadedDocs.length > 0) {
                    finalAvatarId = uploadedDocs[0].id;
                }
            }

            const payload: CompleteProfilePayload = {
                userId: user.id,
                fullName,
            };

            if (email) payload.email = email;
            if (address) payload.address = address;
            if (finalAvatarId) payload.avatarId = finalAvatarId;

            await completeProfile(payload);
            Toast.show({
                type: 'success',
                text1: 'Cập nhật thông tin thành công',
            });
        } catch (error: any) {
            const normalizedError = error as NormalizedError;
            const message = normalizedError.message || 'Cập nhật thất bại';

            // Check for validation errors if available in data
            const validationErrors = normalizedError.data?.validationErrors;

            let displayMessage = message;
            if (validationErrors) {
                displayMessage += '\n' + JSON.stringify(validationErrors);
            }

            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: displayMessage,
                visibilityTime: 4000,
            });
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
                    <FloatingBubblesBackground />
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
        borderColor: colors.defaultBorder,
        borderWidth: 1,
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
        marginTop: 2,
    },
    unregisteredErrorContainer: {
        marginTop: 2,
    },
    unregisteredErrorText: {
        fontSize: typography.fontSize.sm,
        color: colors.error,
        lineHeight: 22,
        fontWeight: typography.fontWeight.regular,
        letterSpacing: 0,
    },
    unregisteredLinkText: {
        color: colors.primary,
        textDecorationLine: 'underline',
        fontWeight: typography.fontWeight.regular,
        letterSpacing: 0,
    },
    loginButton: {
        backgroundColor: colors.primary,
        borderRadius: 8,
        minHeight: 40,
    },
});
