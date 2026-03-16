import React from 'react';
import {
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    View,
    KeyboardAvoidingView,
} from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, ErrorBoundary, Logo } from '@/shared/components';
import PhoneInput from '@/features/auth/components/PhoneInput';
import DangerIcon from '@/assets/Icon/Danger.svg';
import { colors, spacing, typography } from '@/styles';
import { useLoginFlow } from '@/features/auth/hooks/useLoginFlow';
import { FloatingBubblesBackground } from '@/shared/components/ui/FloatingBubblesBackground';
import { useKeyboard } from '@/shared/hooks/useKeyboard';

export default function AuthScreen() {
    const insets = useSafeAreaInsets();
    const { keyboardVisible } = useKeyboard();
    const {
        phoneNumber,
        error,
        isUnregistered,
        isUnverifiedAccount,
        isLoading,
        handleLogin,
        handleVerifyNow,
        handleRegisterPress,
        handleClearError,
        handlePhoneChange,
    } = useLoginFlow();

    return (
        <ErrorBoundary>
            <SafeAreaView style={styles.container} edges={Platform.OS === 'ios' ? ['top'] : []}>
                <FloatingBubblesBackground />
                <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

                {Platform.OS === 'android' && (
                    <View style={[styles.androidStatusBar, { height: insets.top }]} />
                )}

                <KeyboardAvoidingView
                    enabled={Platform.OS === 'ios'}
                    behavior="padding"
                    style={styles.keyboardInner}
                    keyboardVerticalOffset={0}
                >
                    <View style={styles.mainContentContainer}>
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

                                <Text style={styles.screenTitle}>Đăng nhập</Text>

                                <View style={styles.formContent}>
                                    <PhoneInput
                                        required
                                        placeholder="Nhập số điện thoại"
                                        value={phoneNumber}
                                        onChangeText={handlePhoneChange}
                                        error={
                                            isUnregistered || isUnverifiedAccount ? 'error' : error
                                        }
                                        onClear={handleClearError}
                                    />

                                    <View style={styles.errorBlockReserved}>
                                        {isUnregistered && (
                                            <View style={styles.unregisteredErrorContainer}>
                                                <View style={styles.errorIconWrapper}>
                                                    <DangerIcon width={16} height={16} />
                                                </View>
                                                <Text
                                                    style={[
                                                        styles.unregisteredErrorText,
                                                        { flex: 1 },
                                                    ]}
                                                >
                                                    Số điện thoại này chưa được đăng ký, vui lòng
                                                    kiểm tra và thử lại hoặc{' '}
                                                    <Text
                                                        style={styles.unregisteredLinkText}
                                                        onPress={handleRegisterPress}
                                                    >
                                                        tạo tài khoản mới
                                                    </Text>
                                                </Text>
                                            </View>
                                        )}

                                        {isUnverifiedAccount && (
                                            <View style={styles.unregisteredErrorContainer}>
                                                <View style={styles.errorIconWrapper}>
                                                    <DangerIcon width={16} height={16} />
                                                </View>
                                                <Text
                                                    style={[
                                                        styles.unregisteredErrorText,
                                                        { flex: 1 },
                                                    ]}
                                                >
                                                    Số điện thoại này đã được đăng ký nhưng chưa xác
                                                    thực, vui lòng xác thực ngay
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </View>
                        </ScrollView>

                        <View style={[styles.footer, keyboardVisible && styles.footerKeyboardOpen]}>
                            <Button
                                title={isUnverifiedAccount ? 'Xác thực ngay' : 'Đăng Nhập'}
                                onPress={isUnverifiedAccount ? handleVerifyNow : handleLogin}
                                variant="primary"
                                fullWidth
                                loading={isLoading}
                                style={styles.loginButton}
                            />
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </ErrorBoundary>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
    },
    androidStatusBar: {
        backgroundColor: colors.backgroundPrimary,
    },
    keyboardInner: {
        flex: 1,
    },
    mainContentContainer: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    formCard: {
        paddingVertical: 0,
    },
    logoSection: {
        height: 64,
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
    },
    screenTitle: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: '600',
        color: '#0B1117',
        textAlign: 'left',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
    },
    formContent: {
        marginTop: spacing.sm,
        paddingHorizontal: spacing.md,
    },
    /** Giữ chiều cao cố định cho vùng lỗi để nút không bị đẩy lên khi hiện/ẩn error. */
    errorBlockReserved: {
        minHeight: 56,
    },
    unregisteredErrorContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: 4,
        gap: 6,
    },
    errorIconWrapper: {
        marginTop: 2,
    },
    unregisteredErrorText: {
        fontSize: typography.fontSize.sm,
        color: colors.error,
        lineHeight: 22,
        fontWeight: typography.fontWeight.regular,
    },
    unregisteredLinkText: {
        color: colors.primary,
        textDecorationLine: 'underline',
    },
    loginButton: {
        backgroundColor: colors.primary,
        borderRadius: 25,
        height: 52,
    },
    footer: {
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.xl + spacing.sm + 12,
        paddingTop: spacing.xs,
    },
    footerKeyboardOpen: {
        paddingBottom: spacing.md,
    },
});
