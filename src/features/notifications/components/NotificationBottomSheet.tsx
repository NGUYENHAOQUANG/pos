import React from 'react';
import { INotificationPayload } from '../types/notification.types';
import { NotificationScreen } from '../constants/notification.constants';
import { ApproveExportReceiptBottomSheet } from '@/features/material/components/export_warehouse_list/ApproveExportReceiptBottomSheet';
import { ApproveImportReceiptBottomSheet } from '@/features/material/components/import_receipt_list/ApproveImportReceiptBottomSheet';
import { ApproveInventoryReceiptBottomSheet } from '@/features/material/components/inventory_list/ApproveInventoryReceiptBottomSheet';

export interface NotificationApproveBottomSheetProps {
    payload: INotificationPayload | null;
    onClose: () => void;
}

export const NotificationBottomSheet: React.FC<NotificationApproveBottomSheetProps> = ({
    payload,
    onClose,
}) => {
    const visible = !!payload;
    const isExport = payload?.screen === NotificationScreen.ExportApprove;
    const isImport = payload?.screen === NotificationScreen.ImportApprove;
    const isInventory = payload?.screen === NotificationScreen.InventoryApprove;
    const id = payload?.id || '';

    if (!visible || !id) return null;

    if (isExport) {
        return <ApproveExportReceiptBottomSheet visible={visible} onClose={onClose} id={id} />;
    }

    if (isImport) {
        return <ApproveImportReceiptBottomSheet visible={visible} onClose={onClose} id={id} />;
    }

    if (isInventory) {
        return <ApproveInventoryReceiptBottomSheet visible={visible} onClose={onClose} id={id} />;
    }

    return null;
};
