import React, { useState } from 'react';
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
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '@/app/navigation/AppStack';
import { colors, spacing, borderRadius } from '@/styles';
import {
    IInventoryCheck,
    IInventoryCheckItem,
    InventoryCheckItem,
} from '@/features/material/types/inventoryCheck.types';
import { MaterialGroupType } from '@/features/material/types/material.types';
import { MaterialGroup } from '@/features/material/components/MaterialTag';
import { useInventoryItems } from '@/features/material/hooks/inventory';
import { DetailRow } from '../DetailRow';
import { ButtonMaterialList } from '../material_form/ButtonMaterialList';
import EditIcon from '@/assets/Icon/IconFarm/Edit.svg';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface InventoryCardProps {
    data: IInventoryCheck;
}

export const InventoryCard: React.FC<InventoryCardProps> = ({ data }) => {
    const navigation = useNavigation<NavigationProp>();
    const [isExpanded, setIsExpanded] = useState(false);

    // Fetch items only if expanded and no items in props
    const shouldFetch = isExpanded && (!data.items || data.items.length === 0);
    const { data: fetchedItems, isLoading: isFetchingItems } = useInventoryItems(
        shouldFetch ? data.id : undefined
    );

    const items = React.useMemo(() => fetchedItems || data.items || [], [fetchedItems, data.items]);

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsExpanded(!isExpanded);
    };

    const totalDifference = React.useMemo(() => {
        if (items.length > 0) {
            return items.reduce(
                (sum: number, item: any) => sum + (item.actualQty - item.expectedQty),
                0
            );
        }
        return data.varianceTotalItems || 0;
    }, [items, data.varianceTotalItems]);

    const getStatusLabel = (status: string): MaterialGroupType => {
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
                return MaterialGroupType.DRAFT;
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.col}>
                <DetailRow
                    label="Trạng thái:"
                    value={<MaterialGroup group={getStatusLabel(data.status)} />}
                />
                <DetailRow
                    label="Ngày Kiểm"
                    value={new Date(data.createdAt).toLocaleDateString('vi-VN')}
                />
                <DetailRow label="Ghi chú:" value={data.note} />
                <DetailRow label="Tổng chênh lệch:" value={totalDifference} />
            </View>
            {/* Edit Button (Only for Draft and Rejected) */}
            {['Draft', 'Rejected'].includes(data.status) && (
                <ButtonMaterialList
                    title="Sửa thông tin"
                    icon={<EditIcon />}
                    style={styles.editButton}
                    onPress={() => {
                        navigation.navigate('AddInventory', {
                            inventoryId: data.id,
                        });
                    }}
                />
            )}

            {isExpanded && (
                <View style={styles.expandedContainer}>
                    {isFetchingItems ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                    ) : items.length > 0 ? (
                        items.map((item: any) => (
                            <View
                                key={
                                    (item as InventoryCheckItem).id ||
                                    (item as IInventoryCheckItem).inventoryCheckItemId
                                }
                                style={styles.detailItemContainer}
                            >
                                <Text style={styles.materialName}>{item.materialName}</Text>

                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>
                                        Tồn kho trước khi điều chỉnh:
                                    </Text>
                                    <Text style={styles.detailValue}>{item.expectedQty}</Text>
                                </View>

                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>
                                        Tồn kho sau khi điều chỉnh:
                                    </Text>
                                    <Text style={styles.detailValue}>{item.actualQty}</Text>
                                </View>
                            </View>
                        ))
                    ) : (
                        <Text
                            style={{
                                textAlign: 'center',
                                color: colors.textSecondary,
                                marginBottom: spacing.sm,
                            }}
                        >
                            Không có chi tiết
                        </Text>
                    )}
                </View>
            )}

            <TouchableOpacity
                style={styles.toggleButton}
                onPress={toggleExpand}
                activeOpacity={0.7}
            >
                <Text style={styles.toggleText}>{isExpanded ? 'Thu gọn' : 'Xem thêm'}</Text>
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
    container: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginHorizontal: spacing.md,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.xs,
        alignItems: 'center',
    },
    col: {
        paddingBottom: 0,
        gap: 12,
    },
    alignRight: {
        alignItems: 'flex-end',
    },
    label: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '600',
    },
    value: {
        fontSize: 14,
        color: colors.text,
        textAlign: 'right',
    },
    noteRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.xs,
    },
    noteColumn: {
        marginBottom: spacing.xs,
    },
    noteTextInline: {
        maxWidth: '70%',
        fontSize: 14,
        color: colors.text,
        textAlign: 'right',
        flexWrap: 'wrap',
    },
    noteTextBlock: {
        marginTop: 4,
        fontSize: 14,
        color: colors.text,
        flexWrap: 'wrap',
        width: '100%',
    },
    noteTextMeasure: {
        position: 'absolute',
        opacity: 0,
        zIndex: -1,
        fontSize: 14,
        width: '70%',
    },
    separator: {
        marginTop: spacing.sm,
        height: 1,
        backgroundColor: colors.borderLight,
        marginHorizontal: -spacing.md,
    },
    colWithMargin: {
        marginTop: spacing.sm,
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
        color: colors.text,
        fontWeight: '400',
    },
    toggleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: spacing.sm,
        gap: 4,
        marginTop: spacing.xs,
    },
    toggleText: {
        fontSize: 14,
        color: colors.primary,
        fontWeight: '500',
    },
    expandedContainer: {
        marginTop: spacing.sm,
        borderTopWidth: 0,
        paddingTop: spacing.xs,
    },
    detailItemContainer: {
        borderRadius: borderRadius.sm,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.defaultBorder,
    },
    materialName: {
        fontSize: 14,
        color: colors.text,
        borderBottomWidth: 1,
        borderBottomColor: colors.defaultBorder,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        marginBottom: spacing.sm,
        fontWeight: '600',
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        marginBottom: spacing.sm,
    },
    detailLabel: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    detailValue: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '500',
    },
});
