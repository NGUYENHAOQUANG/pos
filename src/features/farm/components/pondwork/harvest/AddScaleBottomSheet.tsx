import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { AnimatedBottomSheet } from '@/shared/components/modal/AnimatedBottomSheet';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { spacing } from '@/styles';
import { ButtonBarFarm } from '@/features/farm/components/ButtonBarFarm';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAvailableScales } from '@/features/farm/hooks/useScales';
import { IScale } from '@/features/farm/types/scale.types';
import { EmptyStateCard } from '@/shared/components/ui/EmptyStateCard';

export interface AddScaleBottomSheetProps {
    visible: boolean;
    onClose: () => void;
    onAddScale?: (scaleIds: string[]) => void;
    zoneId?: string;
    isSubmitting?: boolean;
    pondName?: string;
}

export const AddScaleBottomSheet: React.FC<AddScaleBottomSheetProps> = ({
    visible,
    onClose,
    onAddScale,
    zoneId,
    isSubmitting = false,
    pondName,
}) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    const [selectedScaleIds, setSelectedScaleIds] = useState<string[]>([]);
    const { items: scales, isLoading } = useAvailableScales(zoneId);

    const handleAdd = () => {
        if (selectedScaleIds.length > 0 && onAddScale) {
            onAddScale(selectedScaleIds);
        }
    };

    const toggleScaleSelection = (id: string) => {
        setSelectedScaleIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const renderScaleItem = (scale: IScale) => {
        const disabled = scale.occupiedByUserId != null;
        const isSelected = selectedScaleIds.includes(scale.id);
        const displayUser = scale.occupiedByUserName || '--';

        return (
            <TouchableOpacity
                key={scale.id}
                style={[
                    styles.scaleItem,
                    isSelected && styles.scaleItemActive,
                    disabled && styles.scaleItemDisabled,
                ]}
                onPress={() => toggleScaleSelection(scale.id)}
                disabled={disabled}
            >
                <Image
                    source={require('@/assets/Icon/IconDevices/icon_weight_scale.png')}
                    style={styles.scaleItemImage}
                    resizeMode="contain"
                />
                <View style={styles.scaleItemInfo}>
                    <Text style={styles.scaleItemTitle}>
                        {scale.name} — {scale.zoneName}
                    </Text>
                    <Text style={styles.scaleItemSubtitle}>
                        {scale.code} · {scale.type}
                    </Text>
                    <Text style={styles.scaleItemSubtitleUser}>
                        Người sử dụng: <Text style={styles.scaleItemUserText}>{displayUser}</Text>
                    </Text>
                </View>
                <View
                    style={[
                        styles.checkbox,
                        isSelected && styles.checkboxActive,
                        disabled && styles.checkboxDisabled,
                    ]}
                >
                    {isSelected && <Ionicons name="checkmark" size={16} color={theme.white} />}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <AnimatedBottomSheet visible={visible} onClose={onClose}>
            <View style={styles.container}>
                <View style={styles.content}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Thêm cân</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={theme.textTertiary} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.contentContainer}>
                        {/* Subtitle */}
                        <Text style={styles.subtitle}>
                            Chọn cân kết nối {pondName ? `vào ${pondName}` : 'để sử dụng'}.{'\n'}
                            Cân đang bận có thể yêu cầu thu hồi.
                        </Text>

                        {/* List of Scales */}
                        <View style={styles.listContainer}>
                            {isLoading ? (
                                <ActivityIndicator
                                    size="small"
                                    color={theme.primary}
                                    style={styles.loader}
                                />
                            ) : scales.length === 0 ? (
                                <EmptyStateCard
                                    message="Không có thiết bị cân nào"
                                    style={{ marginTop: 24 }}
                                />
                            ) : (
                                scales.map(renderScaleItem)
                            )}
                        </View>
                    </View>
                </View>

                {/* Buttons */}
                <ButtonBarFarm
                    primaryTitle="Thêm cân"
                    onPrimaryPress={handleAdd}
                    primaryDisabled={selectedScaleIds.length === 0 || isSubmitting}
                    isLoading={isSubmitting}
                    style={styles.buttonBar}
                />
            </View>
        </AnimatedBottomSheet>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            backgroundColor: theme.background,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            overflow: 'hidden',
        },
        contentContainer: {
            gap: spacing.sm,
            paddingVertical: 12,
        },
        content: {
            paddingTop: spacing.lg,
            paddingHorizontal: spacing.md,
            paddingBottom: spacing.sm,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: spacing.sm,
        },
        headerTitle: {
            fontSize: 20,
            fontWeight: '600',
            color: theme.text,
        },
        closeButton: {
            padding: 4,
        },
        subtitle: {
            fontSize: 15,
            color: theme.textSecondary,
            lineHeight: 22,
        },
        listContainer: {
            gap: spacing.sm,
        },
        scaleItem: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: spacing.sm,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.defaultBorder,
            backgroundColor: theme.background,
        },
        scaleItemActive: {
            borderColor: theme.primary,
        },
        scaleItemImage: {
            width: 48,
            height: 48,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.defaultBorder,
            marginRight: spacing.sm,
        },
        scaleItemInfo: {
            flex: 1,
            gap: 2,
        },
        scaleItemTitle: {
            fontSize: 14,
            fontWeight: '500',
            color: theme.text,
        },
        scaleItemSubtitle: {
            fontSize: 12,
            fontWeight: '400',
            color: theme.textSecondary,
        },
        scaleItemSubtitleUser: {
            fontSize: 12,
            fontWeight: '400',
            color: theme.textSecondary,
        },
        scaleItemUserText: {
            fontWeight: '500',
            fontSize: 12,
            color: theme.text,
        },
        scaleItemDisabled: {
            opacity: 0.5,
        },
        checkbox: {
            width: 24,
            height: 24,
            borderRadius: 6,
            borderWidth: 2,
            borderColor: theme.defaultBorder,
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: spacing.sm,
            backgroundColor: theme.background,
        },
        checkboxActive: {
            borderColor: theme.primary,
            backgroundColor: theme.primary,
        },
        checkboxDisabled: {
            borderColor: theme.defaultBorder,
            backgroundColor: theme.backgroundSecondary,
            borderWidth: 0,
        },
        buttonBar: {
            borderTopWidth: 0,
            paddingTop: spacing.sm,
        },
        loader: {
            paddingVertical: spacing.lg,
        },
        emptyText: {
            fontSize: 14,
            color: theme.textSecondary,
            textAlign: 'center',
            paddingVertical: spacing.lg,
        },
    });
