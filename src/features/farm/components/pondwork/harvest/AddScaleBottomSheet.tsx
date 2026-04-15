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

export interface AddScaleBottomSheetProps {
    visible: boolean;
    onClose: () => void;
    onAddScale?: (scaleId: string) => void;
    zoneId?: string;
}

export const AddScaleBottomSheet: React.FC<AddScaleBottomSheetProps> = ({
    visible,
    onClose,
    onAddScale,
    zoneId,
}) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    const [selectedScaleId, setSelectedScaleId] = useState<string | null>(null);
    const { items: scales, isLoading } = useAvailableScales(zoneId);

    const handleAdd = () => {
        if (selectedScaleId && onAddScale) {
            onAddScale(selectedScaleId);
        }
        onClose();
        setTimeout(() => setSelectedScaleId(null), 300);
    };

    const renderScaleItem = (scale: IScale) => {
        const isSelected = selectedScaleId === scale.id;
        return (
            <TouchableOpacity
                key={scale.id}
                style={[styles.scaleItem, isSelected && styles.scaleItemActive]}
                onPress={() => setSelectedScaleId(scale.id)}
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
                </View>
                <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                    {isSelected && <View style={styles.radioInnerCircle} />}
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
                            Chọn cân kết nối vào Ao 12.{'\n'}
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
                                <Text style={styles.emptyText}>Không có cân khả dụng</Text>
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
                    primaryDisabled={!selectedScaleId}
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
            fontSize: 16,
            fontWeight: '500',
            color: theme.text,
        },
        scaleItemSubtitle: {
            fontSize: 14,
            color: theme.textSecondary,
        },
        radioCircle: {
            width: 24,
            height: 24,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: theme.defaultBorder,
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: spacing.sm,
        },
        radioCircleActive: {
            borderColor: theme.primary,
        },
        radioInnerCircle: {
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: theme.primary,
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
