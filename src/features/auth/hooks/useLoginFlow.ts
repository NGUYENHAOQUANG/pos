/**
 * @file useLoginFlow.ts
 * @description Hook to handle login flow logic (OTP request, validation, navigation)
 */
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';

import { AuthStackParamList } from '@/app/navigation/types';
import { authApi } from '@/features/auth/api/authApi';
import { notificationHelper } from '@/shared/utils/notificationHelper';
import { OtpResponse } from '../types/auth.types';

// Vietnam phone number regex pattern
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

    /**
     * Validate phone number format
     */
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
                text2: 'Vui lòng thử lại',
            });
            return false;
        }

        return true;
    };

    /**
     * Handle phone input change - clear errors when user types
     */
    const handlePhoneChange = (text: string) => {
        setPhoneNumber(text);
        if (error) setError('');
        if (isUnregistered) setIsUnregistered(false);
        if (isUnverifiedAccount) setIsUnverifiedAccount(false);
    };

    /**
     * Handle login button press - request OTP
     */
    const handleLogin = async () => {
        setError('');
        setIsUnregistered(false);
        setIsUnverifiedAccount(false);

        if (!validatePhoneNumber(phoneNumber)) {
            return;
        }

        const rawPhone = phoneNumber.replace(/\s/g, '');
        setIsLoading(true);

        try {
            const response = await authApi.requestOtp(rawPhone);
            console.log('API Response requestOtp:', JSON.stringify(response, null, 2));

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
            const axiosError = err as {
                status?: number;
                response?: { status?: number; data?: OtpResponse };
                message?: string;
            };
            console.error('Login failed:', axiosError);

            const responseData = axiosError?.response?.data;

            // Handle 400 Bad Request which might contain Unverified info
            if (
                axiosError?.response?.status === 400 &&
                responseData?.data?.status === 'Unverified'
            ) {
                const otpCode = responseData.data?.otpCode || responseData.data?.testOtp;
                const message = responseData.data?.message;

                Toast.show({
                    type: 'error',
                    text1: 'Tài khoản chưa xác thực',
                    text2: message || 'Vui lòng nhập mã OTP để xác thực tài khoản.',
                    visibilityTime: 4000,
                });

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

            // Check for user not found error (404)
            if (
                axiosError?.status === 404 ||
                axiosError?.response?.status === 404 ||
                axiosError?.message?.includes('not found')
            ) {
                setIsUnregistered(true);
                setError('');
            } else {
                setError('Đã có lỗi xảy ra, vui lòng thử lại.');
                Toast.show({
                    type: 'error',
                    text1: 'Lỗi',
                    text2: 'Không thể gửi mã OTP. Vui lòng kiểm tra kết nối.',
                });
            }
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
            const axiosError = err as {
                response?: { data?: OtpResponse; status?: number };
                message?: string;
            };
            console.error('Verify now failed:', err);

            // Even if 400 or error, if we get data with OTP, we might want to allow verify?
            // But based on log "Request failed with status code 400", backend rejects maybe because pending?
            // If backend returns 400 but has data, we can try to use it.

            const responseData = axiosError?.response?.data;
            if (responseData && (responseData.success || responseData.data?.otpCode)) {
                const otpCode = responseData.data?.otpCode || responseData.data?.testOtp;
                if (otpCode) {
                    await notificationHelper.displayOtpNotification(String(otpCode));
                    navigation.navigate('Verify-otp', {
                        method: 'phone',
                        contact: rawPhone,
                        otpCode: String(otpCode),
                    });
                    return; // Success handling error case
                }
            }

            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: responseData?.data?.message || 'Không thể gửi mã OTP. Vui lòng thử lại.',
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
