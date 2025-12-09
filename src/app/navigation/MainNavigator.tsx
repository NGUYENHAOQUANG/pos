/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * @file MainNavigator.tsx
 * @description Main Navigator - Shrimp farm management app navigation
 * @author Kindy
 * @created 2025-11-16
 * @updated 2025-12-05
 */
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Text, Image, ImageSourcePropType } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTabBarVisibility } from './TabBarVisibilityContext';
import { HomeScreen } from '@/features/home';
import { ReportsScreen } from '@/features/reports';
// import DevicesScreen from '@/features/devices/screens/DevicesScreen';
import { MeterialScreen } from '@/features/material/screens/MaterialScreen';
import { DeviceControlScreens } from '@/features/control/screens/DeviceControlScreens';
import SettingsScreen from '@/features/settings/screens/SettingsScreen';

// Import Icons
const IconReport = require('../../assets/images/Icon/IconMainNavigator/Icon-Report.png');
const IconDevices = require('../../assets/images/Icon/IconMainNavigator/Icon-Devices.png');
const IconFarm = require('../../assets/images/Icon/IconMainNavigator/Icon-Farm.png');
const IconMaterial = require('../../assets/images/Icon/IconMainNavigator/Icon-Material.png');
const IconSetting = require('../../assets/images/Icon/IconMainNavigator/Icon-Setting.png');

const TAB_HEIGHT = 70;

interface NavigationItem {
  key: string;
  label: string;
  icon: ImageSourcePropType;
  component: React.ComponentType<any>;
}

const navigationItems: NavigationItem[] = [
  {
    key: 'Reports',
    label: 'Báo cáo',
    icon: IconReport,
    component: ReportsScreen,
  },
  {
    key: 'Devices',
    label: 'Điều khiển',
    icon: IconDevices,
    component: DeviceControlScreens,
  },
  {
    key: 'Management',
    label: 'Trại nuôi',
    icon: IconFarm,
    component: HomeScreen,
  },
  {
    key: 'Material',
    label: 'Vật tư',
    icon: IconMaterial,
    component: MeterialScreen,
  },
  {
    key: 'Settings',
    label: 'Menu',
    icon: IconSetting,
    component: SettingsScreen,
  },
];

export function MainNavigator() {
  const [selectedTab, setSelectedTab] = useState(1);
  const { isTabBarVisible } = useTabBarVisibility();
  const insets = useSafeAreaInsets();

  const CurrentScreen = navigationItems[selectedTab].component;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <CurrentScreen />
      </View>

      {isTabBarVisible && (
        <View
          style={[
            styles.bottomContainer,
            { paddingBottom: insets.bottom, height: TAB_HEIGHT + insets.bottom },
          ]}
        >
          {navigationItems.map((item, index) => {
            const isSelected = selectedTab === index;
            return (
              <TouchableOpacity
                key={item.key}
                style={styles.tabItem}
                onPress={() => setSelectedTab(index)}
                activeOpacity={0.7}
              >
                {isSelected && <View style={styles.activeIndicator} />}
                <View style={styles.iconContainer}>
                  <Image
                    source={item.icon}
                    style={[styles.icon, isSelected ? styles.iconActive : styles.iconInactive]}
                    resizeMode="contain"
                  />
                </View>
                <Text style={[styles.tabLabel, isSelected && styles.tabLabelActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
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
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 0, // Remove border top width as we have rounded corners and shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    width: '80%',
    height: 3,
    backgroundColor: '#007AFF',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  iconContainer: {
    marginBottom: 4,
    marginTop: 8,
  },
  icon: {
    width: 24,
    height: 24,
  },
  iconActive: {
    tintColor: '#007AFF',
  },
  iconInactive: {
    tintColor: '#8E8E93',
  },
  tabLabel: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '400',
    marginBottom: 4,
  },
  tabLabelActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
});
