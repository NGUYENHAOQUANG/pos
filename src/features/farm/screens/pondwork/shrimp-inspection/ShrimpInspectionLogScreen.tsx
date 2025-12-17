import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing, borderRadius } from '@/styles';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { useFarm, JobExecution } from '@/features/farm/context/FarmContext';
import { DateRangeFilter } from '@/shared/components/forms/DateRangeFilter';
import { ShrimpInspectionLogItem } from '@/features/farm/components/shrimp-inspection/ShrimpInspectionLogItem';
import { DatePickerModal } from '@/features/home/components/DatePickerModal';
import { MaterialEmptyState } from '@/features/material/components/EmptyStateCard';

type NavigationProp = NativeStackNavigationProp<FarmStackParamList>;
type ScreenRouteProp = RouteProp<FarmStackParamList, 'PondworkLogScreen'>;

export const PondworkLogScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const { pond } = route.params || {};
  const insets = useSafeAreaInsets();
  const { setTabBarVisible } = useTabBarVisibility();
  const { getPondJobItemsGroupedByDate } = useFarm();

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [activeField, setActiveField] = useState<'start' | 'end'>('start');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  // Hide tab bar when this screen is mounted
  useEffect(() => {
    setTabBarVisible(false);
  }, [setTabBarVisible]);

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const formatSectionTitle = (date: Date): string => {
    if (isToday(date)) {
      return `Hôm nay, ${formatDate(date)}`;
    }
    return formatDate(date);
  };

  const startLabel = formatDate(startDate);
  const endLabel = formatDate(endDate);

  // Get items grouped by date from context
  const itemsByDate = useMemo(() => {
    if (!pond?.id) return new Map<string, JobExecution[]>();
    return getPondJobItemsGroupedByDate(pond.id, 'SHRIMP_INSPECTION', startDate, endDate);
  }, [getPondJobItemsGroupedByDate, pond?.id, startDate, endDate]);

  const handleBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
  };

  const handleToggleSection = (dateKey: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [dateKey]: !prev[dateKey],
    }));
  };

  const handleStartInspection = () => {
    if (pond) {
      navigation.navigate('ShrimpInspectionScreen', { pond });
    }
  };

  const handleEditInspection = (item: JobExecution) => {
    if (pond) {
      navigation.navigate('ShrimpInspectionScreen', { pond, itemToEdit: item });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nhật ký kiểm tra tôm</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Divider between header and date range */}
        <View style={styles.headerDivider} />

        {/* Date range filter */}
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
          paddingTop: spacing.sm,
          paddingBottom: insets.bottom + spacing.lg,
        }}
      >
        {itemsByDate.size === 0 ? (
          <View style={styles.emptyContainer}>
            {' '}
            <MaterialEmptyState tab="shrimp-inspection" onPress={handleStartInspection} />
          </View>
        ) : (
          Array.from(itemsByDate.entries()).map(
            ([dateKey, dateItems]: [string, JobExecution[]]) => {
              const date = new Date(dateKey.split('-').reverse().join('-'));
              const isExpanded = expandedSections[dateKey] !== false; // Default to expanded

              return (
                <View key={dateKey} style={{ marginBottom: spacing.sm }}>
                  <TouchableOpacity
                    style={[styles.sectionHeader, !isExpanded && styles.sectionHeaderCollapsed]}
                    onPress={() => handleToggleSection(dateKey)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.sectionTitle}>{formatSectionTitle(date)}</Text>
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={16}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.itemsContainer}>
                      {dateItems.map((item: JobExecution) => (
                        <ShrimpInspectionLogItem
                          key={item.id}
                          item={item}
                          meta={item.meta || {}}
                          onEdit={handleEditInspection}
                        />
                      ))}
                    </View>
                  )}
                </View>
              );
            }
          )
        )}
      </ScrollView>

      {/* Date Range Picker */}
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
    borderRadius: borderRadius.sm,
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.white,
  },
  sectionHeaderCollapsed: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 22,
  },
  dateRangeWrapper: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  itemsContainer: {
    paddingTop: 8,
    backgroundColor: colors.white,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyContainer: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
});
