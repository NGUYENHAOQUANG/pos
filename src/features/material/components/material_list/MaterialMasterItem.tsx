import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, LayoutAnimation } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { MaterialGroup } from '@/features/material/components/MaterialTag';
import { ButtonMaterialList } from '@/features/material/components/material_form/ButtonMaterialList';
import { useAppTheme } from '@/styles/themeContext';
import { Colors, spacing } from '@/styles';
import { IMaterial } from '@/features/material/types/material.types';
import { DetailRow } from '@/features/material/components/DetailRow';

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

        const theme = useAppTheme();
        const styles = getStyles(theme);

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
                                color: item.isActive ? theme.success : theme.error,
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
                                label="Chú thích:"
                                value={item.usage}
                                bottomSheetTitle={item.name}
                                sheetLabel="Chú thích"
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
                                color={theme.primary}
                            />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    },
    arePropsEqual
);

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            marginHorizontal: spacing.md,
            backgroundColor: theme.background,
            borderRadius: 12,
            marginBottom: 8,
            borderWidth: 1,
            borderColor: theme.border,
        },
        headerRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: 12,
            paddingBottom: 12,
            paddingHorizontal: 16,
            borderBottomWidth: 1,
            borderBottomColor: theme.borderLight,
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
            color: theme.text,
            flex: 1,
        },
        infoRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
        infoText: {
            fontSize: 14,
            color: theme.textSecondary,
            lineHeight: 20,
        },
        label: {
            fontWeight: '400',
            fontSize: 14,
            color: theme.textSecondary,
        },
        detailRow: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
        },
        detailLabel: {
            fontSize: 14,
            fontWeight: '400',
            color: theme.textSecondary,
            lineHeight: 20,
        },
        detailValue: {
            fontSize: 14,
            fontWeight: '500',
            color: theme.text,
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
            color: theme.primary,
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
            backgroundColor: theme.borderLight,
            marginVertical: spacing.sm,
        },
    });
