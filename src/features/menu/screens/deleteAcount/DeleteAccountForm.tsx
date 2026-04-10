import React from 'react';
import { View, StyleSheet } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { HeaderSection } from '@/shared/components/layout/HeaderSection';
import { DeleteAccountInputStep } from '@/features/menu/components/delete-account/DeleteAccountInputStep';
import { DeleteAccountOtpStep } from '@/features/menu/components/delete-account/DeleteAccountOtpStep';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { ConfirmationModalUI } from '@/shared/components/modal/ConfirmationModalUI';

interface DeleteAccountFormProps {
    step: number;
    phone: string;
    currentUserPhone?: string;
    otpError: string;
    showConfirmModal: boolean;
    onBack: () => void;
    onNextStep: (phone: string, reasons: string[], otherReason: string) => void;
    onVerifyOtp: (otp: string) => void;
    onCancelOtp: () => void;
    onResendOtp: () => void;
    onCancelDelete: () => void;
    onConfirmDelete: () => void;
}

export const DeleteAccountForm: React.FC<DeleteAccountFormProps> = ({
    step,
    phone,
    currentUserPhone,
    otpError,
    showConfirmModal,
    onBack,
    onNextStep,
    onVerifyOtp,
    onCancelOtp,
    onResendOtp,
    onCancelDelete,
    onConfirmDelete,
}) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    return (
        <KeyboardAvoidingView behavior="padding" style={styles.container}>
            <HeaderSection title="Xoá tài khoản" onBack={onBack} />

            <View style={styles.content}>
                {step === 1 ? (
                    <DeleteAccountInputStep
                        onNext={onNextStep}
                        currentUserPhone={currentUserPhone}
                    />
                ) : (
                    <DeleteAccountOtpStep
                        phoneNumber={phone}
                        onVerify={onVerifyOtp}
                        onCancel={onCancelOtp}
                        onResend={onResendOtp}
                        error={otpError}
                    />
                )}
            </View>

            <ConfirmationModalUI
                visible={showConfirmModal}
                title="Xác nhận xoá tài khoản"
                message={
                    'Nếu xoá tài khoản, toàn bộ dữ liệu sẽ bị xoá và không thể khôi phục lại.\nBạn có chắc chắn muốn xoá?'
                }
                confirmText="Xoá"
                cancelText="Ngừng Xoá Tài Khoản"
                onCancel={onCancelDelete}
                onConfirm={onConfirmDelete}
                showSuccessToast={false}
            />
        </KeyboardAvoidingView>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.backgroundPrimary,
        },
        content: {
            flex: 1,
        },
    });
