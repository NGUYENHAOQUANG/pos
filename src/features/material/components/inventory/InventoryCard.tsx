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
    IInventoryTicket,
    IInventoryTicketItem,
    MaterialGroupType,
} from '@/features/material/types/material.types';
import { MaterialGroup } from '@/features/material/components/material/MaterialGroup';
import { inventoryApi } from '@/features/material/api/inventoryApi';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface InventoryCardProps {
    data: IInventoryTicket;
}

export const InventoryCard: React.FC<InventoryCardProps> = ({ data }) => {
    const navigation = useNavigation<NavigationProp>();
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLongNote, setIsLongNote] = useState(false);
    const [items, setItems] = useState<IInventoryTicketItem[]>(data.items || []);
    const [isLoading, setIsLoading] = useState(false);

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsExpanded(!isExpanded);
    };

    const [hasFetched, setHasFetched] = useState(false);

    // Reset hasFetched when data changes (e.g., after update)
    // Reset hasFetched when data changes (e.g., after update)
    React.useEffect(() => {
        if (data.items && data.items.length > 0) {
            setItems(data.items);
            setHasFetched(true);
        } else {
            setHasFetched(false);
            setItems([]);
        }
    }, [data.id, data.status, data.items]);

    React.useEffect(() => {
        if (!hasFetched && data.id && (!data.items || data.items.length === 0)) {
            const fetchDetails = async () => {
                setIsLoading(true);
                try {
                    const response = await inventoryApi.getDetail(data.id);
                    if (response.success && response.data?.items) {
                        const mappedItems: IInventoryTicketItem[] = response.data.items.map(
                            item => ({
                                id: item.inventoryCheckItemId,
                                materialName: item.materialName || item.materialCode || 'N/A',
                                beforeQuantity: item.expectedQty,
                                afterQuantity: item.actualQty,
                            })
                        );
                        setItems(mappedItems);
                    }
                } catch (error) {
                    console.error('Failed to fetch inventory details:', error);
                } finally {
                    setIsLoading(false);
                    setHasFetched(true);
                }
            };
            fetchDetails();
        }
    }, [hasFetched, data.id, data.items]);

    const totalDifference = React.useMemo(() => {
        if (items.length > 0) {
            return items.reduce((sum, item) => sum + (item.afterQuantity - item.beforeQuantity), 0);
        }
        return data.totalDifference;
    }, [items, data.totalDifference]);

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
                <View style={styles.row}>
                    <Text style={styles.label}>Trạng thái:</Text>
                    <MaterialGroup group={getStatusLabel(data.status)} />
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Người kiểm:</Text>
                    <Text style={styles.value}>{data.checkerName}</Text>
                </View>
                <View style={[styles.row, styles.alignRight]}>
                    <Text style={styles.label}>Ngày Kiểm</Text>
                    <Text style={styles.value}>{data.date}</Text>
                </View>
            </View>

            <View style={styles.separator} />

            <View style={[styles.col, styles.colWithMargin]}>
                <Text
                    style={styles.noteTextMeasure}
                    onTextLayout={e => {
                        setIsLongNote(e.nativeEvent.lines.length > 1);
                    }}
                >
                    {data.note}
                </Text>

                {!isLongNote ? (
                    <View style={styles.noteRow}>
                        <Text style={styles.label}>Ghi chú</Text>
                        <Text style={styles.noteTextInline}>{data.note}</Text>
                    </View>
                ) : (
                    <View style={styles.noteColumn}>
                        <Text style={styles.label}>Ghi chú</Text>
                        <Text style={styles.noteTextBlock}>{data.note}</Text>
                    </View>
                )}

                <View style={[styles.row, styles.alignRight]}>
                    <Text style={styles.label}>Tổng chênh lệch:</Text>
                    <Text style={styles.value}>{totalDifference}</Text>
                </View>
            </View>

            {/* Edit Button (Only for Draft) */}
            {data.status === 'Draft' && (
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => {
                        navigation.navigate('AddInventory', { inventoryId: data.id });
                    }}
                >
                    <Text style={styles.editButtonText}>Sửa thông tin</Text>
                </TouchableOpacity>
            )}

            {isExpanded && (
                <View style={styles.expandedContainer}>
                    {isLoading ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                    ) : items.length > 0 ? (
                        items.map(item => (
                            <View key={item.id} style={styles.detailItemContainer}>
                                <Text style={styles.materialName}>{item.materialName}</Text>

                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>
                                        Tồn kho trước khi điều chỉnh:
                                    </Text>
                                    <Text style={styles.detailValue}>{item.beforeQuantity}</Text>
                                </View>

                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>
                                        Tồn kho sau khi điều chỉnh:
                                    </Text>
                                    <Text style={styles.detailValue}>{item.afterQuantity}</Text>
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
        ...Platform.select({
            ios: {
                shadowColor: colors.shadow,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.xs,
        alignItems: 'center',
    },
    col: {
        paddingBottom: 0,
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
        marginTop: spacing.sm,
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
