import React, { useEffect, ReactNode } from 'react';
import { View, StyleSheet, ScrollView, ViewStyle, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '@/styles';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { DateRangeFilter } from '@/shared/components/forms/DateRangeFilter';
import { TrackingGroup, TrackingDayCard } from '@/features/farm/components/TrackingList';
import { EmptyStateCard } from '@/shared/components/ui/EmptyStateCard';
import { HeaderSection } from '@/shared/components/layout/HeaderSection';
import { PondJobSkeleton } from '@/features/farm/components/skeleton/PondJobSkeleton';

type NavigationProp = NativeStackNavigationProp<FarmStackParamList>;

export interface BaseLogScreenProps {
    /** Screen title */
    title: string;
    /** Start date for filtering */
    startDate: Date;
    /** End date for filtering */
    endDate: Date;
    /** Setter for start date */
    onStartDateChange: (date: Date) => void;
    /** Setter for end date */
    onEndDateChange: (date: Date) => void;
    /** Grouped data to display */
    groupedData: TrackingGroup[];
    /** Empty state message */
    emptyMessage: string;
    /** Empty state button title */
    emptyButtonTitle: string;
    /** Handler for empty state button press */
    onEmptyButtonPress: () => void;
    /** Optional custom empty state component */
    customEmptyState?: ReactNode;
    /** Optional custom card style */
    cardStyle?: ViewStyle;
    /** Use flat card style (no border radius, no shadow) */
    useFlatCardStyle?: boolean;
    /** Loading state for initial fetch */
    isLoading?: boolean;
    /** Refreshing state for pull-to-refresh */
    isRefreshing?: boolean;
    /** Callback for pull-to-refresh */
    onRefresh?: () => void;
    /** Right custom component */
    rightAction?: ReactNode;
    /** Right icon */
    rightIcon?: ReactNode;
    /** Right press handler */
    onRightPress?: () => void;
}

/**
 * Base component for log screens with shared structure:
 * - Header with back button and title
 * - Date range filter
 * - Scrollable content with grouped data or empty state
 *
 * @example
 * ```tsx
 * const { startDate, endDate, setStartDate, setEndDate, groupedData } = useLogScreenData(config);
 *
 * return (
 *   <BaseLogScreen
 *     title="Nhật ký đo môi trường"
 *     startDate={startDate}
 *     endDate={endDate}
 *     onStartDateChange={setStartDate}
 *     onEndDateChange={setEndDate}
 *     groupedData={groupedData}
 *     emptyMessage="Chưa có dữ liệu đo môi trường"
 *     emptyButtonTitle="Bắt đầu đo thông số môi trường"
 *     onEmptyButtonPress={() => navigation.navigate('AddEnvironmentScreen', { pond })}
 *   />
 * );
 * ```
 */
export const BaseLogScreen: React.FC<BaseLogScreenProps> = ({
    title,
    startDate,
    endDate,
    onStartDateChange,
    onEndDateChange,
    groupedData,
    emptyMessage,
    emptyButtonTitle,
    onEmptyButtonPress,
    customEmptyState,
    cardStyle,
    useFlatCardStyle = false,
    isLoading = false,
    isRefreshing = false,
    onRefresh,
    rightAction,
    rightIcon,
    onRightPress,
}) => {
    const navigation = useNavigation<NavigationProp>();
    const insets = useSafeAreaInsets();
    const { setTabBarVisible } = useTabBarVisibility();

    // Hide tab bar when this screen is mounted
    useEffect(() => {
        setTabBarVisible(false);
    }, [setTabBarVisible]);

    const handleBack = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        }
    };

    const flatCardStyle = useFlatCardStyle
        ? {
              borderRadius: 0,
              borderWidth: 0,
              // borderBottomWidth: 1,
              borderBottomColor: colors.border,
              marginBottom: 8,
              shadowColor: 'transparent',
              shadowOpacity: 0,
              elevation: 0,
          }
        : {};

    return (
        <View style={styles.container}>
            <View style={styles.headerSection}>
                <HeaderSection
                    title={title}
                    titleStyle={{ fontSize: 18, fontWeight: '600', lineHeight: 28 }}
                    onBack={handleBack}
                    rightComponent={rightAction}
                    rightIcon={rightIcon}
                    onRightPress={onRightPress}
                    showBackButton={true}
                    containerStyle={{ backgroundColor: colors.backgroundPrimary }}
                />

                {/* Divider between header and date range */}
                <View style={styles.headerDivider} />

                {/* Date range filter */}
                <DateRangeFilter
                    startDate={startDate}
                    endDate={endDate}
                    onStartDateChange={onStartDateChange}
                    onEndDateChange={onEndDateChange}
                    style={styles.dateRangeWrapper}
                />
            </View>

            <ScrollView
                contentContainerStyle={{
                    paddingTop: spacing.sm,
                    paddingBottom: insets.bottom + spacing.lg,
                }}
                refreshControl={
                    onRefresh ? (
                        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
                    ) : undefined
                }
            >
                {isLoading ? (
                    <PondJobSkeleton />
                ) : groupedData.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        {customEmptyState || (
                            <EmptyStateCard
                                message={emptyMessage}
                                buttonTitle={emptyButtonTitle}
                                onPress={onEmptyButtonPress}
                            />
                        )}
                    </View>
                ) : (
                    groupedData.map(group => (
                        <TrackingDayCard
                            key={group.id}
                            group={group}
                            style={[cardStyle || styles.cardStyle, flatCardStyle]}
                        />
                    ))
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
    },
    headerSection: {
        backgroundColor: colors.backgroundPrimary,
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
    cardStyle: {
        marginBottom: spacing.sm,
    },
    emptyContainer: {
        marginHorizontal: spacing.md,
        marginTop: spacing.sm,
    },
});
