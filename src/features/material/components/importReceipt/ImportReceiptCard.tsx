import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    LayoutAnimation,
    Platform,
    ActivityIndicator,
    UIManager,
} from 'react-native';
import { colors, spacing, borderRadius } from '@/styles';
import { formatCurrency } from '@/features/material/utils/formatCurrency';
import { formatMaterialDateTime } from '@/features/material/utils/dateUtils';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ImportReceipt, ImportReceiptStatus } from '@/features/material/types/importReceipt.types';
import { MaterialGroup } from '@/features/material/components/material/MaterialGroup';
import { MaterialGroupType } from '@/features/material/types/material.types';
import { useImportReceiptItems } from '@/features/material/hooks/useImportReceipts';
import { useSuppliers } from '@/features/material/hooks/useSuppliers';
import { ImportReceiptItems } from '@/features/material/components/importReceipt/ImportReceiptItems';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '@/app/navigation/AppStack';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ImportReceiptCardProps {
    item: ImportReceipt;
}

export const ImportReceiptCard: React.FC<ImportReceiptCardProps> = ({ item }) => {
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
                <View style={styles.row}>
                    <Text style={styles.label}>Trạng thái:</Text>
                    <MaterialGroup group={getStatusLabel(item.status)} />
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Nhập kho:</Text>
                    <Text style={styles.value}>
                        {item.createdAt ? formatMaterialDateTime(item.editedAt) : '---'}
                    </Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Tạo phiếu:</Text>
                    <Text style={styles.value}>
                        {item.createdAt ? formatMaterialDateTime(item.createdAt) : '---'}
                    </Text>
                </View>

                <View style={styles.divider} />

                {/* Summary Info */}
                <View style={styles.row}>
                    <Text style={styles.label}>Tổng hàng hóa:</Text>
                    <Text style={styles.value}>{item.totalItems ?? '---'}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Tổng giá trị:</Text>
                    <Text style={styles.value}>{formatCurrency(item.totalAmount || 0)}</Text>
                </View>

                {/* Supplier Info - Visible when Expanded */}
                {isExpanded && (
                    <View style={styles.row}>
                        <Text style={styles.label}>Nhà cung cấp:</Text>
                        <Text style={styles.value}>{supplierName}</Text>
                    </View>
                )}

                {/* Edit Button (Only for Draft) */}
                {item.status === ImportReceiptStatus.Draft && (
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => {
                            navigation.navigate('AddWarehouse', {
                                availableMaterials: [],
                                importReceiptId: item.id,
                            });
                        }}
                    >
                        <Text style={styles.editButtonText}>Sửa thông tin</Text>
                    </TouchableOpacity>
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
};

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
        marginBottom: spacing.xs,
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
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.sm,
        paddingVertical: 8,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.white,
    },
    editButtonText: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '400',
    },
});
