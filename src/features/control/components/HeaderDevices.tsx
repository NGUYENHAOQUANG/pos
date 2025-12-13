import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, borderRadius } from '@/styles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface TabItem {
  key: string;
  label: string;
}

export const CONTROL_TABS: TabItem[] = [
  { key: 'history', label: 'Lịch sử hoạt động' },
  { key: 'statistic', label: 'Thống kê cảm biến' },
];

interface HeaderDevicesProps {
  title?: string;
  tabs?: TabItem[];
  selectedTab?: string;
  onTabSelect?: (key: string) => void;
  onBackPress?: () => void;
  rightLabel?: string;
  rightComponent?: React.ReactNode;
  showBackButton?: boolean;
  includeSafeArea?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const HeaderDevices: React.FC<HeaderDevicesProps> = ({
  title,
  tabs,
  selectedTab,
  onTabSelect,
  onBackPress,
  rightLabel,
  rightComponent,
  showBackButton = true,
  includeSafeArea = true,
  style,
}) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    }
  };

  const renderCenter = () => {
    if (tabs && tabs.length > 0) {
      return (
        <View style={styles.tabsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsContent}
          >
            {tabs.map(tab => {
              const isSelected = selectedTab === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.tab, isSelected && styles.activeTab]}
                  onPress={() => onTabSelect && onTabSelect(tab.key)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.tabText, isSelected && styles.activeTabText]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      );
    }

    return (
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
    );
  };

  return (
    <View style={[styles.container, includeSafeArea && { paddingTop: insets.top + 12 }, style]}>
      <View style={styles.leftContainer}>
        {showBackButton && (
          <TouchableOpacity style={styles.iconButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.centerContainer}>{renderCenter()}</View>

      <View style={styles.rightContainer}>
        {rightComponent ? (
          rightComponent
        ) : rightLabel ? (
          <Text style={styles.rightLabel}>{rightLabel}</Text>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    zIndex: 1000,
  },
  leftContainer: {
    width: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.xs,
  },
  rightContainer: {
    width: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  rightLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  // Tab styles
  tabsContainer: {
    flexDirection: 'row',
  },
  tabsContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tab: {
    paddingVertical: spacing.xs,
    marginHorizontal: spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '400',
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '600',
  },
});
