/**
 * @file useLoginFlow.ts
 * @description Hook to handle login flow logic (OTP request, validation, navigation)
 */
import { useState, useCallback } from 'react';
import { Keyboard } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';

import { AuthStackParamList } from '@/app/navigation/types';
import { authApi } from '@/features/auth/api/authApi';
import { notificationHelper } from '@/shared/utils/notificationHelper';
import { NormalizedError } from '@/core/api/errorHandler';
const VN_PHONE_REGEX = /^(0)(3|5|7|8|9)([0-9]{8})$/;

interface UseLoginFlowReturn {
    // State
    phoneNumber: string;
    setPhoneNumber: (value: string) => void;
    error: string;
    isUnregistered: boolean;
    isUnverifiedAccount: boolean;
    isLoading: boolean;

    // Actions
    handleLogin: () => Promise<void>;
    handleVerifyNow: () => Promise<void>;
    handleRegisterPress: () => void;
    handleClearError: () => void;
    handlePhoneChange: (text: string) => void;
}

export function useLoginFlow(): UseLoginFlowReturn {
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

    const [phoneNumber, setPhoneNumber] = useState('');
    const [error, setError] = useState('');
    const [isUnregistered, setIsUnregistered] = useState(false);
    const [isUnverifiedAccount, setIsUnverifiedAccount] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const dismissKeyboardAndDelay = useCallback(
        () =>
            new Promise<void>(resolve => {
                Keyboard.dismiss();
                setTimeout(resolve, 1500);
            }),
        []
    );

    const validatePhoneNumber = (phone: string): boolean => {
        if (!phone.trim()) {
            setError('Vui lòng nhập số điện thoại.');
            return false;
        }

        const rawPhone = phone.replace(/\s/g, '');
        if (!VN_PHONE_REGEX.test(rawPhone)) {
            Toast.show({
                type: 'error',
                text1: 'Số điện thoại không hợp lệ',
                text2: 'Vui lòng kiểm tra lại số điện thoại',
            });
            return false;
        }

        return true;
    };

    const handlePhoneChange = (text: string) => {
        setPhoneNumber(text);
        if (error) setError('');
        if (isUnregistered) setIsUnregistered(false);
        if (isUnverifiedAccount) setIsUnverifiedAccount(false);
    };

    const handleLogin = async () => {
        setError('');
        setIsUnregistered(false);
        setIsUnverifiedAccount(false);

        if (!validatePhoneNumber(phoneNumber)) {
            return;
        }

        const rawPhone = phoneNumber.replace(/\s/g, '');
        setIsLoading(true);
        await dismissKeyboardAndDelay();

        try {
            const response = await authApi.requestOtp(rawPhone);

            if (response.success || response.statusCode === 200) {
                const status = response?.data?.status;
                const otpCode = response?.data?.otpCode || response?.data?.testOtp;
                const message = response?.data?.message;

                // Check for UNVERIFIED status (case-insensitive)
                if (status && status.toUpperCase() === 'UNVERIFIED') {
                    // Show error toast
                    Toast.show({
                        type: 'error',
                        text1: 'Tài khoản chưa xác thực',
                        text2: message || 'Vui lòng nhập mã OTP để xác thực tài khoản.',
                        visibilityTime: 4000,
                    });
                    // Proceed to OTP screen if we have code (or even if we don't, to let user input)
                    if (otpCode) {
                        await notificationHelper.displayOtpNotification(String(otpCode));
                    }

                    navigation.navigate('Verify-otp', {
                        method: 'phone',
                        contact: rawPhone,
                        otpCode: otpCode ? String(otpCode) : undefined,
                    });
                    return;
                }

                // Status is not UNVERIFIED - show OTP and proceed
                if (otpCode) {
                    await notificationHelper.displayOtpNotification(String(otpCode));
                }

                navigation.navigate('Verify-otp', {
                    method: 'phone',
                    contact: rawPhone,
                    otpCode: otpCode ? String(otpCode) : undefined,
                });
            } else {
                setIsUnregistered(true);
            }
        } catch (err: unknown) {
            const error = err as NormalizedError;

            // Handle pending OTP case from backend
            const responseData = error.data;
            const otpCode = responseData?.data?.otpCode || responseData?.data?.testOtp;

            if (otpCode) {
                await notificationHelper.displayOtpNotification(String(otpCode));
                Toast.show({ type: 'success', text1: 'Mã xác nhận (đang chờ) đã được gửi lại' });

                navigation.navigate('Verify-otp', {
                    method: 'phone',
                    contact: rawPhone,
                    otpCode: String(otpCode),
                });
                return;
            }

            if (error.type === 'VALIDATION_ERROR') {
                const msg = error.fields['PhoneNumber']?.[0] || 'Số điện thoại không hợp lệ';
                setError(msg);
                Toast.show({
                    type: 'error',
                    text1: msg,
                    visibilityTime: 4000,
                });
                return;
            }
            if (error.type === 'NOT_FOUND_ERROR' || error.statusCode === 404) {
                setIsUnregistered(true);
                setError('');
                return;
            }

            // Handle generic errors like timeout ("Vui lòng đợi...")
            Toast.show({
                type: 'error',
                text1: error.message || responseData?.message || 'Không thể gửi mã xác nhận',
            });
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Handle verify now button for unverified accounts
     */
    const handleVerifyNow = async () => {
        const rawPhone = phoneNumber.replace(/\s/g, '');

        setIsLoading(true);
        await dismissKeyboardAndDelay();

        try {
            const response = await authApi.requestOtp(rawPhone);
            // const status = response?.data?.status; // Unused
            const otpCode = response?.data?.otpCode || response?.data?.testOtp;

            // If success or even if Unverified (since we are verifying now), proceed if we have OTP
            if (response.success || response.statusCode === 200) {
                if (otpCode) {
                    await notificationHelper.displayOtpNotification(String(otpCode));
                }

                navigation.navigate('Verify-otp', {
                    method: 'phone',
                    contact: rawPhone,
                    otpCode: otpCode ? String(otpCode) : undefined,
                });
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Lỗi',
                    text2: response?.message || 'Không thể gửi mã OTP. Vui lòng thử lại.',
                });
            }
        } catch (err: unknown) {
            const error = err as NormalizedError;
            console.error('Verify now failed:', error);

            const responseData = error.data;
            const otpCode = responseData?.data?.otpCode || responseData?.data?.testOtp;

            if (otpCode) {
                await notificationHelper.displayOtpNotification(String(otpCode));
                Toast.show({ type: 'success', text1: 'Mã xác nhận (đang chờ) đã được gửi lại' });
                navigation.navigate('Verify-otp', {
                    method: 'phone',
                    contact: rawPhone,
                    otpCode: String(otpCode),
                });
                return;
            }

            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2:
                    error.message ||
                    responseData?.message ||
                    'Không thể gửi mã OTP. Vui lòng thử lại.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Handle register button press
     */
    const handleRegisterPress = () => {
        setError('');
        setIsUnregistered(false);

        if (!validatePhoneNumber(phoneNumber)) {
            return;
        }

        const rawPhone = phoneNumber.replace(/\s/g, '');
        navigation.navigate('Register', {
            phoneNumber: rawPhone,
        });
    };

    /**
     * Clear all errors and reset state
     */
    const handleClearError = () => {
        setPhoneNumber('');
        setError('');
        setIsUnregistered(false);
        setIsUnverifiedAccount(false);
    };

    return {
        // State
        phoneNumber,
        setPhoneNumber,
        error,
        isUnregistered,
        isUnverifiedAccount,
        isLoading,

        // Actions
        handleLogin,
        handleVerifyNow,
        handleRegisterPress,
        handleClearError,
        handlePhoneChange,
    };
}
