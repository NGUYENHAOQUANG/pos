import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '@/styles';
import InfoIcon from '@/assets/Icon/information-circle.svg';
import { OutlineButton } from '@/shared/components/buttons/OutlineButton';

export interface CountingResultSectionProps {
    result: string;
    currentImageCount: number;
    countTimes: number;
    showAddMore: boolean;
    onAddMore?: () => void;
}

export const CountingResultSection: React.FC<CountingResultSectionProps> = ({
    result,
    currentImageCount,
    countTimes,
    showAddMore,
    onAddMore,
}) => (
    <View>
        <View style={styles.row}>
            <Text style={styles.label}>Tổng lượng thả</Text>
            <Text style={styles.value}>
                {result !== '0' && result !== '' ? Number(result).toLocaleString('en-US') : '-'}
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
                    <InfoIcon width={20} height={20} style={styles.infoIcon} />
                    <Text style={styles.infoText}>
                        Bạn có thể chụp thêm hình để kiểm tra thêm nếu cần.
                    </Text>
                </View>

                {showAddMore && (
                    <OutlineButton
                        label="Đo thêm"
                        onPress={onAddMore || (() => {})}
                        labelStyle={styles.addMoreText}
                    />
                )}
            </>
        )}
    </View>
);

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.xs,
    },
    label: {
        fontSize: 16,
        color: colors.textSecondary,
        flex: 1,
    },
    value: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.text,
        marginLeft: spacing.md,
    },
    infoBox: {
        backgroundColor: colors.white,
        padding: 16,
        borderRadius: 8,
        marginTop: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: colors.border,
        borderWidth: 1,
        marginBottom: spacing.md,
    },
    infoIcon: {
        marginRight: 8,
    },
    infoText: {
        fontSize: 14,
        color: colors.text,
        lineHeight: 20,
        fontWeight: '500',
    },
    addMoreText: {
        color: colors.text,
        fontWeight: '500',
        fontSize: 16,
    },
});
