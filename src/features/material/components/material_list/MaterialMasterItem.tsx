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
import { colors, spacing } from '@/styles';
import { IMaterial } from '@/features/material/types/material.types';
import { DetailRow } from '@/features/material/components/DetailRow';

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

                <View style={styles.bodyContainer}>
                    {/* Status Field */}
                    {showStatus && (
                        <DetailRow
                            label="Trạng thái:"
                            value={item.isActive ? 'Hoạt động' : 'Ngưng'}
                            valueStyle={{
                                color: item.isActive ? colors.green[600] : colors.red[500],
                            }}
                        />
                    )}

                    {/* Basic Info Row */}
                    <DetailRow label="Đơn vị tính:" value={item.unitName || item.unit} />
                    {!hideRemaining && <DetailRow label="Còn:" value={item.remaining} />}

                    {/* Expanded Content */}
                    {isExpanded && (
                        <View style={{ gap: 12, paddingBottom: alwaysExpanded ? 0 : 12 }}>
                            {!alwaysExpanded && <View style={styles.separatorCenter} />}
                            <DetailRow label="Loại vật tư:" value={item.type} />
                            <DetailRow label="Nhãn Hàng:" value={item.manufacturer} />
                            <DetailRow
                                label="Mô tả:"
                                value={item.usage}
                                bottomSheetTitle={item.name}
                                sheetLabel="Mô tả"
                            />

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
                            <Text style={styles.expandText}>
                                {isExpanded ? 'Thu gọn' : 'Xem thêm'}
                            </Text>
                            <Ionicons
                                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                                size={16}
                                color={colors.primary}
                            />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    },
    arePropsEqual
);

const styles = StyleSheet.create({
    container: {
        marginHorizontal: spacing.md,
        backgroundColor: colors.white,
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        paddingBottom: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
        gap: 4,
    },
    bodyContainer: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 16,
        gap: 12,
    },
    name: {
        fontSize: 14,
        fontWeight: '600',
        lineHeight: 20,
        color: colors.gray[950],
        flex: 1,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    infoText: {
        fontSize: 14,
        color: colors.gray[500],
        lineHeight: 20,
    },
    label: {
        fontWeight: '400',
        fontSize: 14,
        color: colors.gray[500],
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
    },
    detailLabel: {
        fontSize: 14,
        fontWeight: '400',
        color: colors.gray[500],
        lineHeight: 20,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.gray[950],
        lineHeight: 20,
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
    separatorCenter: {
        height: 1,
        backgroundColor: colors.borderLight,
        marginVertical: spacing.sm,
    },
});
