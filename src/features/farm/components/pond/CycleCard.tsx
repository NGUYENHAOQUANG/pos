import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { typography } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import ChevronRight from '@/assets/Icon/ChevronRight.svg';
import { formatDate } from '@/features/farm/utils/dateUtils';
import { pondDetailService } from '@/features/farm/services/pond-detail.service';
import { CycleData } from '@/features/farm/types/cycle.types';
import { Tag } from './Tag';
import { DetailRow } from '@/features/material/components/DetailRow';

interface CycleCardProps {
    cycle: CycleData;
    breedName?: string;
    endDate?: string;
    status?: 'Chưa hoàn thành' | 'Hoàn thành';
    onPress?: () => void;
}

export const CycleCard: React.FC<CycleCardProps> = ({
    cycle,
    breedName,
    endDate,
    status = 'Chưa hoàn thành',
    onPress,
}) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    if (!cycle) return null;

    const isCompleted = status === 'Hoàn thành';
    const cycleName = cycle.name || 'Chưa đặt tên';

    const stockingDateStr = cycle.createdAt;
    const startDate = stockingDateStr ? formatDate(new Date(stockingDateStr)) : '';
    const dateDisplay = endDate
        ? `${startDate} - ${endDate}`
        : startDate
        ? `${startDate} - nay`
        : '- nay';

    const doc = pondDetailService.calculateDOC(stockingDateStr ?? '');
    const stockingQuantity = cycle.totalStocking;
    const breed = breedName || '--';

    return (
        <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
            <View style={styles.header}>
                <View style={styles.leftColumn}>
                    <Text style={styles.cycleName}>{cycleName}</Text>
                    <Text style={styles.dateText}>{dateDisplay}</Text>
                </View>

                <View style={styles.rightColumn}>
                    <Tag
                        status={isCompleted ? 'active' : 'preparing'}
                        label={status}
                        style={{ paddingHorizontal: 8, paddingVertical: 4 }}
                    />
                    <ChevronRight
                        width={18}
                        height={18}
                        style={styles.arrowIcon}
                        color={theme.textSecondary}
                    />
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.body}>
                <DetailRow label="Ngày nuôi (DOC):" value={doc} />
                <DetailRow
                    label="Số lượng thả (Pls):"
                    value={
                        typeof stockingQuantity === 'number'
                            ? stockingQuantity.toLocaleString()
                            : '-'
                    }
                />
                <DetailRow label="Tôm giống:" value={breed} />
            </View>
        </TouchableOpacity>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            backgroundColor: theme.background,
            width: '100%',
            borderWidth: 1,
            borderColor: theme.defaultBorder,
            borderRadius: 16,
        },
        header: {
            flexDirection: 'row',
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 8,
            alignItems: 'center',
        },
        leftColumn: {
            flex: 1,
        },
        cycleName: {
            fontSize: typography.fontSize.sm,
            fontWeight: '700',
            color: theme.text,
            marginBottom: 2,
            lineHeight: 22,
        },
        dateText: {
            fontSize: typography.fontSize.sm,
            color: theme.textSecondary,
            lineHeight: 22,
        },
        rightColumn: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-end',
        },
        arrowIcon: {
            marginLeft: 8,
        },
        divider: {
            height: 1,
            backgroundColor: theme.defaultBorder,
        },
        body: {
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: 16,
            gap: 8,
        },
    });
