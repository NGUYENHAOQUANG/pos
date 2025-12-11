import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing } from '@/styles';

export type FarmTabType = 'all' | 'active' | 'preparing';

interface HeadingFarmProps {
  selectedTab: FarmTabType;
  onTabSelect: (tab: FarmTabType) => void;
  counts?: {
    all: number;
    active: number;
    preparing: number;
  };
}

export const HeadingFarm: React.FC<HeadingFarmProps> = ({
  selectedTab,
  onTabSelect,
  counts = { all: 0, active: 0, preparing: 0 },
}) => {
  const tabs: { key: FarmTabType; label: string; count: number }[] = [
    { key: 'all', label: 'Tất cả', count: counts.all },
    { key: 'active', label: 'Đang hoạt động', count: counts.active },
    { key: 'preparing', label: 'Đang chuẩn bị', count: counts.preparing },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {tabs.map(tab => {
          const isSelected = selectedTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, isSelected && styles.activeTab]}
              onPress={() => onTabSelect(tab.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, isSelected && styles.activeTabText]}>
                {tab.label} ({tab.count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
  },
  tab: {
    paddingVertical: spacing.md,
    marginRight: spacing.lg,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 15,
    color: colors.textSecondary || '#666',
    fontWeight: '400',
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '600', // Matches the bold look of active tab
  },
});
