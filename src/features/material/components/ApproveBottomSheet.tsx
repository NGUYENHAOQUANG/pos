import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { AnimatedBottomSheet } from '@/shared/components/modal/AnimatedBottomSheet';
import { ConfirmationModalUI } from '@/shared/components/modal/ConfirmationModalUI';
import { Button } from '@/shared/components/buttons/Button';
import { MaterialGroup } from '@/features/material/components/MaterialTag';
import { EmptyStateCard } from '@/shared/components/ui/EmptyStateCard';
import { DetailRow } from '@/features/material/components/DetailRow';
import {
    useImportReceiptItems,
    useExportReceiptItems,
    useInventoryItems,
    useSuppliers,
} from '@/features/material/hooks';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppTheme } from '@/styles/themeContext';
import { Colors, spacing } from '@/styles';
import { formatMaterialDateTime } from '@/features/material/utils/dateUtils';
import { formatCurrency } from '@/features/material/utils/formatCurrency';
import { MaterialGroupType } from '@/features/material/types/material.types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export enum ReceiptType {
    Import = 'import',
    Export = 'export',
    Inventory = 'inventory',
}

export const ApproveImportReceiptBottomSheet: React.FC<
    Omit<ApproveBottomSheetProps, 'type'>
> = props => {
    return <ApproveBottomSheet {...props} type={ReceiptType.Import} />;
};

export const ApproveExportReceiptBottomSheet: React.FC<
    Omit<ApproveBottomSheetProps, 'type'>
> = props => {
    return <ApproveBottomSheet {...props} type={ReceiptType.Export} />;
};

export const ApproveInventoryReceiptBottomSheet: React.FC<
    Omit<ApproveBottomSheetProps, 'type'>
> = props => {
    return <ApproveBottomSheet {...props} type={ReceiptType.Inventory} />;
};

export interface ApproveBottomSheetProps {
    visible: boolean;
    onClose: () => void;
    item: any;
    type: ReceiptType;
    onApprove?: () => void;
    onReject?: () => void;
}

export const ApproveBottomSheet: React.FC<ApproveBottomSheetProps> = ({
    visible,
    onClose,
    item,
    type,
    onApprove,
    onReject,
}) => {
    const theme = useAppTheme();
    const insets = useSafeAreaInsets();
    const styles = getStyles(theme, insets.bottom);

    const { data: importItemsData, isLoading: isFetchingImport } = useImportReceiptItems(
        visible && type === ReceiptType.Import ? item.id : '',
        { PageSize: 1000 }
    );

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
    const { data: exportItems, isLoading: isFetchingExport } = useExportReceiptItems(
        visible && type === ReceiptType.Export ? item.id : '',
        { PageSize: 1000 }
    );
    const { data: inventoryItems, isLoading: isFetchingInventory } = useInventoryItems(
        visible && type === ReceiptType.Inventory ? item.id : '',
        { PageSize: 1000 }
    );

    const { data: suppliers = [] } = useSuppliers();

    const isFetchingItems =
        type === ReceiptType.Import
            ? isFetchingImport
            : type === ReceiptType.Export
            ? isFetchingExport
            : isFetchingInventory;

    const materials = React.useMemo(() => {
        return (
            (type === ReceiptType.Import
                ? importItemsData?.items
                : type === ReceiptType.Export
                ? exportItems
                : inventoryItems) || []
        );
    }, [type, importItemsData?.items, exportItems, inventoryItems]);

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
        onClose();
        setTimeout(() => {
            if (onReject) onReject();
        }, 300);
    }, [onReject, onClose]);

    const handleApprove = React.useCallback(() => {
        onClose();
        setTimeout(() => {
            if (onApprove) onApprove();
        }, 300);
    }, [onApprove, onClose]);

    const onExecuteConfirm = React.useCallback(() => {
        closeConfirm();
        setTimeout(() => {
            if (confirmMeta.type === 'approve') {
                handleApprove();
            } else if (confirmMeta.type === 'reject') {
                handleReject();
            }
        }, 300);
    }, [confirmMeta.type, handleApprove, handleReject, closeConfirm]);

    const receiptCode = type === ReceiptType.Inventory ? item.checkCode : item.receiptCode;
    const typeLabel =
        type === ReceiptType.Import
            ? 'Phiếu nhập kho'
            : type === ReceiptType.Export
            ? 'Phiếu xuất kho'
            : 'Phiếu kiểm kê';

    const supplierName =
        item.supplierName || suppliers.find(s => s.id === item.supplierId)?.name || '---';
    const locationLabel =
        type === ReceiptType.Import
            ? 'Kho nhập:'
            : type === ReceiptType.Export
            ? 'Kho xuất:'
            : 'Kho kiểm kê:';
    const locationValue =
        type === ReceiptType.Import ? supplierName : item.warehouseName || item.pondName || '---';

    const renderTableColumn = React.useCallback(
        (
            headerText: string,
            data: any[],
            renderCell: (item: any) => React.ReactNode,
            align: 'flex-start' | 'center' | 'flex-end' = 'flex-start',
            flexGrow?: number
        ) => {
            return (
                <View style={[styles.columnView, flexGrow ? { flexGrow } : undefined]}>
                    <View style={[styles.tableHeaderCellContainer, { alignItems: align }]}>
                        <Text style={styles.tableHeaderCell}>{headerText}</Text>
                    </View>
                    {data.map((item, idx) => (
                        <View
                            key={item.id || item.inventoryCheckItemId || idx}
                            style={[
                                styles.tableCellContainer,
                                { alignItems: align },
                                idx === data.length - 1 && { borderBottomWidth: 0 },
                            ]}
                        >
                            {renderCell(item)}
                        </View>
                    ))}
                </View>
            );
        },
        [
            styles.columnView,
            styles.tableHeaderCellContainer,
            styles.tableHeaderCell,
            styles.tableCellContainer,
        ]
    );

    const renderTableContent = React.useCallback(() => {
        switch (type) {
            case ReceiptType.Import:
            case ReceiptType.Export:
                return (
                    <View style={styles.tableInner}>
                        {renderTableColumn(
                            'Vật tư',
                            materials,
                            mat => (
                                <Text
                                    style={[styles.tableCell, styles.materialNameText]}
                                    numberOfLines={1}
                                >
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
                                <Text
                                    style={[styles.tableCell, styles.quantityText]}
                                    numberOfLines={1}
                                >
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
                                <Text
                                    style={[styles.tableCell, styles.priceText]}
                                    numberOfLines={1}
                                >
                                    {formatCurrency(mat.unitPrice ?? mat.costPrice ?? 0)}
                                </Text>
                            ),
                            'flex-end'
                        )}
                        {renderTableColumn(
                            'Thành tiền',
                            materials,
                            mat => (
                                <Text
                                    style={[styles.tableCell, styles.priceText]}
                                    numberOfLines={1}
                                >
                                    {formatCurrency(mat.totalPrice ?? mat.totalAmount ?? 0)}
                                </Text>
                            ),
                            'flex-end'
                        )}
                    </View>
                );
            case ReceiptType.Inventory:
                return (
                    <View style={styles.tableInner}>
                        {renderTableColumn(
                            'Vật tư',
                            materials,
                            mat => (
                                <Text
                                    style={[styles.tableCell, styles.materialNameText]}
                                    numberOfLines={1}
                                >
                                    {mat.materialName}
                                </Text>
                            ),
                            'flex-start',
                            1
                        )}
                        {renderTableColumn(
                            'Sổ sách',
                            materials,
                            mat => (
                                <Text
                                    style={[styles.tableCell, styles.quantityText]}
                                    numberOfLines={1}
                                >
                                    {mat.expectedQty}
                                </Text>
                            ),
                            'center'
                        )}
                        {renderTableColumn(
                            'Thực tế',
                            materials,
                            mat => (
                                <Text
                                    style={[styles.tableCell, styles.quantityText]}
                                    numberOfLines={1}
                                >
                                    {mat.actualQty}
                                </Text>
                            ),
                            'center'
                        )}
                        {renderTableColumn(
                            'Chênh lệch',
                            materials,
                            mat => (
                                <Text
                                    style={[
                                        styles.tableCell,
                                        styles.quantityText,
                                        {
                                            color:
                                                mat.difference < 0
                                                    ? theme.error
                                                    : mat.difference > 0
                                                    ? theme.success
                                                    : theme.textSecondary,
                                        },
                                    ]}
                                    numberOfLines={1}
                                >
                                    {mat.difference > 0 ? `+${mat.difference}` : mat.difference}
                                </Text>
                            ),
                            'flex-end'
                        )}
                    </View>
                );
            default:
                return null;
        }
    }, [
        type,
        materials,
        renderTableColumn,
        styles.tableInner,
        styles.tableCell,
        styles.materialNameText,
        styles.quantityText,
        styles.unitText,
        styles.priceText,
        theme.error,
        theme.success,
        theme.textSecondary,
    ]);

    return (
        <AnimatedBottomSheet visible={visible} onClose={onClose}>
            <View style={styles.container}>
                {/* Header */}
                <View style={[styles.header, styles.contentPadding]}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.title}>{receiptCode || '---'}</Text>
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
                    {/* Info Rows */}
                    <View style={styles.infoSection}>
                        <DetailRow label="Loại phiếu:" value={typeLabel} />
                        <DetailRow label="Người tạo:" value={item.creator?.fullname || '---'} />
                        <DetailRow label={locationLabel} value={locationValue} />
                        <DetailRow
                            label="Ngày tạo:"
                            value={item.createdAt ? formatMaterialDateTime(item.createdAt) : '---'}
                        />
                        <DetailRow label="Ghi chú:" value={item.notes || item.note || '---'} />
                    </View>

                    {/* Table */}
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

                {/* Footer Buttons */}
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
            </View>

            <ConfirmationModalUI
                visible={confirmMeta.visible}
                title={
                    confirmMeta.type === 'approve'
                        ? `Duyệt phiếu ${receiptCode || ''}?`
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
        container: {
            paddingBottom: Math.max(bottomInset, spacing.md),
            maxHeight: '100%',
        },
        contentPadding: {
            paddingHorizontal: spacing.md,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: 'transparent',
        },
        headerLeft: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
        },
        title: {
            fontSize: 18,
            fontWeight: '700',
            color: theme.text,
        },
        scrollView: {
            flexGrow: 0,
        },
        content: {
            paddingBottom: spacing.lg,
        },
        infoSection: {
            gap: 12,
            paddingVertical: spacing.md,
        },
        tableContainer: {
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: 12,
            marginTop: spacing.sm,
            overflow: 'hidden',
        },
        tableInner: {
            flexDirection: 'row',
            minWidth: '100%',
        },
        columnView: {
            flexDirection: 'column',
        },
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
        tableCell: {
            fontSize: 14,
        },
        materialNameText: {
            fontWeight: '500',
            fontSize: 14,
            lineHeight: 20,
            color: theme.text,
        },
        quantityText: {
            fontWeight: '400',
            color: theme.textSecondary,
        },
        unitText: {
            fontWeight: '400',
            color: theme.textSecondary,
        },
        priceText: {
            fontWeight: '500',
            fontSize: 14,
            color: theme.textSecondary,
        },
        emptyText: {
            fontSize: 14,
            color: theme.textSecondary,
            textAlign: 'center',
            padding: spacing.lg,
            fontStyle: 'italic',
        },
        footer: {
            flexDirection: 'row',
            gap: spacing.sm,
            paddingTop: spacing.md,
            paddingHorizontal: spacing.md,
            borderTopWidth: 1,
            borderTopColor: theme.borderLight,
            marginTop: spacing.sm,
        },
        actionButton: {
            flex: 1,
            height: 44,
        },
    });
