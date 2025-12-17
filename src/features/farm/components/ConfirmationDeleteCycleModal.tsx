import React from 'react';
// Đường dẫn import modal gốc
import { ConfirmationDeleteModal } from '@/shared/components/modal/ConfirmationDeleteModal';

interface Props {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationDeleteCycleModal: React.FC<Props> = ({
  visible,
  onConfirm,
  onCancel
}) => {
  return (
    <ConfirmationDeleteModal
      visible={visible}
      onConfirm={onConfirm}
      onCancel={onCancel}
      title="Xác nhận xoá chu kỳ nuôi"
      message="Bạn sẽ không thể truy cập lại chu kỳ đã xoá. Các vật tư đã xuất kho cho chu kỳ này sẽ có thể bị ảnh hưởng. Bạn có chắc chắn muốn xoá chu kỳ này không?"
      confirmText="Xóa chu kỳ"
      cancelText="Không"
    />
  );
};