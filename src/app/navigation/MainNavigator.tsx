/**
 * @file MainNavigator.tsx
 * @description Main Navigator - Shrimp farm management app navigation with animated curved bottom bar
 * @author Kindy
 * @created 2025-11-16
 * @updated 2025-11-20
 */
import React, { useEffect } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Dimensions,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { HomeScreen } from '@/features/home';
import { ReportsScreen } from '@/features/reports';
import DevicesScreen from '@/features/devices/screens/DevicesScreen';
import { MeterialScreen } from '@/features/material/screens/MeterialScreen';
import SettingsScreen from '@/features/settings/screens/SettingsScreen';

const { width } = Dimensions.get('window');
const TAB_HEIGHT = 75;
const TAB_ITEM_WIDTH = width / 5;

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface NavigationItem {
  key: string;
  label: string;
  icon: {
    active: string;
    inactive: string;
  };
  component: React.ComponentType<any>;
}

const navigationItems: NavigationItem[] = [
  {
    key: 'Reports',
    label: 'Báo cáo',
    icon: { active: 'stats-chart', inactive: 'stats-chart-outline' },
    component: ReportsScreen,
  },
  {
    key: 'Devices',
    label: 'Thiết bị',
    icon: { active: 'radio', inactive: 'radio-outline' },
    component: DevicesScreen,
  },
  {
    key: 'Management',
    label: 'Quản lý',
    icon: { active: 'grid', inactive: 'grid-outline' },
    component: HomeScreen,
  },
  {
    key: 'Material',
    label: 'Vật tư',
    icon: { active: 'cube', inactive: 'cube-outline' },
    component: MeterialScreen,
  },
  {
    key: 'Settings',
    label: 'Cài đặt',
    icon: { active: 'settings', inactive: 'settings-outline' },
    component: SettingsScreen,
  },
];

import { TabBarVisibilityContext } from './TabBarVisibilityContext';

export function MainNavigator() {
  const [selectedTab, setSelectedTab] = React.useState(2); // Start at Management
  const [isTabBarVisible, setTabBarVisible] = React.useState(true);
  const insets = useSafeAreaInsets();

  // Shared value for the center position of the curve
  const tabX = useSharedValue(2 * TAB_ITEM_WIDTH + TAB_ITEM_WIDTH / 2);

  useEffect(() => {
    const newX = selectedTab * TAB_ITEM_WIDTH + TAB_ITEM_WIDTH / 2;
    // Use withTiming for a direct animation without bounce/overshoot
    tabX.value = withTiming(newX, {
      duration: 300,
    });
  }, [selectedTab, tabX]);

  const animatedPathProps = useAnimatedProps(() => {
    const center = tabX.value;
    const depth = 55; // Increased depth for larger button
    const curveWidth = 120; // Increased width for larger button
    const top = 5;

    // Constructing the path
    // Start from top left
    const path = `
      M0,${top}
      L${center - curveWidth / 2},${top}
      C${center - curveWidth / 2 + 20},${top} ${center - 50},${depth} ${center},${depth}
      S${center + curveWidth / 2 - 20},${top} ${center + curveWidth / 2},${top}
      L${width},${top}
      L${width},${TAB_HEIGHT + insets.bottom}
      L0,${TAB_HEIGHT + insets.bottom}
      Z
    `;
    return { d: path };
  });

  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: tabX.value - 35 }], // -35 to center the 70px button
    };
  });

  const CurrentScreen = navigationItems[selectedTab].component;

  return (
    <TabBarVisibilityContext.Provider value={{ isTabBarVisible, setTabBarVisible }}>
      <View style={styles.container}>
        <View style={styles.content}>
          <CurrentScreen />
        </View>

        {isTabBarVisible && (
          <View style={styles.bottomContainer}>
            {/* SVG Background */}
            <View style={[styles.svgContainer, { height: TAB_HEIGHT + insets.bottom }]}>
              <Svg width={width} height={TAB_HEIGHT + insets.bottom}>
                <AnimatedPath
                  animatedProps={animatedPathProps}
                  fill="white"
                  stroke="#E0E0E0" // Optional: subtle border
                  strokeWidth={0.5}
                />
              </Svg>
            </View>

            {/* Floating Action Button */}
            <Animated.View style={[styles.floatingButtonContainer, animatedButtonStyle]}>
              <TouchableOpacity
                style={styles.floatingButton}
                activeOpacity={0.9}
                onPress={() => { }} // Already handled by tab press, but keeps interaction
              >
                <Icon
                  name={navigationItems[selectedTab].icon.active}
                  size={28} // Increased icon size
                  color="white"
                />
              </TouchableOpacity>
            </Animated.View>

            {/* Tab Items */}
            <View style={[styles.tabsContainer, { paddingBottom: insets.bottom }]}>
              {navigationItems.map((item, index) => {
                const isSelected = selectedTab === index;
                return (
                  <TouchableOpacity
                    key={item.key}
                    style={styles.tabItem}
                    onPress={() => setSelectedTab(index)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.iconContainer, isSelected && styles.hiddenIcon]}>
                      <Icon
                        name={item.icon.inactive}
                        size={24}
                        color="#8E8E93"
                      />
                    </View>
                    <Text style={[styles.tabLabel, isSelected && styles.tabLabelActive]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </View>
    </TabBarVisibilityContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  svgContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
    backgroundColor: 'transparent', // Ensure SVG container is transparent
  },
  floatingButtonContainer: {
    position: 'absolute',
    top: -45, // Half of button height (70/2)
    left: 0,
    zIndex: 10,
  },
  floatingButton: {
    width: 70, // Increased size
    height: 70, // Increased size
    borderRadius: 35,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white', // The white border requested
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  tabsContainer: {
    flexDirection: 'row',
    height: TAB_HEIGHT,
    alignItems: 'flex-end',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 10,
    height: '100%',
  },
  iconContainer: {
    marginBottom: 4,
  },
  hiddenIcon: {
    opacity: 0, // Hide icon when selected (it moves to floating button)
  },
  tabLabel: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '400',
  },
  tabLabelActive: {
    color: '#007AFF',
    fontWeight: '600',
    transform: [{ translateY: 0 }] // Push label down slightly when active to fit under curve
  },
});
