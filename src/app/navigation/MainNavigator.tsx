/**
 * @file MainNavigator.tsx
 * @description Main Navigator - Shrimp farm management app navigation
 * @author Kindy
 * @created 2025-11-16
 * @updated 2025-12-05
 */
import React from 'react';
import { StyleSheet, TouchableOpacity, View, Text, Image, ImageSourcePropType } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTabBarVisibility } from './TabBarVisibilityContext';
import { ReportsScreen } from '@/features/reports';
// import DevicesScreen from '@/features/devices/screens/DevicesScreen';
import { MaterialNavigator } from '@/features/material/navigation/MaterialNavigator';
import { ControlNavigator } from '@/features/control/navigation/ControlNavigator';
import { FarmNavigator } from '@/features/farm/navigation/FarmNavigator';
import SettingsScreen from '@/features/settings/screens/SettingsScreen';
import { colors } from '@/styles';

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
    component: ControlNavigator,
  },
  {
    key: 'Farm',
    label: 'Trại nuôi',
    icon: IconFarm,
    component: FarmNavigator,
  },
  {
    key: 'Material',
    label: 'Vật tư',
    icon: IconMaterial,
    component: MaterialNavigator,
  },
  {
    key: 'Settings',
    label: 'Menu',
    icon: IconSetting,
    component: SettingsScreen,
  },
];

const Tab = createBottomTabNavigator();

const PADDING_BOTTOM = 12;

const CustomTabBar = ({ state, navigation }: BottomTabBarProps) => {
  const { isTabBarVisible } = useTabBarVisibility();
  const insets = useSafeAreaInsets();

  if (!isTabBarVisible) return null;

  const safeBottom = Math.max(insets.bottom, PADDING_BOTTOM);

  return (
    <View
      style={[
        styles.bottomContainer,
        {
          paddingBottom: safeBottom,
          height: TAB_HEIGHT + safeBottom,
        },
      ]}
    >
      {state.routes.map((route, index) => {
        // const { options } = descriptors[route.key]; // Unused
        const isFocused = state.index === index;
        const item = navigationItems.find(i => i.key === route.name);

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        if (!item) return null;

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tabItem}
            onPress={onPress}
            activeOpacity={0.7}
          >
            {isFocused && <View style={styles.activeIndicator} />}
            <View style={styles.iconContainer}>
              <Image
                source={item.icon}
                style={[styles.icon, isFocused ? styles.iconActive : styles.iconInactive]}
                resizeMode="contain"
              />
            </View>
            <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>{item.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const renderTabBar = (props: BottomTabBarProps) => <CustomTabBar {...props} />;

export function MainNavigator() {
  return (
    <View style={styles.container}>
      <Tab.Navigator
        initialRouteName="Farm"
        screenOptions={{
          headerShown: false,
        }}
        tabBar={renderTabBar}
      >
        {navigationItems.map(item => (
          <Tab.Screen key={item.key} name={item.key} component={item.component} />
        ))}
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  bottomContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
    color: colors.text,
    fontWeight: '400',
    marginBottom: 4,
  },
  tabLabelActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
});
