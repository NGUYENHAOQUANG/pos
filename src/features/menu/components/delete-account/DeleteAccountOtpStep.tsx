import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Keyboard,
    TouchableWithoutFeedback,
    ScrollView,
} from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import OTPInput, { OTPInputHandle } from '@/features/auth/components/OTPInput';
import { spacing, typography } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { DeleteAccountWarningBox } from './DeleteAccountWarningStep';
import { ButtonBar } from '@/shared/components/layout/ButtonBar';
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
    const theme = useAppTheme();
    const styles = getStyles(theme);

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
        <View style={styles.container}>
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
                                <>
                                    <Text style={styles.disabledLink}>Gửi lại mã</Text>
                                    <Text style={styles.timerText}>
                                        {' '}
                                        (chờ sau 0:{countdown.toString().padStart(2, '0')})
                                    </Text>
                                </>
                            ) : (
                                <TouchableOpacity onPress={handleResendInternal}>
                                    <Text style={styles.activeLink}>Gửi lại mã</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Warning Box at the bottom */}
                        <DeleteAccountWarningBox style={{ marginTop: spacing.lg }} />
                    </ScrollView>
                </View>
            </TouchableWithoutFeedback>

            {/* FOOTER */}
            <ButtonBar
                mode="double"
                primaryTitle="Tiếp tục"
                secondaryTitle="Ngừng xoá tài khoản"
                onPrimaryPress={handleNext}
                onSecondaryPress={onCancel}
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
            color: theme.gray[500],
            lineHeight: 24,
            marginBottom: spacing.lg,
        },
        phoneText: {
            fontSize: 18,
            fontWeight: '700',
            color: theme.text,
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
            color: theme.red[600],
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
            color: theme.textSecondary,
        },
        timerText: {
            fontSize: 14,
            color: theme.textSecondary,
        },
        disabledLink: {
            textDecorationLine: 'underline',
            color: theme.textTertiary,
        },
        activeLink: {
            fontSize: 14,
            color: theme.primary,
            fontWeight: '500',
            textDecorationLine: 'underline',
        },
    });
