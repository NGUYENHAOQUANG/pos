/**
 * @file MainNavigator.tsx
 * @description Main Navigator - Shrimp farm management app navigation
 * @author Kindy
 * @created 2025-11-16
 * @updated 2025-12-05
 */
import React from 'react';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute, Route } from '@react-navigation/native';

import { useTabBarVisibility } from './TabBarVisibilityContext';
import { ReportsScreen } from '@/features/reports';
// import DevicesScreen from '@/features/devices/screens/DevicesScreen';
import { MaterialNavigator } from '@/features/material/navigation/MaterialNavigator';
import { ControlNavigator } from '@/features/control/navigation/ControlNavigator';
import { FarmNavigator } from '@/features/farm/navigation/FarmNavigator';
import { colors } from '@/styles';
import { MenuNavigator } from '@/features/menu/navigation/MenuNavigator';
import { SvgProps } from 'react-native-svg';
// Import Icons
import {
  IconReport,
  IconReportActive,
  IconDevices,
  IconDevicesActive,
  IconFarm,
  IconFarmActive,
  IconMaterial,
  IconMaterialActive,
  IconSetting,
  IconSettingActive,
} from '@/assets/icons';

const TAB_HEIGHT = 70;

interface NavigationItem {
  key: string;
  label: string;
  Icon: React.FC<SvgProps>;
  IconActive: React.FC<SvgProps>;
  component: React.ComponentType<any>;
}

const navigationItems: NavigationItem[] = [
  // ... items
  {
    key: 'Reports',
    label: 'Báo cáo',
    Icon: IconReport,
    IconActive: IconReportActive,
    component: ReportsScreen,
  },
  {
    key: 'Devices',
    label: 'Điều khiển',
    Icon: IconDevices,
    IconActive: IconDevicesActive,
    component: ControlNavigator,
  },
  {
    key: 'Farm',
    label: 'Trại nuôi',
    Icon: IconFarm,
    IconActive: IconFarmActive,
    component: FarmNavigator,
  },
  {
    key: 'Material',
    label: 'Vật tư',
    Icon: IconMaterial,
    IconActive: IconMaterialActive,
    component: MaterialNavigator,
  },
  {
    key: 'Menu',
    label: 'Menu',
    Icon: IconSetting,
    IconActive: IconSettingActive,
    component: MenuNavigator,
  },
];

const Tab = createBottomTabNavigator();

const PADDING_BOTTOM = 12;

const CustomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const { isTabBarVisible } = useTabBarVisibility();
  const insets = useSafeAreaInsets();

  const focusedOptions = descriptors[state.routes[state.index].key].options;
  // @ts-ignore
  if (!isTabBarVisible || focusedOptions.tabBarStyle?.display === 'none') {
    return null;
  }

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

        const IconComponent = isFocused ? item.IconActive : item.Icon;

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tabItem}
            onPress={onPress}
            activeOpacity={0.7}
          >
            {isFocused && <View style={styles.activeIndicator} />}
            <View style={styles.iconContainer}>
              <IconComponent width={24} height={24} />
            </View>
            <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>{item.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const renderTabBar = (props: BottomTabBarProps) => <CustomTabBar {...props} />;

// Helper to determine visibility for the Menu tab
const getMenuTabBarVisibility = (route: Partial<Route<string>>) => {
  const routeName = getFocusedRouteNameFromRoute(route) ?? 'MenuMain';
  // Allow tab bar only on the main menu screen
  if (routeName === 'MenuMain') {
    return undefined; // Default style (visible)
  }
  return { display: 'none' } as const;
};

// Helper to determine visibility for the Material tab
const getMaterialTabBarVisibility = (route: Partial<Route<string>>) => {
  const routeName = getFocusedRouteNameFromRoute(route) ?? 'MaterialList';
  // Allow tab bar only on the main material list screen
  if (routeName === 'MaterialList') {
    return undefined; // Default style (visible)
  }
  return { display: 'none' } as const;
};

// Helper to determine visibility for the Control tab
const getControlTabBarVisibility = (route: Partial<Route<string>>) => {
  const routeName = getFocusedRouteNameFromRoute(route) ?? 'ControlList';
  // Allow tab bar on ControlList AND ControlDetail
  if (routeName === 'ControlList' || routeName === 'ControlDetail') {
    return undefined; // Default style (visible)
  }
  return { display: 'none' } as const;
};

// Helper to determine visibility for the Farm tab
const getFarmTabBarVisibility = (route: Partial<Route<string>>) => {
  const routeName = getFocusedRouteNameFromRoute(route) ?? 'FarmList';
  // Allow tab bar on FarmList and PondDetail
  if (routeName === 'FarmList' || routeName === 'PondDetail') {
    return undefined; // Default style (visible)
  }
  return { display: 'none' } as const;
};

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
          <Tab.Screen
            key={item.key}
            name={item.key}
            component={item.component}
            options={({ route }) => {
              if (item.key === 'Menu') {
                return { tabBarStyle: getMenuTabBarVisibility(route) };
              }
              if (item.key === 'Material') {
                return { tabBarStyle: getMaterialTabBarVisibility(route) };
              }
              if (item.key === 'Devices') {
                return { tabBarStyle: getControlTabBarVisibility(route) };
              }
              if (item.key === 'Farm') {
                return { tabBarStyle: getFarmTabBarVisibility(route) };
              }
              return {};
            }}
          />
        ))}
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
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
    position: 'relative',
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
