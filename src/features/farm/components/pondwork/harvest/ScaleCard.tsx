import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { Button } from '@/shared/components/buttons/Button';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { spacing } from '@/styles';

export enum ScaleStatus {
    READY = 'ready',
    WAITING = 'waiting',
    EMPTY = 'empty',
    DISCONNECTED = 'disconnected',
}

export interface ScaleCardProps {
    title: string;
    status: ScaleStatus;
    weight: number | null;
    showTopWeight?: boolean;
    onConfirmPress?: () => void;
    onPress?: () => void;
    onPressChevron?: () => void;
}

export const ScaleCard: React.FC<ScaleCardProps> = ({
    title,
    status,
    weight,
    showTopWeight,
    onConfirmPress,
    onPress,
    onPressChevron,
}) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    const getStatusProps = () => {
        switch (status) {
            case ScaleStatus.READY:
                return {
                    text: 'Sẵn sàng XN',
                    style: styles.statusReady,
                    textStyle: styles.statusReadyText,
                };
            case ScaleStatus.WAITING:
                return {
                    text: 'Chờ ổn định',
                    style: styles.statusWaiting,
                    textStyle: styles.statusWaitingText,
                };
            case ScaleStatus.DISCONNECTED:
                return {
                    text: 'Mất kết nối',
                    style: styles.statusDisconnected,
                    textStyle: styles.statusDisconnectedText,
                };
            case ScaleStatus.EMPTY:
            default:
                return {
                    text: 'Trống',
                    style: styles.statusEmpty,
                    textStyle: styles.statusEmptyText,
                };
        }
    };

    const statusProps = getStatusProps();
    const displayWeight = weight !== null ? weight.toFixed(1) : '-';

    return (
        <TouchableOpacity
            style={styles.scaleCard}
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
        >
            <View style={styles.scaleCardTop}>
                <Image
                    source={require('@/assets/Icon/IconDevices/icon_weight_scale.png')}
                    style={styles.scaleImage}
                    resizeMode="contain"
                />
                <View style={styles.scaleInfoContainer}>
                    <View style={styles.scaleTitleRow}>
                        <Text style={styles.scaleTitle}>{title}</Text>
                        {onPressChevron ? (
                            <TouchableOpacity
                                style={styles.chevronContainer}
                                onPress={onPressChevron}
                            >
                                {showTopWeight && (
                                    <>
                                        <Text style={styles.scaleWeightTopValue}>
                                            {displayWeight}
                                        </Text>
                                        <Text style={styles.scaleWeightTopUnit}> kg</Text>
                                    </>
                                )}
                                <Text
                                    style={[
                                        styles.chevronIcon,
                                        showTopWeight ? { marginLeft: 8 } : undefined,
                                    ]}
                                >
                                    ▸
                                </Text>
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.chevronContainer}>
                                {showTopWeight && (
                                    <>
                                        <Text style={styles.scaleWeightTopValue}>
                                            {displayWeight}
                                        </Text>
                                        <Text style={styles.scaleWeightTopUnit}> kg</Text>
                                    </>
                                )}
                                <Text
                                    style={[
                                        styles.chevronIcon,
                                        showTopWeight ? { marginLeft: 8 } : undefined,
                                    ]}
                                >
                                    ▸
                                </Text>
                            </View>
                        )}
                    </View>
                    <View style={[styles.statusBadge, statusProps.style]}>
                        <Text style={statusProps.textStyle}>{statusProps.text}</Text>
                    </View>
                    <View style={styles.scaleCardBottom}>
                        <View style={styles.scaleWeightContainer}>
                            <Text style={styles.scaleWeightValue}>{displayWeight}</Text>
                            <Text style={styles.scaleWeightUnit}> kg</Text>
                        </View>
                        {onConfirmPress && (
                            <Button
                                title="Xác nhận"
                                variant="outline"
                                size="small"
                                onPress={onConfirmPress}
                            />
                        )}
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        scaleCard: {
            backgroundColor: theme.background,
            borderRadius: 12,
            padding: 8,
            borderWidth: 1,
            borderColor: theme.defaultBorder,
        },
        scaleCardTop: {
            flexDirection: 'row',
            alignItems: 'flex-start',
        },
        scaleImage: {
            width: 48,
            height: 48,
            borderRadius: 12,
            marginRight: spacing.sm,
            borderWidth: 1,
            borderColor: theme.defaultBorder,
        },
        scaleInfoContainer: {
            flex: 1,
        },
        scaleTitleRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 4,
        },
        scaleTitle: {
            fontSize: 15,
            fontWeight: '500',
            color: theme.text,
            marginBottom: 4,
        },
        chevronContainer: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        scaleWeightTopValue: {
            fontSize: 16,
            fontWeight: '500',
            color: theme.text,
        },
        scaleWeightTopUnit: {
            fontSize: 13,
            color: theme.textSecondary,
        },
        chevronIcon: {
            fontSize: 20,
            color: theme.textSecondary,
        },
        statusBadge: {
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 100,
            alignSelf: 'flex-start',
            borderWidth: 1,
        },
        statusReady: {
            backgroundColor: '#E5F7ED',
            borderColor: '#A8E3C1',
        },
        statusReadyText: {
            color: '#158C4A',
            fontSize: 12,
            fontWeight: '500',
        },
        statusWaiting: {
            backgroundColor: '#FFF4E5',
            borderColor: '#FFD3A3',
        },
        statusWaitingText: {
            color: '#D97706',
            fontSize: 12,
            fontWeight: '500',
        },
        statusDisconnected: {
            backgroundColor: '#FFF0F0',
            borderColor: '#FFD6D6',
        },
        statusDisconnectedText: {
            color: '#DC2626',
            fontSize: 12,
            fontWeight: '500',
        },
        statusEmpty: {
            backgroundColor: theme.backgroundSecondary,
            borderColor: theme.defaultBorder,
        },
        statusEmptyText: {
            color: theme.textSecondary,
            fontSize: 12,
            fontWeight: '500',
        },
        scaleCardBottom: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
        },
        scaleWeightContainer: {
            flexDirection: 'row',
            alignItems: 'baseline',
        },
        scaleWeightValue: {
            fontSize: 20,
            fontWeight: '600',
            color: theme.text,
        },
        scaleWeightUnit: {
            fontSize: 14,
            color: theme.textSecondary,
        },
    });
