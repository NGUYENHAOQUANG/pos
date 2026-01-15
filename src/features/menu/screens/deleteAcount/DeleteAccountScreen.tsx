import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { HeaderSection } from '@/shared/components/layout/HeaderSection';
import { DeleteAccountInputStep } from '../../components/delete-account/DeleteAccountInputStep';
import { DeleteAccountOtpStep } from '../../components/delete-account/DeleteAccountOtpStep';
import Toast from 'react-native-toast-message';
import { colors } from '@/styles';
import { useAuthStore } from '@/features/auth/store/authStore';

import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import { notificationHelper } from '@/shared/utils/notificationHelper';
import { Storage } from '@/core/services/storage.service';

export const DeleteAccountScreen = () => {
    const navigation = useNavigation();
    const [step, setStep] = useState(1);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [deleteReason, setDeleteReason] = useState('');
    const [serverOtp, setServerOtp] = useState<string | null>(null);
    const [otpError, setOtpError] = useState('');

    const { logout, user } = useAuthStore();

    const handleInputNext = async (phone: string, reason: string) => {
        if (!phone || !reason) return;
        setPhoneNumber(phone);
        setDeleteReason(reason);

        try {
            const response = await apiClient.post(API_ENDPOINTS.AUTH.REQUEST_OTP, {
                phoneNumber: phone,
            });

            const otpCode =
                response.data?.testOtp ||
                response.data?.data?.testOtp ||
                response.data?.data?.otpCode ||
                response.data?.otpCode;

            if (otpCode) {
                setServerOtp(String(otpCode));
                notificationHelper.displayOtpNotification(String(otpCode));
            } else {
                setServerOtp(null);
            }

            Toast.show({ type: 'success', text1: 'Mã xác nhận đã được gửi' });
            setStep(2);
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: error.response?.data?.message || 'Không thể gửi mã xác nhận',
            });
        }
    };

    const handleOtpVerify = (otp: string) => {
        if (otp.length < 4) {
            Toast.show({ type: 'error', text1: 'Vui lòng nhập đủ 4 số OTP' });
            return;
        }

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
            await apiClient.delete(API_ENDPOINTS.AUTH.DELETE_ACCOUNT, {
                data: {
                    phoneNumber,
                    reason: deleteReason,
                    otpCode: otpCode,
                },
            });

            Toast.show({ type: 'success', text1: 'Đã xóa tài khoản thành công' });

            await Storage.setItem('SKIP_ONBOARDING', 'true');

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
        navigation.goBack();
    };

    const handleResendOtp = async () => {
        setOtpError('');
        try {
            const response = await apiClient.post(API_ENDPOINTS.AUTH.REQUEST_OTP, { phoneNumber });

            const otpCode =
                response.data?.testOtp ||
                response.data?.data?.testOtp ||
                response.data?.data?.otpCode ||
                response.data?.otpCode;

            if (otpCode) {
                setServerOtp(String(otpCode));
                notificationHelper.displayOtpNotification(String(otpCode));
            } else {
                setServerOtp(null);
            }

            Toast.show({ type: 'success', text1: 'Đã gửi lại mã' });
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: error.response?.data?.message || 'Gửi lại mã thất bại',
            });
        }
    };

    return (
        <View style={styles.container}>
            <HeaderSection
                title="Xoá tài khoản"
                onBack={() => (step === 1 ? navigation.goBack() : setStep(1))}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={{ flex: 1 }}>
                        {step === 1 ? (
                            <DeleteAccountInputStep
                                onNext={handleInputNext}
                                currentUserPhone={user?.phone}
                            />
                        ) : (
                            <DeleteAccountOtpStep
                                phoneNumber={phoneNumber}
                                onVerify={handleOtpVerify}
                                onCancel={handleStopDelete}
                                onResend={handleResendOtp}
                                error={otpError}
                            />
                        )}
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>

            <Modal visible={showConfirmModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContentRow}>
                            <View style={styles.iconContainer}>
                                <Text style={styles.iconText}>!</Text>
                            </View>

                            <View style={styles.textContainer}>
                                <Text style={styles.modalTitle}>Xác nhận xoá tài khoản</Text>
                                <Text style={styles.modalContent}>
                                    Nếu xoá tài khoản, toàn bộ dữ liệu sẽ bị xoá và không thể khôi
                                    phục lại.
                                    {'\n'}Bạn có chắc chắn muốn xoá?
                                </Text>
                            </View>
                        </View>

                        <View style={styles.modalButtonRow}>
                            <TouchableOpacity
                                style={styles.modalCancelButton}
                                onPress={handleCancelDelete}
                            >
                                <Text style={styles.modalCancelText}>Ngừng Xoá Tài Khoản</Text>
                            </TouchableOpacity>

                            <View style={{ width: 12 }} />

                            <TouchableOpacity
                                style={styles.modalDeleteButton}
                                onPress={handleConfirmDelete}
                            >
                                <Text style={styles.modalDeleteText}>Xoá</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: colors.overlay,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        backgroundColor: colors.white,
        borderRadius: 8,
        padding: 24,
        width: '100%',
        maxWidth: 360,
    },
    modalContentRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    iconContainer: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: colors.warning,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 2,
    },
    iconText: {
        color: colors.white,
        fontWeight: 'bold',
        fontSize: 14,
        lineHeight: 16,
    },
    textContainer: {
        flex: 1,
        marginLeft: 12,
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 8,
        textAlign: 'left',
    },
    modalContent: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'left',
        lineHeight: 22,
    },
    modalButtonRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        width: '100%',
    },
    modalCancelButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: colors.borderDark,
        borderRadius: 4,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalCancelText: {
        color: colors.text,
        fontSize: 14,
        fontWeight: '400',
    },
    modalDeleteButton: {
        paddingVertical: 8,
        paddingHorizontal: 20,
        backgroundColor: colors.red[900],
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalDeleteText: {
        color: colors.white,
        fontSize: 14,
        fontWeight: '600',
    },
});
