import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    LayoutAnimation,
    Platform,
    UIManager,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius } from '@/styles';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export interface InventoryDetailItem {
    id: string;
    materialName: string;
    beforeQuantity: number;
    afterQuantity: number;
}

export interface InventoryTicket {
    id: string;
    checkerName: string;
    date: string;
    note: string;
    totalDifference: number;
    items: InventoryDetailItem[];
}

interface InventoryCardProps {
    data: InventoryTicket;
}

export const InventoryCard: React.FC<InventoryCardProps> = ({ data }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLongNote, setIsLongNote] = useState(false);

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsExpanded(!isExpanded);
    };

    return (
        <View style={styles.container}>
            <View style={styles.col}>
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
                    <Text style={styles.value}>{data.totalDifference}</Text>
                </View>
            </View>

            {isExpanded && (
                <View style={styles.expandedContainer}>
                    {data.items.map(item => (
                        <View key={item.id} style={styles.detailItemContainer}>
                            <Text style={styles.materialName}>{item.materialName}</Text>

                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>
                                    Tồn kho trước khi điều chỉnh:
                                </Text>
                                <Text style={styles.detailValue}>{item.beforeQuantity}</Text>
                            </View>

                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Tồn kho sau khi điều chỉnh:</Text>
                                <Text style={styles.detailValue}>{item.afterQuantity}</Text>
                            </View>
                        </View>
                    ))}
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
        alignItems: 'flex-start',
    },
    col: {
        flex: 1,
        gap: spacing.xs,
    },
    alignRight: {
        alignItems: 'flex-end',
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.text,
    },
    value: {
        fontSize: 14,
        color: colors.text,
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
    toggleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.md,
        paddingVertical: spacing.xs,
    },
    toggleText: {
        fontSize: 14,
        color: colors.primary,
        marginRight: 4,
    },
    expandedContainer: {
        marginTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.borderLight,
        paddingTop: spacing.md,
    },
    detailItemContainer: {
        borderRadius: borderRadius.sm,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    materialName: {
        fontSize: 14,
        color: colors.text,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
        padding: spacing.sm,
        marginBottom: spacing.sm,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.sm,
        marginBottom: spacing.sm,
    },
    detailLabel: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '700',
    },
    detailValue: {
        fontSize: 13,
        color: colors.text,
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
});
