import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    LayoutAnimation,
    Platform,
    ActivityIndicator,
    UIManager,
} from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { colors, spacing, borderRadius } from '@/styles';
import { formatCurrency } from '@/features/material/utils/formatCurrency';
import { formatMaterialDateTime } from '@/features/material/utils/dateUtils';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ImportReceipt, ImportReceiptStatus } from '@/features/material/types/importReceipt.types';
import { MaterialGroup } from '@/features/material/components/MaterialTag';
import { MaterialGroupType } from '@/features/material/types/material.types';
import { useImportReceiptItems } from '@/features/material/hooks/useImportReceipts';
import { useSuppliers } from '@/features/material/hooks/useSuppliers';
import { ImportReceiptItems } from '@/features/material/components/import_receipt_list/ImportReceiptItems';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '@/app/navigation/AppStack';
import { ButtonMaterialList } from '../material_form/ButtonMaterialList';
import EditIcon from '@/assets/Icon/IconFarm/Edit.svg';
import { DetailRow } from '@/features/material/components/DetailRow';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ImportReceiptCardProps {
    item: ImportReceipt;
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

export const ImportReceiptCard = React.memo<ImportReceiptCardProps>(({ item }) => {
    const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
    const [isExpanded, setIsExpanded] = useState(false);

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

    return (
        <View style={styles.card}>
            <View style={styles.cardContent}>
                {/* Header Info */}
                <View style={styles.detailRow}>
                    <View style={styles.row}>
                        <Text style={styles.detailLabel}>Trạng thái:</Text>
                        <MaterialGroup group={getStatusLabel(item.status)} />
                    </View>
                    <DetailRow
                        label="Nhập kho:"
                        value={item.createdAt ? formatMaterialDateTime(item.editedAt) : '---'}
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
                    <ButtonMaterialList
                        title="Sửa thông tin"
                        icon={<EditIcon />}
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
            </View>

            {/* Expanded Details */}
            {isExpanded && (
                <View style={styles.detailsContainer}>
                    {isFetchingItems ? (
                        <ActivityIndicator
                            size="small"
                            color={colors.primary}
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
                    color={colors.primary}
                />
            </TouchableOpacity>
        </View>
    );
}, arePropsEqual);

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        marginBottom: spacing.md,
        paddingBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
    },
    cardContent: {
        padding: spacing.md,
        paddingBottom: 0,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '600',
    },
    value: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '400',
        maxWidth: '60%',
        textAlign: 'right',
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: spacing.sm,
    },
    expandButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.sm,
        gap: 4,
    },
    expandText: {
        fontSize: 14,
        color: colors.primary,
        fontWeight: '500',
    },
    detailsContainer: {
        backgroundColor: colors.white,
    },
    editButton: {
        marginTop: spacing.sm,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        alignSelf: 'stretch',
    },
    editButtonText: {
        fontSize: 14,
        color: colors.text,
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
        color: colors.gray[500],
        lineHeight: 20,
        flex: 1,
    },
    detailValue: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '500',
    },
});
