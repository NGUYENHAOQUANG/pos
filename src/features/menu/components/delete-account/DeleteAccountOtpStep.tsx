import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Keyboard,
    TouchableWithoutFeedback,
    Platform,
    KeyboardAvoidingView,
    ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import OTPInput, { OTPInputHandle } from '@/features/auth/components/OTPInput';
import { colors, spacing, typography } from '@/styles';
import { DeleteAccountWarningBox } from './DeleteAccountWarningStep';
import { useKeyboard } from '@/shared/hooks/useKeyboard';
import OTPIcon from '@/assets/Icon/OTP.svg';

interface DeleteAccountOtpStepProps {
    phoneNumber: string;
    onVerify: (otp: string) => void;
    onCancel: () => void;
    onResend: () => void;
    error?: string;
}

export const DeleteAccountOtpStep: React.FC<DeleteAccountOtpStepProps> = ({
    phoneNumber,
    onVerify,
    onCancel,
    onResend,
    error,
}) => {
    const insets = useSafeAreaInsets();
    const { keyboardHeight } = useKeyboard();
    const paddingBottom = Math.max(insets.bottom, 16);

    const [otp, setOtp] = useState<string[]>(['', '', '', '']);
    const [countdown, setCountdown] = useState(59);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (error) {
            setErrorMessage(error);
        }
    }, [error]);

    const otpInputRef = useRef<OTPInputHandle>(null);

    useEffect(() => {
        let timer: ReturnType<typeof setInterval>;
        if (countdown > 0) {
            timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
        }
        return () => clearInterval(timer);
    }, [countdown]);

    const handleOtpChange = (newCode: string[]) => {
        setOtp(newCode);
        if (errorMessage) setErrorMessage('');
    };

    const handleResendInternal = () => {
        setCountdown(59);
        setOtp(['', '', '', '']);
        setErrorMessage('');
        otpInputRef.current?.focusFirst();
        onResend();
    };

    const handleNext = () => {
        const otpString = otp.join('');
        if (otpString.length === 0) {
            setErrorMessage('Vui lòng nhập mã xác nhận');
            return;
        }
        if (otpString.length < 4) {
            setErrorMessage('Vui lòng nhập đủ 4 số');
            return;
        }
        onVerify(otpString);
    };

    const displayPhone = phoneNumber.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3') || '09xx xxx xxx';

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.container}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.innerContainer}>
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={styles.logoSection}>
                            <OTPIcon width={60} height={40} />
                        </View>
                        <Text style={styles.title}>Nhập mã OTP</Text>
                        <Text style={styles.subtitle}>
                            Nhập mã được gửi đến số điện thoại{'\n'}
                            <Text style={styles.phoneText}>{displayPhone}</Text>
                        </Text>

                        {/* OTP Section */}
                        <View style={styles.otpContainer}>
                            <OTPInput
                                ref={otpInputRef}
                                code={otp}
                                onCodeChanged={handleOtpChange}
                                length={4}
                                isError={!!errorMessage}
                            />
                        </View>

                        {/* Error Message */}
                        <View style={styles.errorContainer}>
                            {errorMessage ? (
                                <Text style={styles.errorText}>{errorMessage}</Text>
                            ) : (
                                <View style={styles.errorPlaceholder} />
                            )}
                        </View>

                        {/* Resend Section */}
                        <View style={styles.resendContainer}>
                            <Text style={styles.resendLabel}>Không nhận được mã? </Text>
                            {countdown > 0 ? (
                                <Text style={styles.timerText}>
                                    <TouchableOpacity disabled>
                                        <Text style={styles.disabledLink}>Gửi lại mã</Text>
                                    </TouchableOpacity>{' '}
                                    (chờ sau 0:{countdown.toString().padStart(2, '0')})
                                </Text>
                            ) : (
                                <TouchableOpacity onPress={handleResendInternal}>
                                    <Text style={styles.activeLink}>Gửi lại mã</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Warning Box at the bottom */}
                        <DeleteAccountWarningBox style={{ marginTop: spacing.lg }} />
                    </ScrollView>

                    {/* FOOTER */}
                    <View
                        style={[
                            styles.footer,
                            {
                                paddingBottom:
                                    paddingBottom +
                                    (Platform.OS === 'android' ? keyboardHeight : 0),
                            },
                        ]}
                    >
                        <View style={styles.buttonRow}>
                            {/* Nút Ngừng Xóa */}
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={onCancel}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.cancelButtonText}>Ngừng Xoá Tài Khoản</Text>
                            </TouchableOpacity>

                            <View style={{ width: 12 }} />

                            {/* Nút Tiếp tục */}
                            <TouchableOpacity
                                style={styles.continueButton}
                                onPress={handleNext}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.continueButtonText}>Tiếp tục</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
    },
    innerContainer: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: spacing.md,
        paddingHorizontal: spacing.md,
        paddingBottom: 100,
    },
    // Removed card style as elements use "nền chính"
    logoSection: {
        marginTop: spacing.sm,
        marginBottom: spacing.md,
        alignItems: 'flex-start',
    },
    title: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: '600',
        color: '#0B1117',
        marginBottom: spacing.sm,
    },
    subtitle: {
        fontSize: typography.fontSize.lg,
        color: colors.gray[500],
        lineHeight: 24,
        marginBottom: spacing.lg,
    },
    phoneText: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
        lineHeight: 28,
    },
    otpContainer: {
        width: '100%',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    errorContainer: {
        height: 20,
        marginBottom: 0,
        justifyContent: 'center',
    },
    errorText: {
        color: colors.red[600],
        fontSize: 13,
        textAlign: 'left',
    },
    errorPlaceholder: {
        height: 1,
    },
    resendContainer: {
        flexDirection: 'row',
        marginTop: spacing.xs,
        alignItems: 'center',
    },
    resendLabel: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    timerText: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    disabledLink: {
        textDecorationLine: 'underline',
        color: colors.textTertiary,
    },
    activeLink: {
        fontSize: 14,
        color: colors.primary,
        fontWeight: '500',
        textDecorationLine: 'underline',
    },

    footer: {
        padding: spacing.md,
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.borderLight,
        width: '100%',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cancelButton: {
        flex: 1,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
        height: 52,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButtonText: {
        color: colors.textSecondary,
        fontSize: 15,
        fontWeight: '500',
    },
    continueButton: {
        flex: 1,
        backgroundColor: colors.primary,
        height: 52,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    continueButtonText: {
        color: colors.white,
        fontSize: 15,
        fontWeight: '600',
    },
});
