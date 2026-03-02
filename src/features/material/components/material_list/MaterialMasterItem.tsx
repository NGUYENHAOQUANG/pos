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
import { MaterialGroup } from '@/features/material/components/MaterialTag';
import { ButtonMaterialList } from '@/features/material/components/material_form/ButtonMaterialList';
import { colors, spacing, borderRadius } from '@/styles';
import { IMaterial } from '@/features/material/types/material.types';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface MaterialMasterItemProps {
    item: IMaterial;
    onEdit?: (item: IMaterial) => void;
    hideRemaining?: boolean;
    alwaysExpanded?: boolean;
    showStatus?: boolean;
}

const arePropsEqual = (prevProps: MaterialMasterItemProps, nextProps: MaterialMasterItemProps) => {
    const { item: prevItem } = prevProps;
    const { item: nextItem } = nextProps;

    return (
        prevItem.id === nextItem.id &&
        prevItem.name === nextItem.name &&
        prevItem.remaining === nextItem.remaining &&
        prevItem.isActive === nextItem.isActive &&
        prevItem.group === nextItem.group &&
        prevItem.unitName === nextItem.unitName &&
        prevItem.unit === nextItem.unit &&
        prevItem.type === nextItem.type &&
        prevItem.manufacturer === nextItem.manufacturer &&
        prevItem.usage === nextItem.usage &&
        prevProps.hideRemaining === nextProps.hideRemaining &&
        prevProps.alwaysExpanded === nextProps.alwaysExpanded &&
        prevProps.showStatus === nextProps.showStatus
    );
};

export const MaterialMasterItem = React.memo<MaterialMasterItemProps>(
    ({ item, onEdit, hideRemaining, alwaysExpanded, showStatus }) => {
        const [isExpanded, setIsExpanded] = useState(alwaysExpanded || false);

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

                {/* Status Field */}
                {showStatus && (
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Trạng thái: </Text>
                        <Text
                            style={[
                                styles.detailValue,
                                { color: item.isActive ? colors.green[600] : colors.red[500] },
                            ]}
                        >
                            {item.isActive ? 'Hoạt động' : 'Ngưng'}
                        </Text>
                    </View>
                )}

                {/* Basic Info Row */}
                <View style={styles.infoRow}>
                    <Text style={styles.infoText}>
                        <Text style={styles.label}>Đơn vị tính: </Text>
                        {item.unitName || item.unit}
                    </Text>
                    {!hideRemaining && (
                        <Text style={styles.infoText}>
                            <Text style={styles.label}>Còn: </Text>
                            {item.remaining}
                        </Text>
                    )}
                </View>

                {/* Expanded Content */}
                {isExpanded && (
                    <View>
                        {!alwaysExpanded && <View style={styles.separatorCenter} />}
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

                        {/* Edit Button */}
                        {onEdit && (
                            <ButtonMaterialList
                                title="Sửa thông tin"
                                onPress={() => onEdit(item)}
                                style={styles.editButton}
                            />
                        )}
                    </View>
                )}

                {/* Expand Toggle */}
                {!alwaysExpanded && (
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
                )}

                {!alwaysExpanded && <View style={styles.separator} />}
            </View>
        );
    },
    arePropsEqual
);

const styles = StyleSheet.create({
    container: {
        marginHorizontal: spacing.md,
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        marginBottom: spacing.md,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
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
        marginVertical: 6,
    },
    infoText: {
        fontSize: 14,
        color: colors.text,
    },
    label: {
        fontWeight: '600',
        fontSize: 14,
    },
    detailRow: {
        flexDirection: 'row',
        marginVertical: 6,
        flexWrap: 'wrap',
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
        marginVertical: spacing.xs,
    },
    separatorCenter: {
        height: 1,
        backgroundColor: colors.borderLight,
        marginVertical: spacing.sm,
    },
});
