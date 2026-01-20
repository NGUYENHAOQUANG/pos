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
import { MaterialGroup } from './MaterialGroup';
import { ButtonMaterialList } from './ButtonMaterialList';
import { colors, spacing, borderRadius } from '@/styles';
import { IMaterial } from '../../types/material.types';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface MaterialListProps {
    item: IMaterial;
    onEdit?: (item: IMaterial) => void;
    onHistoryPress?: (item: IMaterial) => void;
    onAdjustmentPress?: (item: IMaterial) => void;
}

export const MaterialList: React.FC<MaterialListProps> = ({
    item,
    onEdit,
    onHistoryPress,
    onAdjustmentPress,
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsExpanded(!isExpanded);
    };

    return (
        <View style={styles.container}>
            {/* Header Row */}
            <View style={styles.headerRow}>
                <Text style={styles.name}>{item.name}</Text>
                <MaterialGroup group={item.group} />
            </View>

            <View style={styles.separator} />

            {/* Basic Info Row */}
            <View style={styles.infoRow}>
                <Text style={styles.infoText}>
                    <Text style={styles.label}>Đơn vị tính: </Text>
                    {item.unitName || item.unit}
                </Text>
                <Text style={styles.infoText}>
                    <Text style={styles.label}>Còn: </Text>
                    {item.remaining}
                </Text>
            </View>

            {/* Expanded Content */}
            {isExpanded && (
                <View>
                    <View style={styles.separatorCenter} />
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Loại vật tư: </Text>
                        <Text style={styles.detailValue}>{item.type || '---'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailValue}>
                            <Text style={styles.detailLabel}>Nhãn Hàng: </Text>
                            {item.manufacturer || '---'}
                        </Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailValue}>
                            <Text style={styles.detailLabel}>Mô tả:</Text> {item.usage || '---'}
                        </Text>
                    </View>
                    {/* Commented out - Đơn vị sử dụng và Liều dùng */}
                    {/* <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Đơn vị sử dụng: </Text>
                        <Text style={styles.detailValue}>{item.unitOfUse || '---'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Liều dùng: </Text>
                        <Text style={styles.detailValue}>{item.dosage || '---'}</Text>
                    </View> */}

                    {/* Edit Button */}
                    <ButtonMaterialList
                        title="Sửa thông tin"
                        onPress={() => onEdit?.(item)}
                        style={styles.editButton}
                    />
                </View>
            )}

            {/* Expand Toggle */}
            <TouchableOpacity
                style={styles.expandToggle}
                onPress={toggleExpand}
                activeOpacity={0.7}
            >
                <Text style={styles.expandText}>{isExpanded ? 'Thu gọn' : 'Xem thêm'}</Text>
                <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={colors.primary}
                />
            </TouchableOpacity>

            <View style={styles.separator} />

            {/* Action Buttons */}
            <View style={styles.actionRow}>
                <ButtonMaterialList
                    title="Lịch sử nhập kho"
                    onPress={() => onHistoryPress?.(item)}
                    style={styles.actionButton}
                />
                <View style={styles.spacer} />
                <ButtonMaterialList
                    title="Điều chỉnh tồn kho"
                    onPress={() => onAdjustmentPress?.(item)}
                    style={styles.actionButton}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: spacing.md,
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        marginBottom: spacing.md,
        padding: spacing.md,
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
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.md,
    },
    name: {
        fontSize: 18,
        color: colors.text,
        flex: 1,
        marginRight: spacing.sm,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: spacing.sm,
    },
    infoText: {
        fontSize: 14,
        color: colors.text,
    },
    label: {
        fontWeight: '600',
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: spacing.xs,
        flexWrap: 'wrap',
        marginTop: spacing.sm,
    },
    detailLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
    },
    detailValue: {
        fontSize: 14,
        color: colors.text,
        flex: 1,
    },
    editButton: {
        marginTop: spacing.sm,
    },
    expandToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: spacing.sm,
    },
    expandText: {
        fontSize: 14,
        color: colors.primary,
        marginRight: 4,
        fontWeight: '600',
    },
    actionRow: {
        flexDirection: 'row',
        marginTop: spacing.md,
    },
    actionButton: {
        flex: 1,
    },
    spacer: {
        width: spacing.md,
    },
    separator: {
        height: 1,
        backgroundColor: colors.borderLight,
        marginHorizontal: -spacing.md,
    },
    separatorCenter: {
        height: 1,
        backgroundColor: colors.borderLight,
    },
});
