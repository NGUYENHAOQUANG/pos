import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    LayoutAnimation,
    Platform,
    UIManager,
    ActivityIndicator,
} from 'react-native';
import { colors, spacing, borderRadius } from '@/styles';
import { formatCurrency } from '@/features/material/utils/formatCurrency';
import { formatMaterialDateTime } from '@/features/material/utils/dateUtils';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '@/app/navigation/AppStack';
import { MaterialGroupType } from '@/features/material/types/material.types';
import { ExportWarehouseReceiptItems } from '@/features/material/components/export_warehouse_list/ExportWarehouseReceiptItems';
import { MaterialGroup } from '@/features/material/components/MaterialTag';
import { ExportReceipt, ExportReceiptItem } from '@/features/material/types/exportReceipt.types';
import { useExportReceiptItems } from '@/features/material/hooks/exportReceipt/useExportReceiptItems';
import { DetailRow } from '../DetailRow';
import { ButtonMaterialList } from '../material_form/ButtonMaterialList';
import EditIcon from '@/assets/Icon/IconFarm/Edit.svg';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ExportWarehouseReceiptCardProps {
    item: ExportReceipt;
}

export const ExportWarehouseReceiptCard: React.FC<ExportWarehouseReceiptCardProps> = ({ item }) => {
    const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
    const [isExpanded, setIsExpanded] = useState(false);

    const shouldFetch = isExpanded && (!item.materials || item.materials.length === 0);
    const { data: fetchedItems, isLoading: isFetchingItems } = useExportReceiptItems(
        shouldFetch ? item.id : undefined
    );

    const isMaterialsArray = (materials: any): materials is ExportReceiptItem[] => {
        return (
            Array.isArray(materials) &&
            materials.length > 0 &&
            (typeof materials[0].costPrice === 'number' ||
                typeof materials[0].quantity === 'number')
        );
    };

    const finalItems = useMemo(
        () =>
            item.materials && isMaterialsArray(item.materials)
                ? item.materials
                : fetchedItems || [],
        [item.materials, fetchedItems]
    );

    // Calculate total from items if main total is missing
    const calculatedTotal = useMemo(() => {
        if (!finalItems || finalItems.length === 0) return 0;
        return finalItems.reduce((sum: number, curr: ExportReceiptItem) => {
            const itemTotal = curr.totalAmount || (curr.quantity || 0) * (curr.costPrice || 0);
            return sum + (itemTotal || 0);
        }, 0);
    }, [finalItems]);

    const displayTotalAmount =
        item.totalAmount && item.totalAmount > 0 ? item.totalAmount : calculatedTotal;

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsExpanded(!isExpanded);
    };

    const getStatusLabel = (status?: string): MaterialGroupType => {
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
    };

    return (
        <View style={styles.card}>
            <View style={styles.cardContent}>
                {/* Header Info */}
                <View style={styles.row}>
                    <Text style={styles.label}>Trạng thái:</Text>
                    <MaterialGroup group={getStatusLabel(item.status)} />
                </View>
                <View style={styles.detailRow}>
                    <DetailRow
                        label="Xuất kho:"
                        value={formatMaterialDateTime(item.createdAt || '')}
                    />
                    <DetailRow
                        label="Tạo phiếu:"
                        value={formatMaterialDateTime(item.createdAt || '')}
                    />
                    <DetailRow
                        label="Tổng hàng hoá:"
                        value={item.totalItems ?? finalItems.length}
                    />
                    <DetailRow
                        label="Tổng giá trị:"
                        value={formatCurrency(displayTotalAmount || 0)}
                    />
                </View>

                {/* Farm Info - Visible when Expanded */}
                {isExpanded && (
                    <View style={styles.row}>
                        <DetailRow
                            label="Ao yêu cầu:"
                            value={item.pondName || item.warehouseName || '---'}
                            style={{ marginTop: 12 }}
                        />
                    </View>
                )}

                {/* Edit Button (Only for Draft or if status is undefined/Draft-like) */}
                {(item.status === 'Draft' || !item.status) && (
                    <ButtonMaterialList
                        title="Sửa thông tin"
                        icon={<EditIcon />}
                        style={styles.editButton}
                        onPress={() => {
                            navigation.navigate('ExportWarehouseForm', {
                                exportReceiptId: item.id,
                                availableMaterials: [],
                            });
                        }}
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
                        <ExportWarehouseReceiptItems materials={finalItems} />
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
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        marginBottom: spacing.md,
        overflow: 'hidden',
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
        marginBottom: 12,
    },
    label: {
        fontSize: 14,
        color: colors.text,
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
    detailRow: {
        gap: 12,
    },
});
