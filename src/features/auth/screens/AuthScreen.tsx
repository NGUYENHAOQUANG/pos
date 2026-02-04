import React from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    View,
    Text,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, ErrorBoundary, Logo } from '@/shared/components';
import { Loading } from '@/shared/components/ui/Loading';
import PhoneInput from '@/features/auth/components/PhoneInput';
import { colors, spacing, typography } from '@/styles';
import { useLoginFlow } from '@/features/auth/hooks/useLoginFlow';

export default function AuthScreen() {
    const insets = useSafeAreaInsets();
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

                                <Text style={styles.screenTitle}>Đăng nhập</Text>

                                <View style={styles.formContent}>
                                    <PhoneInput
                                        value={phoneNumber}
                                        onChangeText={handlePhoneChange}
                                        error={
                                            isUnregistered || isUnverifiedAccount ? 'error' : error
                                        }
                                        onClear={handleClearError}
                                    />

                                    {/* Hiển thị error message cho số điện thoại chưa đăng ký */}
                                    {isUnregistered && (
                                        <View style={styles.unregisteredErrorContainer}>
                                            <Text style={styles.unregisteredErrorText}>
                                                Số điện thoại này chưa được đăng ký, vui lòng kiểm
                                                tra và thử lại hoặc{' '}
                                                <Text
                                                    style={styles.unregisteredLinkText}
                                                    onPress={handleRegisterPress}
                                                >
                                                    tạo tài khoản mới
                                                </Text>
                                            </Text>
                                        </View>
                                    )}

                                    {/* Hiển thị error message cho tài khoản chưa xác thực */}
                                    {isUnverifiedAccount && (
                                        <View style={styles.unregisteredErrorContainer}>
                                            <Text style={styles.unregisteredErrorText}>
                                                Số điện thoại này đã được đăng ký nhưng chưa xác
                                                thực, vui lòng xác thực ngay
                                            </Text>
                                        </View>
                                    )}

                                    <View style={styles.buttonSection}>
                                        <Button
                                            title={
                                                isUnverifiedAccount ? 'Xác thực ngay' : 'Đăng Nhập'
                                            }
                                            onPress={
                                                isUnverifiedAccount ? handleVerifyNow : handleLogin
                                            }
                                            variant="primary"
                                            fullWidth
                                            style={styles.loginButton}
                                        />
                                    </View>
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
    },
    logoSection: {
        alignItems: 'center',
        marginBottom: spacing.md,
        paddingHorizontal: spacing.lg,
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
        marginTop: spacing.sm,
        paddingHorizontal: spacing.lg,
    },
    buttonSection: {
        marginTop: spacing.md, // 16px từ error text đến button
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
        borderRadius: 25,
        height: 50,
    },
});
