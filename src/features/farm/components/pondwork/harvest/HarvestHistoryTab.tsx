import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { spacing } from '@/styles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HarvestEntryItem } from './HarvestEntryItem';
import { HarvestBatchDetailBottomSheet } from './HarvestBatchDetailBottomSheet';
import { Button } from '@/shared/components/buttons/Button';
import { FilterChips } from '@/shared/components/buttons/FilterChips';
import { HarvestSummaryCards } from './HarvestSummaryCards';

type FilterType = 'all' | 'completed' | 'deleted';

export const HarvestHistoryTab: React.FC = () => {
    const theme = useAppTheme();
    const styles = getStyles(theme);
    const insets = useSafeAreaInsets();
    const paddingBottom = Math.max(insets.bottom, 12);

    const [activeFilter, setActiveFilter] = useState<FilterType>('all');
    const [batchDetailVisible, setBatchDetailVisible] = useState(false);

    const filterOptions = [
        { label: 'Tất cả', value: 'all' },
        { label: 'Hoàn tất', value: 'completed' },
        { label: 'Xóa', value: 'deleted' },
    ];

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                {/* Header text */}
                <View style={styles.headerTextContainer}>
                    <Text style={styles.headerText}>
                        <Text style={styles.boldText}>5</Text> mẻ -{' '}
                        <Text style={styles.boldText}>1</Text> đã hủy
                    </Text>
                </View>

                {/* Filters */}
                <FilterChips
                    options={filterOptions}
                    activeValue={activeFilter}
                    onValueChange={val => setActiveFilter(val as FilterType)}
                />

                {/* Summary Boxes */}
                <HarvestSummaryCards
                    containerStyle={{ marginTop: 0 }}
                    cards={[
                        { label: 'Tổng (4 mẻ HT)', value: '65.6', unit: 'kg' },
                        { label: 'Đã hủy (1 mẻ)', value: '- 18.1', unit: 'kg', isError: true },
                    ]}
                />

                <View style={styles.entriesList}>
                    <HarvestEntryItem
                        index="4"
                        weight={18.1}
                        subtitle="Cân 01 - 11:06"
                        onPress={() => setBatchDetailVisible(true)}
                    />
                    <HarvestEntryItem
                        index="4"
                        weight={18.1}
                        subtitle="Cân 02 - 10:58"
                        status="deleted"
                        onPress={() => setBatchDetailVisible(true)}
                    />
                    <HarvestEntryItem
                        index="3"
                        weight={13.1}
                        subtitle="Cân 02 - 10:58"
                        onPress={() => setBatchDetailVisible(true)}
                    />
                    <HarvestEntryItem
                        index="2"
                        weight={13.1}
                        subtitle="Cân 02 - 10:58"
                        onPress={() => setBatchDetailVisible(true)}
                    />
                    <HarvestEntryItem
                        index="1"
                        weight={13.1}
                        subtitle="Cân 02 - 10:58"
                        showDivider={false}
                        onPress={() => setBatchDetailVisible(true)}
                    />
                </View>
            </ScrollView>

            {/* Bottom Bar */}
            <View style={[styles.bottomBar, { paddingBottom }]}>
                <Button title="Kết thúc thu hoạch" variant="outline" fullWidth onPress={() => {}} />
            </View>

            <HarvestBatchDetailBottomSheet
                visible={batchDetailVisible}
                onClose={() => setBatchDetailVisible(false)}
            />
        </View>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.backgroundPrimary,
        },
        content: {
            padding: spacing.md,
            paddingBottom: 40,
            gap: 12,
        },
        headerTextContainer: {
            paddingHorizontal: 4,
        },
        headerText: {
            fontSize: 15,
            color: theme.textSecondary,
        },
        boldText: {
            fontWeight: '600',
            color: theme.text,
        },
        entriesList: {
            backgroundColor: theme.background,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.defaultBorder,
            overflow: 'hidden',
        },
        bottomBar: {
            paddingTop: 16,
            paddingHorizontal: spacing.md,
            backgroundColor: theme.background,
            borderTopWidth: 1,
            borderTopColor: theme.defaultBorder,
        },
    });
