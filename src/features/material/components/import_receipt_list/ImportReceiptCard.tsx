import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    LayoutAnimation,
    ActivityIndicator,
} from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { useAppTheme } from '@/styles/themeContext';
import { Colors, spacing, borderRadius } from '@/styles';
import { formatCurrency } from '@/features/material/utils/formatCurrency';
import { formatMaterialDateTime } from '@/features/material/utils/dateUtils';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ImportReceipt, ImportReceiptStatus } from '@/features/material/types/importReceipt.types';
import { MaterialGroup } from '@/features/material/components/MaterialTag';
import { MaterialGroupType } from '@/features/material/types/material.types';
import { useImportReceiptItems, useSuppliers } from '@/features/material/hooks';
import { ImportReceiptItems } from '@/features/material/components/import_receipt_list/ImportReceiptItems';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '@/app/navigation/AppStack';
import { Button } from '@/shared/components/buttons/Button';
import EditIcon from '@/assets/Icon/IconFarm/Edit.svg';
import { DetailRow } from '@/features/material/components/DetailRow';
import { ApproveImportReceiptBottomSheet } from '@/features/material/components/ApproveBottomSheet';

interface ImportReceiptCardProps {
    item: ImportReceipt;
    onApprove?: (id: string, code: string) => void;
    onReject?: (id: string, code: string) => void;
}

const arePropsEqual = (prevProps: ImportReceiptCardProps, nextProps: ImportReceiptCardProps) => {
    const { item: prevItem } = prevProps;
    const { item: nextItem } = nextProps;

    return (
        prevItem.id === nextItem.id &&
        prevItem.status === nextItem.status &&
        prevItem.totalAmount === nextItem.totalAmount &&
        prevItem.totalItems === nextItem.totalItems &&
        prevItem.editedAt === nextItem.editedAt &&
        prevItem.supplierName === nextItem.supplierName
    );
};

export const ImportReceiptCard = React.memo<ImportReceiptCardProps>(
    ({ item, onApprove, onReject }) => {
        const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
        const [isExpanded, setIsExpanded] = useState(false);

        const theme = useAppTheme();
        const styles = getStyles(theme);

        const { data: fetchedItems, isLoading: isFetchingItems } = useImportReceiptItems(
            isExpanded ? item.id : '',
            { PageSize: 1000 }
        );

        // Fetch suppliers to get supplier name from supplierId if not available
        const { data: suppliers = [] } = useSuppliers();

        const toggleExpand = () => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setIsExpanded(!isExpanded);
        };

        const getStatusLabel = (status?: ImportReceiptStatus | string): MaterialGroupType => {
            switch (status) {
                case ImportReceiptStatus.Draft:
                    return MaterialGroupType.DRAFT;
                case ImportReceiptStatus.Pending:
                    return MaterialGroupType.PENDING;
                case ImportReceiptStatus.Approved:
                    return MaterialGroupType.COMPLETED;
                case ImportReceiptStatus.Rejected:
                    return MaterialGroupType.REJECTED;
                default:
                    return (status as MaterialGroupType) || MaterialGroupType.DRAFT;
            }
        };

        const displayItems = fetchedItems?.items || [];

        // Get supplier name: use supplierName from API if available, otherwise lookup from suppliers list
        const supplierName =
            item.supplierName || suppliers.find(s => s.id === item.supplierId)?.name || '---';

        const [isApproveModalVisible, setIsApproveModalVisible] = React.useState(false);

        return (
            <View style={styles.card}>
                {/* Header Info */}
                <View style={styles.detailRow}>
                    <View style={styles.row}>
                        <Text style={styles.detailLabel}>Trạng thái:</Text>
                        <MaterialGroup group={getStatusLabel(item.status)} />
                    </View>
                    <DetailRow
                        label="Nhập kho:"
                        value={item.editedAt ? formatMaterialDateTime(item.editedAt) : '---'}
                    />
                    <DetailRow
                        label="Tạo phiếu:"
                        value={item.createdAt ? formatMaterialDateTime(item.createdAt) : '---'}
                    />
                    <DetailRow label="Tổng hàng hóa:" value={item.totalItems ?? '---'} />
                    <DetailRow
                        label="Tổng giá trị:"
                        value={formatCurrency(item.totalAmount ?? 0)}
                    />
                </View>
                {/* Edit Button (Only for Draft) */}
                {item.status === ImportReceiptStatus.Draft && (
                    <Button
                        title="Sửa thông tin"
                        variant="outline"
                        renderLeftIcon={<EditIcon />}
                        style={styles.editButton}
                        onPress={() => {
                            navigation.navigate('ImportReceiptFormScreen', {
                                importReceiptId: item.id,
                                availableMaterials: [],
                            });
                        }}
                    />
                )}

                {isExpanded && (
                    <DetailRow
                        label="Nhà cung cấp:"
                        value={supplierName}
                        style={styles.detailRowItem}
                    />
                )}

                {/* Expanded Details */}
                {isExpanded && (
                    <View style={styles.detailsContainer}>
                        {isFetchingItems ? (
                            <ActivityIndicator
                                size="small"
                                color={theme.primary}
                                style={{ margin: spacing.md }}
                            />
                        ) : (
                            <ImportReceiptItems materials={displayItems} />
                        )}
                    </View>
                )}

                {/* Expand Button */}
                <TouchableOpacity style={styles.expandButton} onPress={toggleExpand}>
                    <Text style={styles.expandText}>{isExpanded ? 'Thu gọn' : 'Xem thêm'}</Text>
                    <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={16}
                        color={theme.primary}
                    />
                </TouchableOpacity>

                {/* Pending Actions */}
                {item.status === ImportReceiptStatus.Pending && (
                    <View style={styles.actionButtonsRow}>
                        <Button
                            title="Từ chối"
                            variant="outline"
                            iconLeft="ban-outline"
                            style={styles.actionButton}
                            textStyle={{ fontWeight: '500', fontSize: 14 }}
                            onPress={() => {
                                setIsApproveModalVisible(true);
                            }}
                        />
                        <Button
                            title="Duyệt"
                            variant="outline"
                            iconLeft="checkmark-done"
                            style={styles.actionButton}
                            textStyle={{ fontWeight: '500', fontSize: 14 }}
                            onPress={() => {
                                setIsApproveModalVisible(true);
                            }}
                        />
                    </View>
                )}

                <ApproveImportReceiptBottomSheet
                    visible={isApproveModalVisible}
                    onClose={() => setIsApproveModalVisible(false)}
                    item={item}
                    onApprove={
                        onApprove ? () => onApprove(item.id, item.receiptCode || '') : undefined
                    }
                    onReject={
                        onReject ? () => onReject(item.id, item.receiptCode || '') : undefined
                    }
                />
            </View>
        );
    },
    arePropsEqual
);

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        card: {
            backgroundColor: theme.background,
            borderRadius: borderRadius.md,
            padding: spacing.md,
            marginBottom: spacing.sm,
            borderWidth: 1,
            borderColor: theme.border,
        },
        row: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        label: {
            fontSize: 14,
            color: theme.text,
            fontWeight: '600',
        },
        value: {
            fontSize: 14,
            color: theme.text,
            fontWeight: '400',
            maxWidth: '60%',
            textAlign: 'right',
        },
        divider: {
            height: 1,
            backgroundColor: theme.borderLight,
            marginVertical: spacing.sm,
        },
        expandButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: spacing.sm,
            gap: 4,
            marginTop: spacing.xs,
        },
        expandText: {
            fontSize: 14,
            color: theme.primary,
            fontWeight: '500',
        },
        detailsContainer: {
            backgroundColor: theme.background,
            marginTop: spacing.sm,
            paddingTop: spacing.xs,
        },
        editButton: {
            marginTop: 12,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: spacing.lg,
            alignSelf: 'stretch',
        },
        editButtonText: {
            fontSize: 14,
            color: theme.text,
            fontWeight: '400',
        },
        detailRow: {
            gap: 12,
        },
        detailRowItem: {
            marginVertical: 12,
        },
        detailLabel: {
            fontWeight: '400',
            fontSize: 14,
            color: theme.textSecondary,
            lineHeight: 20,
            flex: 1,
        },
        detailValue: {
            fontSize: 14,
            color: theme.text,
            fontWeight: '500',
        },
        actionButtonsRow: {
            flexDirection: 'row',
            gap: spacing.sm,
            marginTop: spacing.sm,
        },
        actionButton: {
            flex: 1,
            marginTop: 0,
            height: 44,
        },
    });
