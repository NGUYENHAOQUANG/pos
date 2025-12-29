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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '@/app/navigation/types';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuthStore } from '@/features/auth/store/authStore';
import { colors } from '@/styles';
import { Button, Logo } from '@/shared/components';
import OTPInput, { OTPInputHandle } from '../components/OTPInput';
import { spacing } from '@/styles';

export default function VerifyOTPScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
    const route = useRoute<RouteProp<AuthStackParamList, 'Verify-otp'>>();
    const login = useAuthStore(state => state.login);

    const { contact } = route.params || { contact: '0908 123 456' };

    const [otp, setOtp] = useState<string[]>(['', '', '', '']);
    const [errorMessage, setErrorMessage] = useState('');
    const [countdown, setCountdown] = useState(59);

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

    const handleVerifyOTP = async () => {
        const otpString = otp.join('');

        if (otpString.length === 0) {
            setErrorMessage('Vui lòng nhập mã để tiếp tục');
            return;
        }

        if (otpString.length < 4) {
            setErrorMessage('Vui lòng nhập đủ 4 số.');
            return;
        }

        if (otpString === '0000') {
            setErrorMessage('Mã không chính xác, vui lòng kiểm tra và thử lại.');
            return;
        }

        try {
            console.log('Verify Success:', otpString);
            await login({ phone: contact, password: '' });
        } catch (error) {
            setErrorMessage('Đăng nhập thất bại, vui lòng thử lại.');
            console.error(error);
        }
    };
    const handleResendOTP = () => {
        setCountdown(59);
        setOtp(['', '', '', '']);
        setErrorMessage('');

        otpInputRef.current?.focusFirst();

        console.log('Resend OTP Sent');
    };

    const displayContact = contact.replace(/\D/g, '').replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            {!isKeyboardVisible && (
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
            )}

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
                            <Text style={styles.errorText}>{errorMessage}</Text>
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
                                title="Tiếp Tục"
                                onPress={handleVerifyOTP}
                                variant="primary"
                                fullWidth
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
        top: Platform.OS === 'ios' ? 30 : 35,
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
        paddingHorizontal: 24,
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
