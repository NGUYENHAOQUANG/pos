import React, { useState, useEffect, useRef } from 'react';
import {
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    View,
    KeyboardAvoidingView,
    TouchableOpacity,
    Keyboard,
    AppState,
    AppStateStatus,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '@/app/navigation/types';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '@/styles';
import { Button, Logo } from '@/shared/components';
import { useAuthStore } from '@/features/auth/store/authStore';
import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import { notificationHelper } from '@/shared/utils/notificationHelper';
import OTPInput, { OTPInputHandle } from '@/features/auth/components/OTPInput';
import { spacing } from '@/styles';
import Toast from 'react-native-toast-message';
import { formatAuthPhoneDisplay } from '@/features/auth/utils/phone';

// Countdown duration in seconds
const COUNTDOWN_DURATION = 60;

export default function VerifyOTPScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
    const route = useRoute<RouteProp<AuthStackParamList, 'Verify-otp'>>();
    const verifyOtp = useAuthStore(state => state.verifyOtp);
    const { contact } = route.params;

    const [otp, setOtp] = useState<string[]>(['', '', '', '']);

    // Removed programmatic auto-fill as per user request to rely on native keyboard autofill
    // useEffect(() => {
    //     if (otpCode) {
    //          setOtp(String(otpCode).split('').slice(0, 4));
    //     }
    // }, [otpCode]);
    const [errorMessage, setErrorMessage] = useState('');
    const [countdown, setCountdown] = useState(COUNTDOWN_DURATION);
    // Store the timestamp when countdown started (for real-time calculation)
    const [countdownStartTime, setCountdownStartTime] = useState<number>(Date.now());

    const otpInputRef = useRef<OTPInputHandle>(null);

    const isError = !!errorMessage;
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
    useEffect(() => {
        const keyboardShowListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            () => {
                setKeyboardVisible(true);
            }
        );
        const keyboardHideListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
                setKeyboardVisible(false);
            }
        );

        return () => {
            keyboardHideListener.remove();
            keyboardShowListener.remove();
        };
    }, []);
    // Calculate remaining countdown based on real elapsed time
    const calculateRemainingTime = React.useCallback(() => {
        const elapsed = Math.floor((Date.now() - countdownStartTime) / 1000);
        const remaining = COUNTDOWN_DURATION - elapsed;
        return remaining > 0 ? remaining : 0;
    }, [countdownStartTime]);

    // Countdown timer with AppState support for background handling
    useEffect(() => {
        // Update countdown based on real time
        const updateCountdown = () => {
            const remaining = calculateRemainingTime();
            setCountdown(remaining);
        };

        // Handle app state changes (background/foreground)
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            if (nextAppState === 'active') {
                // App came to foreground, recalculate countdown
                updateCountdown();
            }
        };

        // Subscribe to app state changes
        const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

        // Set up interval for countdown (only updates when app is active)
        let timer: ReturnType<typeof setInterval> | undefined;
        const remaining = calculateRemainingTime();
        if (remaining > 0) {
            timer = setInterval(updateCountdown, 1000);
        }

        return () => {
            appStateSubscription.remove();
            if (timer) {
                clearInterval(timer);
            }
        };
    }, [calculateRemainingTime]);

    // Flag to prevent auto-submit loop when OTP is wrong
    const hasAutoSubmittedRef = useRef(false);

    // Local loading state - don't use store loading to avoid blocking UI
    const [isVerifying, setIsVerifying] = useState(false);

    const handleOtpChange = (newCode: string[]) => {
        setOtp(newCode);
        if (errorMessage) setErrorMessage('');
        // Reset auto-submit flag when user changes OTP
        hasAutoSubmittedRef.current = false;
    };

    const handleVerifyOTP = React.useCallback(async () => {
        const otpString = otp.join('');

        if (otpString.length === 0) {
            setErrorMessage('Vui lòng nhập mã để tiếp tục');
            return;
        }

        if (otpString.length < 4) {
            setErrorMessage('Vui lòng nhập đủ 4 số.');
            return;
        }

        if (otpString === '9999') {
            setErrorMessage('Mã không chính xác, vui lòng kiểm tra và thử lại.');
            return;
        }

        setIsVerifying(true);
        try {
            // Call API verify OTP via Store (handles login)
            const status = await verifyOtp(contact, otpString);

            if (status === 'REQUIRE_UPDATE_PROFILE') {
                navigation.replace('Info', {
                    phone: contact,
                    userId: useAuthStore.getState().user?.id,
                } as any); // Type cast if needed or update Params List
            } else {
                Toast.show({
                    type: 'success',
                    text1: 'Đăng nhập thành công',
                    visibilityTime: 2000,
                });
            }

            // Success! Store update (isAuthenticated=true) will trigger navigation to Main App if status is COMPLETED
        } catch (error) {
            setErrorMessage('Mã không chính xác, vui lòng kiểm tra và thử lại.');
            console.error(error);
        } finally {
            setIsVerifying(false);
        }
    }, [otp, contact, verifyOtp, navigation]);

    // Auto-submit effect - only triggers once per OTP entry
    useEffect(() => {
        if (otp.join('').length === 4 && !hasAutoSubmittedRef.current) {
            hasAutoSubmittedRef.current = true;
            handleVerifyOTP();
        }
    }, [otp, handleVerifyOTP]);

    const [isResending, setIsResending] = useState(false);

    const handleResendOTP = async () => {
        if (isResending) return;

        setIsResending(true);
        try {
            let phoneNumber = contact.replace(/\s+/g, ''); // Remove spaces
            if (phoneNumber.startsWith('+84')) {
                phoneNumber = '0' + phoneNumber.slice(3);
            }

            // Call API to resend OTP
            const response = await apiClient.post(API_ENDPOINTS.AUTH.SEND_OTP, {
                phoneNumber: phoneNumber,
            });

            // Extract OTP from response (for test/dev notification)
            const otpCode =
                response.data?.testOtp ||
                response.data?.data?.testOtp ||
                response.data?.data?.otpCode ||
                response.data?.otpCode;

            if (otpCode) {
                notificationHelper.displayOtpNotification(String(otpCode));
            }

            // Reset countdown and UI
            setCountdownStartTime(Date.now());
            setCountdown(COUNTDOWN_DURATION);
            setOtp(['', '', '', '']);
            setErrorMessage('');
            otpInputRef.current?.focusFirst();

            Toast.show({
                type: 'success',
                text1: 'Đã gửi lại mã OTP',
                visibilityTime: 2000,
            });
        } catch (error: unknown) {
            const axiosError = error as { response?: { data?: { message?: string } } };
            Toast.show({
                type: 'error',
                text1: axiosError.response?.data?.message || 'Gửi lại mã thất bại',
                visibilityTime: 3000,
            });
        } finally {
            setIsResending(false);
        }
    };

    const displayContact = formatAuthPhoneDisplay(contact);

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            {!isKeyboardVisible && (
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
            )}

            <KeyboardAvoidingView
                behavior={Platform.OS === 'android' ? 'padding' : undefined}
                style={styles.keyboardView}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                >
                    <View style={styles.card}>
                        <View style={styles.logoWrapper}>
                            <Logo size="medium" />
                        </View>
                        <View style={styles.spacer} />
                        <Text style={styles.title}>Đăng nhập</Text>
                        <Text style={styles.subtitle}>Nhập mã được gửi đến số điện thoại</Text>
                        <Text style={styles.phoneNumber}>{displayContact}</Text>

                        <View style={styles.otpInputSection}>
                            <OTPInput
                                ref={otpInputRef}
                                code={otp}
                                onCodeChanged={handleOtpChange}
                                isError={isError}
                                length={4}
                            />
                        </View>

                        {isError ? (
                            <Text style={styles.errorText} numberOfLines={1} adjustsFontSizeToFit>
                                {errorMessage}
                            </Text>
                        ) : (
                            <View style={styles.errorPlaceholder} />
                        )}

                        <View style={styles.resendContainer}>
                            <Text style={styles.resendLabel}>Không nhận được mã? </Text>
                            {countdown > 0 ? (
                                <Text style={styles.timerText}>
                                    <Text style={styles.disabledLink}>Gửi lại mã</Text> (chờ sau 0:
                                    {countdown.toString().padStart(2, '0')})
                                </Text>
                            ) : (
                                <TouchableOpacity onPress={handleResendOTP}>
                                    <Text style={styles.activeLink}>Gửi lại mã</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        <View style={styles.buttonWrapper}>
                            <Button
                                title={isVerifying ? 'Đang xác thực...' : 'Tiếp Tục'}
                                onPress={handleVerifyOTP}
                                variant="primary"
                                fullWidth
                                disabled={isVerifying}
                                style={styles.submitButton}
                            />
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
    },
    backButton: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 45 : 50,
        left: 20,
        zIndex: 10,
        padding: 8,
        backgroundColor: colors.white,
        borderRadius: 20,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: spacing.lg,
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: 16,
        paddingVertical: spacing.md,
        alignItems: 'center',
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
        overflow: 'hidden',
    },
    spacer: {
        width: '100%',
        marginBottom: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        alignSelf: 'stretch',
    },
    logoWrapper: {
        marginBottom: spacing.md,
        paddingHorizontal: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.gray[800],
        marginBottom: 16,
        paddingHorizontal: 24,
    },
    subtitle: {
        fontSize: 15,
        color: colors.text,
        textAlign: 'center',
        marginBottom: 4,
        paddingHorizontal: 24,
    },
    phoneNumber: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 32,
        paddingHorizontal: 24,
    },
    otpInputSection: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 8,
        paddingHorizontal: 24,
    },
    errorText: {
        color: colors.error,
        fontSize: 13,
        marginBottom: 16,
        marginTop: 4,
        textAlign: 'center',
        paddingHorizontal: 4,
    },
    resendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 32,
        paddingHorizontal: 24,
    },
    resendLabel: {
        color: colors.gray[700],
        fontSize: 14,
    },
    timerText: {
        color: colors.gray[700],
        fontSize: 14,
    },
    disabledLink: {
        textDecorationLine: 'underline',
        color: colors.textTertiary,
    },
    activeLink: {
        color: colors.primary,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
    buttonWrapper: {
        width: '100%',
        paddingHorizontal: 24,
    },
    submitButton: {
        backgroundColor: colors.primary,
        borderRadius: 25,
        height: 50,
    },
    errorPlaceholder: {
        height: 24,
    },
});
