import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { Button } from '@/shared/components/buttons/Button';
import { ButtonDevices } from '@/features/control/components/devices/ButtonDevices';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { spacing } from '@/styles';
import { useLiveWeight } from '@/features/farm/hooks/useScales';
import { ScaleConnectionStatus, IScale, LiveWeightState } from '@/features/farm/types/scale.types';

export enum ScaleStatus {
    READY = 'ready',
    WAITING = 'waiting',
    EMPTY = 'empty',
    DISCONNECTED = 'disconnected',
}

export interface ScaleCardProps {
    title: string;
    weight: number | null;
    scale?: IScale;
    onConfirmPress?: (weight: number) => void;
    onPress?: () => void;
    onToggle?: (val: boolean) => void;
}

export const ScaleCard: React.FC<ScaleCardProps> = ({
    title,
    weight,
    scale,
    onConfirmPress,
    onPress,
    onToggle,
}) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    const shouldFetchLiveWeight =
        scale?.deviceId != null && scale?.connectionStatus === ScaleConnectionStatus.Connected;

    const { data: liveWeightResponse } = useLiveWeight(scale?.id || '', {
        enabled: shouldFetchLiveWeight,
    });

    const liveWeightData = liveWeightResponse?.data;
    const canConfirm = liveWeightData?.canConfirm ?? false;
    const currentNetWeight =
        shouldFetchLiveWeight && liveWeightData?.net !== undefined ? liveWeightData.net : weight;

    const [isToggled, setIsToggled] = useState(true);

    // Sync state if parent status changes
    useEffect(() => {
        setIsToggled(true);
    }, [scale?.usageStatus]);

    const handleToggle = useCallback(
        (val: boolean) => {
            setIsToggled(val);
            if (onToggle) {
                onToggle(val);
            }
        },
        [onToggle]
    );

    const statusProps = useMemo(() => {
        const liveState = liveWeightData?.state;

        if (liveState) {
            switch (liveState) {
                case LiveWeightState.Disconnected:
                    return {
                        text: 'Mất kết nối',
                        style: styles.statusDisconnected,
                        textStyle: styles.statusDisconnectedText,
                    };
                case LiveWeightState.Measuring:
                    return {
                        text: 'Chờ ổn định',
                        style: styles.statusWaiting,
                        textStyle: styles.statusWaitingText,
                    };
                case LiveWeightState.Stable:
                    return {
                        text: 'Sẵn sàng XN',
                        style: styles.statusReady,
                        textStyle: styles.statusReadyText,
                    };
                case LiveWeightState.Zero:
                    return {
                        text: 'Trống',
                        style: styles.statusEmpty,
                        textStyle: styles.statusEmptyText,
                    };
            }
        }

        return {
            text: 'Mất kết nối',
            style: styles.statusDisconnected,
            textStyle: styles.statusDisconnectedText,
        };
    }, [liveWeightData?.state, styles]);

    const isDisconnected =
        liveWeightData?.state === LiveWeightState.Disconnected || !scale?.deviceId;

    const displayWeight = isDisconnected
        ? '-'
        : currentNetWeight !== null
        ? currentNetWeight.toFixed(1)
        : '-';

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
                        <Text style={styles.scaleTitle} numberOfLines={2}>
                            {title}
                        </Text>
                        <View style={styles.chevronContainer}>
                            <View style={styles.toggleWrapper}>
                                <ButtonDevices
                                    value={isToggled}
                                    onValueChange={handleToggle}
                                    trackColor={theme.warning}
                                />
                            </View>
                        </View>
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
                                onPress={() => onConfirmPress(currentNetWeight ?? 0)}
                                disabled={
                                    isDisconnected ||
                                    (shouldFetchLiveWeight
                                        ? currentNetWeight === 0 || !canConfirm
                                        : false)
                                }
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
            alignItems: 'flex-start',
            marginBottom: 4,
        },
        scaleTitle: {
            flexShrink: 1,
            fontSize: 15,
            fontWeight: '500',
            color: theme.text,
            marginBottom: 4,
            marginRight: spacing.sm,
        },
        chevronContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            height: 24,
        },
        toggleWrapper: {
            justifyContent: 'center',
            alignItems: 'flex-end',
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
        statusBadge: {
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 100,
            alignSelf: 'flex-start',
            borderWidth: 1,
        },
        statusReady: {
            backgroundColor: theme.green[50],
            borderColor: theme.green[200],
        },
        statusReadyText: {
            color: theme.green[600],
            fontSize: 12,
            fontWeight: '500',
        },
        statusWaiting: {
            backgroundColor: theme.yellow[50],
            borderColor: theme.yellow[200],
        },
        statusWaitingText: {
            color: theme.yellow[600],
            fontSize: 12,
            fontWeight: '500',
        },
        statusDisconnected: {
            backgroundColor: theme.red[50],
            borderColor: theme.red[200],
        },
        statusDisconnectedText: {
            color: theme.red[600],
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
            fontSize: 16,
            fontWeight: '500',
            color: theme.text,
        },
        scaleWeightUnit: {
            fontSize: 12,
            fontWeight: '400',
            color: theme.textSecondary,
        },
    });
