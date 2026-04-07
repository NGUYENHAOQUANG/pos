import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { spacing } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import InfoIcon from '@/assets/Icon/information-circle.svg';
import { Button } from '@/shared/components/buttons/Button';

export interface CountingResultSectionProps {
    result: string;
    currentCheckCount: number;
    currentImageCount: number;
    countTimes: number;
    showAddMore: boolean;
    onAddMore?: () => void;
}

export const CountingResultSection: React.FC<CountingResultSectionProps> = ({
    result,
    currentCheckCount,
    currentImageCount,
    countTimes,
    showAddMore,
    onAddMore,
}) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);
    return (
        <View>
            <View style={styles.row}>
                <Text style={styles.label}>Tổng lượng thả</Text>
                <Text style={styles.value}>
                    {result !== '0' && result !== '' ? Number(result).toLocaleString('en-US') : '-'}
                </Text>
            </View>
            <View style={styles.row}>
                <Text style={styles.label}>Lần kiểm tra hiện tại</Text>
                <Text style={styles.value}>
                    {currentCheckCount > 0
                        ? Number(currentCheckCount).toLocaleString('en-US')
                        : '-'}
                </Text>
            </View>
            <View style={styles.row}>
                <Text style={styles.label}>Lần kiểm tra trước</Text>
                <Text style={styles.value}>
                    {countTimes > 1 && currentImageCount > 0
                        ? Number(currentImageCount).toLocaleString('en-US')
                        : '-'}
                </Text>
            </View>
            <View style={styles.row}>
                <Text style={styles.label}>Số lần đếm</Text>
                <Text style={styles.value}>
                    {countTimes > 0 ? countTimes.toLocaleString('en-US') : '-'}
                </Text>
            </View>

            {countTimes > 0 && (
                <>
                    <View style={styles.infoBox}>
                        <InfoIcon
                            width={20}
                            height={20}
                            style={styles.infoIcon}
                            color={theme.textSecondary}
                        />
                        <Text style={styles.infoText}>
                            Bạn có thể chụp thêm hình để kiểm tra thêm nếu cần.
                        </Text>
                    </View>

                    {showAddMore && (
                        <Button
                            title="Kiểm tra thêm"
                            onPress={onAddMore || (() => {})}
                            variant="outline"
                            textStyle={styles.addMoreText}
                            style={{ borderColor: theme.defaultBorder }}
                        />
                    )}
                </>
            )}
        </View>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        row: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: spacing.xs,
        },
        label: {
            fontSize: 16,
            color: theme.textSecondary,
            flex: 1,
        },
        value: {
            fontSize: 16,
            fontWeight: '500',
            color: theme.text,
            marginLeft: spacing.md,
        },
        infoBox: {
            backgroundColor: theme.background,
            padding: 16,
            borderRadius: 12,
            marginVertical: spacing.md,
            flexDirection: 'row',
            alignItems: 'flex-start',
            borderColor: theme.defaultBorder,
            borderWidth: 1,
            overflow: 'hidden',
        },
        infoIcon: {
            marginRight: 8,
            flexShrink: 0,
            marginTop: 2,
        },
        infoText: {
            flex: 1,
            flexShrink: 1,
            flexWrap: 'wrap',
            fontSize: 14,
            color: theme.text,
            lineHeight: 20,
            fontWeight: '500',
        },
        addMoreText: {
            color: theme.text,
            fontWeight: '500',
            fontSize: 16,
        },
    });
