import React, { useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { AnimatedBottomSheet } from '@/shared/components/modal/AnimatedBottomSheet';
import { ConfirmationModalUI } from '@/shared/components/modal/ConfirmationModalUI';
import { Button } from '@/shared/components/buttons/Button';
import { MaterialGroup } from '@/features/material/components/MaterialTag';
import { EmptyStateCard } from '@/shared/components/ui/EmptyStateCard';
import { DetailRow } from '@/features/material/components/DetailRow';
import { useImportReceiptItems, useSuppliers } from '@/features/material/hooks';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppTheme } from '@/styles/themeContext';
import { Colors, spacing } from '@/styles';
import { formatMaterialDateTime } from '@/features/material/utils/dateUtils';
import { formatCurrency } from '@/features/material/utils/formatCurrency';
import { MaterialGroupType } from '@/features/material/types/material.types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    useImportReceiptDetail,
    useApproveImportReceipt,
    useRejectImportReceipt,
} from '@/features/material/hooks/useImportReceipts';

export interface ApproveImportReceiptBottomSheetProps {
    visible: boolean;
    onClose: () => void;
    id: string;
}

export const ApproveImportReceiptBottomSheet: React.FC<ApproveImportReceiptBottomSheetProps> = ({
    visible,
    onClose,
    id,
}) => {
    const theme = useAppTheme();
    const insets = useSafeAreaInsets();
    const styles = getStyles(theme, insets.bottom);

    const { data: item, isLoading, isError } = useImportReceiptDetail(visible ? id : '');
    const { data: importItemsData, isLoading: isFetchingItems } = useImportReceiptItems(
        visible && item?.id ? item.id : '',
        { PageSize: 1000 }
    );
    const { data: suppliers = [] } = useSuppliers();

    const approveMutation = useApproveImportReceipt();
    const rejectMutation = useRejectImportReceipt();

    const [confirmMeta, setConfirmMeta] = React.useState<{
        visible: boolean;
        type: 'approve' | 'reject' | null;
    }>({ visible: false, type: null });

    const closeConfirm = React.useCallback(
        () => setConfirmMeta({ visible: false, type: null }),
        []
    );
    const handleOpenConfirmApprove = React.useCallback(
        () => setConfirmMeta({ visible: true, type: 'approve' }),
        []
    );
    const handleOpenConfirmReject = React.useCallback(
        () => setConfirmMeta({ visible: true, type: 'reject' }),
        []
    );

    const materials = React.useMemo(() => importItemsData?.items || [], [importItemsData?.items]);

    const getStatusLabel = React.useCallback((status?: string): MaterialGroupType => {
        switch (status) {
            case 'Draft':
                return MaterialGroupType.DRAFT;
            case 'Pending':
                return MaterialGroupType.PENDING;
            case 'Approved':
                return MaterialGroupType.COMPLETED;
            case 'Rejected':
                return MaterialGroupType.REJECTED;
            default:
                return (status as MaterialGroupType) || MaterialGroupType.DRAFT;
        }
    }, []);

    const handleReject = React.useCallback(() => {
        if (!item) return;
        const code = item.receiptCode || '';
        rejectMutation.mutate({ id, code }, { onSuccess: onClose });
    }, [item, id, rejectMutation, onClose]);

    const handleApprove = React.useCallback(() => {
        if (!item) return;
        const code = item.receiptCode || '';
        approveMutation.mutate({ id, code }, { onSuccess: onClose });
    }, [item, id, approveMutation, onClose]);

    const onExecuteConfirm = React.useCallback(() => {
        closeConfirm();
        setTimeout(() => {
            if (confirmMeta.type === 'approve') handleApprove();
            else if (confirmMeta.type === 'reject') handleReject();
        }, 300);
    }, [confirmMeta.type, handleApprove, handleReject, closeConfirm]);

    const renderTableColumn = useCallback(
        (
            headerText: string,
            data: any[],
            renderCell: (item: any) => React.ReactNode,
            align: 'flex-start' | 'center' | 'flex-end' = 'flex-start',
            flexGrow?: number
        ) => (
            <View style={[styles.columnView, flexGrow ? { flexGrow } : undefined]}>
                <View style={[styles.tableHeaderCellContainer, { alignItems: align }]}>
                    <Text style={styles.tableHeaderCell}>{headerText}</Text>
                </View>
                {data.map((rowItem, idx) => (
                    <View
                        key={rowItem.id || idx}
                        style={[
                            styles.tableCellContainer,
                            { alignItems: align },
                            idx === data.length - 1 && { borderBottomWidth: 0 },
                        ]}
                    >
                        {renderCell(rowItem)}
                    </View>
                ))}
            </View>
        ),
        [
            styles.columnView,
            styles.tableHeaderCellContainer,
            styles.tableHeaderCell,
            styles.tableCellContainer,
        ]
    );

    const renderTableContent = useCallback(
        () => (
            <View style={styles.tableInner}>
                {renderTableColumn(
                    'Vật tư',
                    materials,
                    mat => (
                        <Text style={[styles.tableCell, styles.materialNameText]} numberOfLines={1}>
                            {mat.materialName}
                        </Text>
                    ),
                    'flex-start',
                    1
                )}
                {renderTableColumn(
                    'SL',
                    materials,
                    mat => (
                        <Text style={[styles.tableCell, styles.quantityText]} numberOfLines={1}>
                            {mat.quantity}
                        </Text>
                    ),
                    'center'
                )}
                {renderTableColumn(
                    'ĐVT',
                    materials,
                    mat => (
                        <Text style={[styles.tableCell, styles.unitText]} numberOfLines={1}>
                            {mat.unitName || '---'}
                        </Text>
                    ),
                    'center'
                )}
                {renderTableColumn(
                    'Đơn giá',
                    materials,
                    mat => (
                        <Text style={[styles.tableCell, styles.priceText]} numberOfLines={1}>
                            {formatCurrency(mat.unitPrice ?? 0)}
                        </Text>
                    ),
                    'flex-end'
                )}
                {renderTableColumn(
                    'Thành tiền',
                    materials,
                    mat => (
                        <Text style={[styles.tableCell, styles.priceText]} numberOfLines={1}>
                            {formatCurrency(mat.totalPrice ?? 0)}
                        </Text>
                    ),
                    'flex-end'
                )}
            </View>
        ),
        [
            materials,
            renderTableColumn,
            styles.tableInner,
            styles.tableCell,
            styles.materialNameText,
            styles.quantityText,
            styles.unitText,
            styles.priceText,
        ]
    );

    if (isLoading) {
        return (
            <AnimatedBottomSheet visible={visible} onClose={onClose}>
                <View
                    style={[
                        styles.container,
                        { justifyContent: 'center', alignItems: 'center', height: 200 },
                    ]}
                >
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            </AnimatedBottomSheet>
        );
    }

    if (isError || !item) {
        return (
            <AnimatedBottomSheet visible={visible} onClose={onClose}>
                <View
                    style={[
                        styles.container,
                        { justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
                    ]}
                >
                    <EmptyStateCard
                        message="Không tìm thấy thông tin phiếu"
                        description="Phiếu này có thể đã bị xóa hoặc không tồn tại."
                    />
                    <Button
                        title="Đóng"
                        onPress={onClose}
                        style={{ marginTop: spacing.lg, minWidth: 120 }}
                        variant="outline"
                    />
                </View>
            </AnimatedBottomSheet>
        );
    }

    const supplierName =
        item.supplierName || suppliers.find((s: any) => s.id === item.supplierId)?.name || '---';

    return (
        <AnimatedBottomSheet visible={visible} onClose={onClose}>
            <View style={styles.container}>
                <View style={[styles.header, styles.contentPadding]}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.title}>{item.receiptCode || '---'}</Text>
                        <MaterialGroup group={getStatusLabel(item.status)} />
                    </View>
                    <TouchableOpacity
                        onPress={onClose}
                        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                    >
                        <Ionicons name="close" size={24} color={theme.textSecondary} />
                    </TouchableOpacity>
                </View>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={[styles.content, styles.contentPadding]}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.infoSection}>
                        <DetailRow label="Loại phiếu:" value="Phiếu nhập kho" />
                        <DetailRow label="Người tạo:" value={item.creator?.fullname || '---'} />
                        <DetailRow label="Kho nhập:" value={supplierName} />
                        <DetailRow
                            label="Ngày tạo:"
                            value={item.createdAt ? formatMaterialDateTime(item.createdAt) : '---'}
                        />
                        <DetailRow label="Ghi chú:" value={item.notes || '---'} />
                    </View>

                    <View style={styles.tableContainer}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            bounces={false}
                            overScrollMode="never"
                        >
                            {isFetchingItems ? (
                                <View style={styles.tableInner}>
                                    <ActivityIndicator
                                        size="small"
                                        color={theme.primary}
                                        style={{ margin: spacing.lg }}
                                    />
                                </View>
                            ) : materials.length > 0 ? (
                                renderTableContent()
                            ) : (
                                <View
                                    style={[
                                        styles.tableInner,
                                        { justifyContent: 'center', paddingVertical: spacing.xl },
                                    ]}
                                >
                                    <EmptyStateCard message="Không có vật tư nào" />
                                </View>
                            )}
                        </ScrollView>
                    </View>
                </ScrollView>

                {item.status?.toLowerCase() !== 'approved' &&
                    item.status?.toLowerCase() !== 'rejected' && (
                        <View style={styles.footer}>
                            <Button
                                title="Từ chối"
                                variant="outline"
                                iconLeft="ban-outline"
                                style={styles.actionButton}
                                textStyle={{ fontWeight: '500', fontSize: 14 }}
                                onPress={handleOpenConfirmReject}
                            />
                            <Button
                                title="Duyệt"
                                variant="outline"
                                iconLeft="checkmark-done"
                                style={styles.actionButton}
                                textStyle={{ fontWeight: '500', fontSize: 14 }}
                                onPress={handleOpenConfirmApprove}
                            />
                        </View>
                    )}
            </View>

            <ConfirmationModalUI
                visible={confirmMeta.visible}
                title={
                    confirmMeta.type === 'approve'
                        ? `Duyệt phiếu ${item.receiptCode || ''}?`
                        : 'Từ chối phiếu'
                }
                message={
                    confirmMeta.type === 'approve'
                        ? 'Tồn kho sẽ được cập nhật ngay sau khi duyệt. Hành động không thể hoàn tác.'
                        : 'Bạn có chắc muốn từ chối phiếu này?\nHành động không thể hoàn tác.'
                }
                confirmText={confirmMeta.type === 'approve' ? 'Xác nhận duyệt' : 'Xác nhận từ chối'}
                cancelText="Hủy"
                onConfirm={onExecuteConfirm}
                onCancel={closeConfirm}
                showSuccessToast={false}
            />
        </AnimatedBottomSheet>
    );
};

const getStyles = (theme: Colors, bottomInset: number) =>
    StyleSheet.create({
        container: { paddingBottom: Math.max(bottomInset, spacing.md), maxHeight: '100%' },
        contentPadding: { paddingHorizontal: spacing.md },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: 'transparent',
        },
        headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
        title: { fontSize: 18, fontWeight: '700', color: theme.text },
        scrollView: { flexGrow: 0 },
        content: { paddingBottom: spacing.lg },
        infoSection: { gap: 12, paddingVertical: spacing.md },
        tableContainer: {
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: 12,
            marginTop: spacing.sm,
            overflow: 'hidden',
        },
        tableInner: { flexDirection: 'row', minWidth: '100%' },
        columnView: { flexDirection: 'column' },
        tableHeaderCellContainer: {
            paddingVertical: 10,
            paddingHorizontal: spacing.md,
            backgroundColor: theme.backgroundSecondary,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
            height: 44,
            justifyContent: 'center',
        },
        tableCellContainer: {
            paddingVertical: 12,
            paddingHorizontal: spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: theme.backgroundSecondary,
            height: 48,
            justifyContent: 'center',
        },
        tableHeaderCell: {
            fontSize: 16,
            fontWeight: '500',
            lineHeight: 20,
            color: theme.textSecondary,
        },
        tableCell: { fontSize: 14 },
        materialNameText: { fontWeight: '500', fontSize: 14, lineHeight: 20, color: theme.text },
        quantityText: { fontWeight: '400', color: theme.textSecondary },
        unitText: { fontWeight: '400', color: theme.textSecondary },
        priceText: { fontWeight: '500', fontSize: 14, color: theme.textSecondary },
        footer: {
            flexDirection: 'row',
            gap: spacing.sm,
            paddingTop: spacing.md,
            paddingHorizontal: spacing.md,
            borderTopWidth: 1,
            borderTopColor: theme.borderLight,
            marginTop: spacing.sm,
        },
        actionButton: { flex: 1, height: 44 },
    });
