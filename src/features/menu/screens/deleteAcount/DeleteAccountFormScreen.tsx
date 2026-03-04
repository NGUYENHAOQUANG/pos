import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/authStore';
import { notificationHelper } from '@/shared/utils/notificationHelper';
import { Storage } from '@/core/services/storage.service';
import { authApi } from '@/features/auth/api/authApi';
import { DeleteAccountForm } from './DeleteAccountForm';

export const DeleteAccountFormScreen = () => {
    const navigation = useNavigation();
    const [step, setStep] = useState(1);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
    const [otherReasonNote, setOtherReasonNote] = useState('');
    const [serverOtp, setServerOtp] = useState<string | null>(null);
    const [otpError, setOtpError] = useState('');

    const { logout, user } = useAuthStore();
    const queryClient = useQueryClient();

    const handleInputNext = async (phone: string, reasons: string[], otherReason: string) => {
        if (!phone) return;
        setPhoneNumber(phone);
        setSelectedReasons(reasons);
        setOtherReasonNote(otherReason);

        try {
            const response = await authApi.requestOtp(phone);
            const otpCodeResponse = response.data?.testOtp || response.data?.otpCode;

            if (otpCodeResponse) {
                setServerOtp(String(otpCodeResponse));
                notificationHelper.displayOtpNotification(String(otpCodeResponse));
            } else {
                setServerOtp(null);
            }

            Toast.show({ type: 'success', text1: 'Mã xác nhận đã được gửi' });
            setStep(2);
        } catch (err: any) {
            // Check if backend returned 400 but still has pending OTP data
            const responseData = err?.response?.data || err?.data;
            const otpCode = responseData?.data?.otpCode || responseData?.data?.testOtp;

            if (otpCode) {
                setServerOtp(String(otpCode));
                notificationHelper.displayOtpNotification(String(otpCode));
                Toast.show({ type: 'success', text1: 'Mã xác nhận (đang chờ) đã được gửi lại' });
                setStep(2);
                return;
            }

            Toast.show({
                type: 'error',
                text1: responseData?.message || err?.message || 'Không thể gửi mã xác nhận',
            });
        }
    };

    const handleOtpVerify = (otp: string) => {
        if (serverOtp && otp !== serverOtp) {
            setOtpError('Mã xác thực không chính xác');
            return;
        }

        setOtpCode(otp);
        setShowConfirmModal(true);
    };

    const handleConfirmDelete = async () => {
        setShowConfirmModal(false);
        try {
            await authApi.deleteAccount({
                phoneNumber,
                selectedReasons,
                otherReasonNote,
                otpCode,
            });

            Toast.show({ type: 'success', text1: 'Đã xóa tài khoản thành công' });

            await Storage.setItem('SKIP_ONBOARDING', 'true');

            queryClient.clear();
            logout();
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: error.response?.data?.message || 'Xóa tài khoản thất bại',
            });
        }
    };

    const handleCancelDelete = () => {
        setShowConfirmModal(false);
    };

    const handleStopDelete = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        }
    };

    const handleResendOtp = async () => {
        setOtpError('');
        try {
            const response = await authApi.requestOtp(phoneNumber);
            const otpCodeResponse = response.data?.testOtp || response.data?.otpCode;

            if (otpCodeResponse) {
                setServerOtp(String(otpCodeResponse));
                notificationHelper.displayOtpNotification(String(otpCodeResponse));
            } else {
                setServerOtp(null);
            }

            Toast.show({ type: 'success', text1: 'Đã gửi lại mã' });
        } catch (err: any) {
            const responseData = err?.response?.data || err?.data;
            const otpCode = responseData?.data?.otpCode || responseData?.data?.testOtp;

            if (otpCode) {
                setServerOtp(String(otpCode));
                notificationHelper.displayOtpNotification(String(otpCode));
                Toast.show({ type: 'success', text1: 'Mã xác nhận (đang chờ) đã được gửi lại' });
                return;
            }

            Toast.show({
                type: 'error',
                text1: responseData?.message || err?.message || 'Gửi lại mã thất bại',
            });
        }
    };

    const handleBack = () => {
        if (step === 1) {
            if (navigation.canGoBack()) {
                navigation.goBack();
            }
        } else {
            setStep(1);
        }
    };

    return (
        <DeleteAccountForm
            step={step}
            phone={phoneNumber}
            currentUserPhone={user?.phone}
            otpError={otpError}
            showConfirmModal={showConfirmModal}
            onBack={handleBack}
            onNextStep={handleInputNext}
            onVerifyOtp={handleOtpVerify}
            onCancelOtp={handleStopDelete}
            onResendOtp={handleResendOtp}
            onCancelDelete={handleCancelDelete}
            onConfirmDelete={handleConfirmDelete}
        />
    );
};

export default DeleteAccountFormScreen;
