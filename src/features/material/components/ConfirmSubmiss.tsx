import React from 'react';
import { ConfirmationModalUI } from '@/shared/components/modal/ConfirmationModalUI';

interface ConfirmSubmissProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
}

export const ConfirmSubmiss: React.FC<ConfirmSubmissProps> = ({
    visible,
    onClose,
    onConfirm,
    title = 'Xác Nhận Gửi Phiếu',
    message = 'Bạn có chắc chắn muốn gửi?',
}) => {
    return (
        <ConfirmationModalUI
            visible={visible}
            onCancel={onClose}
            onConfirm={onConfirm}
            title={title}
            message={message}
            confirmText="Đồng ý"
            cancelText="Không"
            showSuccessToast={false}
        />
    );
};
