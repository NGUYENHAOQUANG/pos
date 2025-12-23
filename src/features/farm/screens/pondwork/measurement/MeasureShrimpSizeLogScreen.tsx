import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '@/styles';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { useFarm, JobExecution } from '@/features/farm/context/FarmContext';
import { DateRangeFilter } from '@/shared/components/forms/DateRangeFilter';
import { DatePickerModal } from '@/features/home/components/DatePickerModal';
import { EmptyStateCard } from '@/features/farm/components/EmptyStateCard';
import { TrackingDayCard, TrackingGroup } from '@/features/farm/components/TrackingList';

type NavigationProp = NativeStackNavigationProp<FarmStackParamList>;
type ScreenRouteProp = RouteProp<FarmStackParamList, 'MeasureShrimpSizeLogScreen'>;

// Helper to format date consistently to dd-MM-yyyy for the top filter
const formatDateForFilter = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
};

export const MeasureShrimpSizeLogScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const { params } = useRoute<ScreenRouteProp>();
    const { pond } = params || {};
    const insets = useSafeAreaInsets();
    const { setTabBarVisible } = useTabBarVisibility();
    const { getPondJobItemsGroupedByDate } = useFarm();

    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
    const [activeField, setActiveField] = useState<'start' | 'end'>('start');

    useEffect(() => {
        setTabBarVisible(false);
    }, [setTabBarVisible]);

    const startLabel = formatDateForFilter(startDate);
    const endLabel = formatDateForFilter(endDate);

    const handleEdit = useCallback(
        (item: JobExecution) => {
            if (pond) {
                navigation.navigate('MeasureShrimpSizeScreen', {
                    pond,
                    itemToEdit: item,
                });
            }
        },
        [navigation, pond]
    );

    const itemsByDate = useMemo(() => {
        if (!pond?.id) return new Map();
        return getPondJobItemsGroupedByDate(pond.id, 'MEASURE_SIZE', startDate, endDate);
    }, [getPondJobItemsGroupedByDate, pond?.id, startDate, endDate]);

    const trackingGroups: TrackingGroup[] = useMemo(() => {
        const groups = Array.from(itemsByDate.entries());

        const mappedGroups = groups.map(([dateKey, dateItems]) => {
            // Sort activities within the group first
            dateItems.sort((a, b) => {
                const aNum = parseInt(a.label.replace('Lần ', ''), 10) || 0;
                const bNum = parseInt(b.label.replace('Lần ', ''), 10) || 0;
                return aNum - bNum;
            });

            const activities = dateItems.map(item => {
                const { meta } = item;
                const totalShrimpCount = meta?.totalShrimpCount;
                const survivalRate = meta?.survivalRate;

                const activityData = [
                    { label: 'Cỡ tôm (con/kg)', value: meta?.shrimpSize ?? '-' },
                    { label: 'Sản lượng còn lại (kg)', value: meta?.remainingWeight ?? '-' },
                    {
                        label: 'Tổng số tôm hiện tại (con)',
                        value: totalShrimpCount?.toLocaleString() ?? '-',
                    },
                    {
                        label: 'Tỉ lệ sống dự kiến (%)',
                        value:
                            survivalRate !== null && survivalRate !== undefined
                                ? `${Math.round(survivalRate)}`
                                : '-',
                    },
                ];

                return {
                    id: item.id,
                    time: item.time,
                    title: item.label,
                    data: activityData,
                    note: meta?.notes,
                    onEdit: () => handleEdit(item),
                };
            });

            // Correctly format the date title for the group header
            const dateStr = dateKey.replace('Hôm nay, ', '');
            const isToday = dateKey === new Date().toLocaleDateString('en-GB');
            const displayDate = isToday ? `Hôm nay, ${dateStr}` : dateStr;

            return {
                id: dateKey,
                date: displayDate,
                activities: activities,
            };
        });

        // Sort the groups by date, descending, similar to WaterTreatmentLogScreen
        return mappedGroups.sort((a, b) => {
            const parseDate = (dStr: string) => {
                const clean = dStr.replace('Hôm nay, ', '');
                const [day, month, year] = clean.split('/').map(Number);
                return new Date(year, month - 1, day).getTime();
            };
            return parseDate(b.date) - parseDate(a.date);
        });
    }, [itemsByDate, handleEdit]);

    const handleBack = () => {
        if (navigation.canGoBack()) navigation.goBack();
    };

    const handleNavigateToCreate = () => {
        if (pond) {
            navigation.navigate('MeasureShrimpSizeScreen', { pond });
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerSection}>
                <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                    <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Nhật ký đo kích thước tôm</Text>
                    <View style={styles.headerSpacer} />
                </View>
                <View style={styles.headerDivider} />
                <DateRangeFilter
                    startLabel={startLabel}
                    endLabel={endLabel}
                    onPressStart={() => {
                        setActiveField('start');
                        setIsDatePickerVisible(true);
                    }}
                    onPressEnd={() => {
                        setActiveField('end');
                        setIsDatePickerVisible(true);
                    }}
                    onPressCalendar={() => {
                        setActiveField('start');
                        setIsDatePickerVisible(true);
                    }}
                    style={styles.dateRangeWrapper}
                />
            </View>

            <ScrollView
                contentContainerStyle={{
                    paddingHorizontal: spacing.md,
                    paddingTop: spacing.sm,
                    paddingBottom: insets.bottom + spacing.lg,
                }}
            >
                {trackingGroups.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <EmptyStateCard
                            message="Chưa có dữ liệu đo kích thước tôm"
                            buttonTitle="Bắt đầu đo kích thước tôm"
                            onPress={handleNavigateToCreate}
                        />
                    </View>
                ) : (
                    trackingGroups.map(group => <TrackingDayCard key={group.id} group={group} />)
                )}
            </ScrollView>

            <DatePickerModal
                visible={isDatePickerVisible}
                onClose={() => setIsDatePickerVisible(false)}
                date={activeField === 'start' ? startDate : endDate}
                onSelectDate={date => {
                    if (activeField === 'start') {
                        setStartDate(date);
                        if (date > endDate) {
                            setEndDate(date);
                        }
                    } else {
                        setEndDate(date);
                        if (date < startDate) {
                            setStartDate(date);
                        }
                    }
                    setIsDatePickerVisible(false);
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
    },
    headerSection: {
        backgroundColor: colors.white,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 12,
        paddingHorizontal: spacing.md,
        backgroundColor: colors.white,
    },
    backButton: {
        width: 40,
        height: 40,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
        textAlign: 'center',
    },
    headerSpacer: {
        width: 40,
    },
    headerDivider: {
        height: 1,
        backgroundColor: colors.borderLight,
    },
    dateRangeWrapper: {
        marginHorizontal: spacing.md,
        marginTop: spacing.sm,
        marginBottom: spacing.sm,
    },
    emptyContainer: {
        marginTop: spacing.sm,
    },
});
