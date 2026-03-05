import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    AppState,
    AppStateStatus,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '@/app/navigation/types';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, typography } from '@/styles';
import { Button } from '@/shared/components';
import OTPIcon from '@/assets/Icon/OTP.svg';
import { useAuthStore } from '@/features/auth/store/authStore';
import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import { notificationHelper } from '@/shared/utils/notificationHelper';
import OTPInput, { OTPInputHandle } from '@/features/auth/components/OTPInput';
import Toast from 'react-native-toast-message';
import { formatAuthPhoneDisplay } from '@/features/auth/utils/phone';
import { normalizeApiError } from '@/core/api/errorHandler';
import { FloatingBubblesBackground } from '@/shared/components/ui/FloatingBubblesBackground';
const COUNTDOWN_DURATION = 60;

export default function VerifyOTPScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
    const route = useRoute<RouteProp<AuthStackParamList, 'Verify-otp'>>();
    const verifyOtp = useAuthStore(state => state.verifyOtp);
    const { contact } = route.params;

    const [otp, setOtp] = useState<string[]>(['', '', '', '']);
    const [errorMessage, setErrorMessage] = useState('');
    const [countdown, setCountdown] = useState(COUNTDOWN_DURATION);
    const [countdownStartTime, setCountdownStartTime] = useState<number>(Date.now());

    const otpInputRef = useRef<OTPInputHandle>(null);
    const isError = !!errorMessage;
    const [keyboardOffset, setKeyboardOffset] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => otpInputRef.current?.focusFirst(), 300);
        return () => clearTimeout(timer);
    }, []);

    const calculateRemainingTime = useCallback(() => {
        const elapsed = Math.floor((Date.now() - countdownStartTime) / 1000);
        const remaining = COUNTDOWN_DURATION - elapsed;
        return remaining > 0 ? remaining : 0;
    }, [countdownStartTime]);

    useEffect(() => {
        if (Platform.OS !== 'android') return;

        const showSub = Keyboard.addListener('keyboardDidShow', event => {
            setKeyboardOffset(event.endCoordinates.height);
        });

        const hideSub = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardOffset(0);
        });

        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    useEffect(() => {
        const updateCountdown = () => {
            const remaining = calculateRemainingTime();
            setCountdown(remaining);
        };
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            if (nextAppState === 'active') updateCountdown();
        };
        const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
        let timer = setInterval(updateCountdown, 1000);
        return () => {
            appStateSubscription.remove();
            if (timer) clearInterval(timer);
        };
    }, [calculateRemainingTime]);

    const hasAutoSubmittedRef = useRef(false);
    const [isVerifying, setIsVerifying] = useState(false);

    const handleOtpChange = (newCode: string[]) => {
        setOtp(newCode);
        if (errorMessage) setErrorMessage('');
        hasAutoSubmittedRef.current = false;
    };

    const handleVerifyOTP = useCallback(async () => {
        const otpString = otp.join('');
        if (otpString.length < 4) {
            setErrorMessage('Vui lòng nhập đủ 4 số.');
            return;
        }
        setIsVerifying(true);
        try {
            const status = await verifyOtp(contact, otpString);
            if (status === 'REQUIRE_UPDATE_PROFILE') {
                navigation.replace('Info', {
                    phone: contact,
                    userId: useAuthStore.getState().user?.id,
                } as any);
            } else {
                Toast.show({ type: 'success', text1: 'Đăng nhập thành công' });
            }
        } catch (err) {
            setErrorMessage(normalizeApiError(err).message);
        } finally {
            setIsVerifying(false);
        }
    }, [otp, contact, verifyOtp, navigation]);

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
            let phone = contact.replace(/\s+/g, '');
            if (phone.startsWith('+84')) phone = '0' + phone.slice(3);
            const response = await apiClient.post(API_ENDPOINTS.AUTH.SEND_OTP, {
                phoneNumber: phone,
            });
            const otpCode = response.data?.testOtp || response.data?.otpCode;
            if (otpCode) notificationHelper.displayOtpNotification(String(otpCode));
            setCountdownStartTime(Date.now());
            setCountdown(COUNTDOWN_DURATION);
            setOtp(['', '', '', '']);
            setErrorMessage('');
            Toast.show({ type: 'success', text1: 'Đã gửi lại mã OTP' });
        } catch (err) {
            Toast.show({ type: 'error', text1: normalizeApiError(err).message });
        } finally {
            setIsResending(false);
        }
    };

    const displayContact = formatAuthPhoneDisplay(contact);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <FloatingBubblesBackground />
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
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.backButtonSection}>
                            <TouchableOpacity
                                style={styles.backButton}
                                onPress={() => navigation.goBack()}
                            >
                                <Ionicons name="arrow-back" size={20} color={colors.text} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.logoSection}>
                            <OTPIcon width={60} height={40} />
                        </View>
                        <View style={styles.contentSection}>
                            <Text style={styles.title}>Nhập mã OTP</Text>
                            <Text style={styles.subtitle}>
                                Nhập mã được gửi đến số điện thoại{'\n'}
                                <Text style={styles.phoneNumber}>{displayContact}</Text>
                            </Text>
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
                                <Text style={styles.errorText}>{errorMessage}</Text>
                            ) : (
                                <View style={styles.errorPlaceholder} />
                            )}
                            <View style={styles.resendContainer}>
                                <Text style={styles.resendLabel}>Không nhận được mã? </Text>
                                {countdown > 0 ? (
                                    <Text style={styles.timerText}>
                                        <Text style={styles.disabledLink}>Gửi lại mã</Text> (chờ sau
                                        0:{countdown.toString().padStart(2, '0')})
                                    </Text>
                                ) : (
                                    <TouchableOpacity onPress={handleResendOTP}>
                                        <Text style={styles.activeLink}>Gửi lại mã</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    </ScrollView>
                    <View
                        style={[
                            styles.submitButtonContainer,
                            Platform.OS === 'android' && {
                                paddingBottom: spacing.xl + spacing.sm + 12 + keyboardOffset,
                            },
                        ]}
                    >
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
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
    },
    keyboardInner: {
        flex: 1,
    },
    mainContentContainer: {
        flex: 1,
        justifyContent: 'space-between',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    backButtonSection: {
        height: 64,
        justifyContent: 'center',
        paddingHorizontal: spacing.md,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
    },
    logoSection: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.lg,
        alignItems: 'flex-start',
    },
    contentSection: {
        paddingHorizontal: spacing.md,
    },
    title: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: '600',
        color: '#0B1117',
        paddingVertical: spacing.md,
    },
    subtitle: {
        fontSize: typography.fontSize.lg,
        color: colors.gray[500],
        lineHeight: 24,
    },
    phoneNumber: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
        lineHeight: 28,
    },
    otpInputSection: {
        width: '100%',
        alignItems: 'center',
        paddingVertical: spacing.md,
    },
    errorText: {
        color: colors.error,
        fontSize: typography.fontSize.sm,
        marginBottom: spacing.md,
    },
    errorPlaceholder: {
        height: spacing.md,
    },
    resendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    resendLabel: {
        color: colors.gray[500],
        fontSize: 14,
    },
    timerText: {
        color: colors.gray[500],
        fontSize: 14,
    },
    disabledLink: {
        color: colors.gray[400],
    },
    activeLink: { color: colors.primary, fontWeight: '500', textDecorationLine: 'underline' },
    submitButtonContainer: {
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.xl + spacing.sm + 12,
        paddingTop: spacing.xs,
    },
    submitButton: { backgroundColor: colors.primary, borderRadius: 25, height: 52 },
});
