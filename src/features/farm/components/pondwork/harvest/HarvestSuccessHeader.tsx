import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import CheckCircleIcon from '@/assets/Icon/CheckCircleFilled.svg';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';

export interface HarvestSuccessHeaderProps {
    batchNumber: number;
    weight: number;
    scaleName: string;
    time: string;
}

export const HarvestSuccessHeader: React.FC<HarvestSuccessHeaderProps> = ({
    batchNumber,
    weight,
    scaleName,
    time,
}) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    const scaleShortName = scaleName.split('—')[0].trim();
    const shortTime = time.substring(0, 5); // ensures "11:24" format

    return (
        <View style={styles.container}>
            <View>
                <CheckCircleIcon width={124} height={124} />
            </View>
            <Text style={styles.subtitle}>Mẻ #{batchNumber} đã ghi nhận</Text>

            <View style={styles.weightWrapper}>
                <Text style={styles.weightValue}>{weight.toFixed(1)}</Text>
                <Text style={styles.weightUnit}>kg</Text>
            </View>

            <Text style={styles.timeSubtitle}>
                {scaleShortName} · {shortTime}
            </Text>
        </View>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            alignItems: 'center',
            gap: 8,
        },
        subtitle: {
            fontSize: 15,
            color: theme.textSecondary,
        },
        weightWrapper: {
            flexDirection: 'row',
            alignItems: 'baseline',
        },
        weightValue: {
            fontSize: 48,
            fontWeight: '600',
            color: theme.text,
        },
        weightUnit: {
            fontSize: 18,
            fontWeight: '500',
            color: theme.textSecondary,
            marginLeft: 4,
        },
        timeSubtitle: {
            fontSize: 14,
            color: theme.textSecondary,
        },
    });
