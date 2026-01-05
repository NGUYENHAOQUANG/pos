/**
 * @file MainNavigator.tsx
 * @description Main Navigator - Shrimp farm management app navigation
 * @author Kindy
 * @created 2025-11-16
 * @updated 2025-12-05
 */
import React, { useEffect, useRef } from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    View,
    Text,
    Animated,
    Platform,
    UIManager,
    Easing,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute, Route } from '@react-navigation/native';
import { ReportsScreen } from '@/features/reports/screens/ReportsScreen';
import { useTabBarVisibility } from './TabBarVisibilityContext';
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

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const CustomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
    const { isTabBarVisible } = useTabBarVisibility();
    const insets = useSafeAreaInsets();
    const safeBottom = Math.max(insets.bottom, PADDING_BOTTOM);
    const totalHeight = TAB_HEIGHT + safeBottom;

    const currentRoute = state.routes[state.index];
    const focusedRouteName = getFocusedRouteNameFromRoute(currentRoute);

    // Determine which tab should be visually active
    let activeTabName = currentRoute.name;
    if (currentRoute.name === 'Menu' && focusedRouteName === 'FarmStack') {
        activeTabName = 'Farm';
    }

    const focusedOptions = descriptors[currentRoute.key].options;

    // Determine visibility logic
    const shouldShow = isTabBarVisible && (focusedOptions.tabBarStyle as any)?.display !== 'none';

    // Animation value: 0 = visible, 1 = hidden
    const slideAnim = useRef(new Animated.Value(shouldShow ? 0 : 1)).current;

    // Animation/translation values for each of the 5 icons
    const iconAnims = useRef(navigationItems.map(() => new Animated.Value(0))).current;

    useEffect(() => {
        // Animate Visual (TabBar sliding)
        // Use SPRING for showing (Bounce effect)
        // Use TIMING for hiding (Prevents layout jitter/oscillation at the end)
        if (shouldShow) {
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 6,
                tension: 60,
                useNativeDriver: false,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: 1,
                duration: 250,
                useNativeDriver: false,
                easing: Easing.out(Easing.ease),
            }).start();
        }

        // Animate Icons only when showing up
        if (shouldShow) {
            // Helper for bounce animation
            const bounce = (anim: Animated.Value, delay: number) => {
                anim.setValue(20); // Start from below
                return Animated.sequence([
                    Animated.delay(delay),
                    Animated.spring(anim, {
                        toValue: 0, // Spring up to final position
                        friction: 6,
                        tension: 80,
                        useNativeDriver: true,
                    }),
                ]);
            };

            // Stagger delays: Center (Farm) -> Sides (Devices/Material) -> Outer (Reports/Menu)
            // Indices: Reports(0), Devices(1), Farm(2), Material(3), Menu(4)
            const BASE_DELAY = 50; // Wait slightly for bar to start moving
            const STAGGER = 60; // Delay between waves

            Animated.parallel([
                bounce(iconAnims[2], BASE_DELAY), // Farm
                bounce(iconAnims[1], BASE_DELAY + STAGGER), // Devices
                bounce(iconAnims[3], BASE_DELAY + STAGGER), // Material
                bounce(iconAnims[0], BASE_DELAY + STAGGER * 2), // Reports
                bounce(iconAnims[4], BASE_DELAY + STAGGER * 2), // Menu
            ]).start();
        } else {
            // Reset instantly when hiding so they are ready for next show
            iconAnims.forEach(anim => anim.setValue(0));
        }
    }, [shouldShow, slideAnim, iconAnims]);

    const animatedHeight = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [totalHeight, 0],
        extrapolate: 'clamp', // Prevent negative height during spring bounce
    });

    return (
        <>
            {/* Visual Tab Bar (Layout Affecting) */}
            <Animated.View
                style={[
                    styles.bottomContainer,
                    {
                        height: animatedHeight,
                        // transform: [{ translateY }], // Removed to avoid creating a gap between content and bar
                        // Removed absolute position to ensure it takes up space in layout
                        backgroundColor: 'white',
                        overflow: 'hidden', // Ensure content doesn't spill out when height < total
                    },
                ]}
            >
                <View
                    style={{
                        height: totalHeight,
                        flexDirection: 'row',
                        width: '100%',
                        paddingBottom: safeBottom,
                    }}
                >
                    {state.routes.map((route, index) => {
                        const item = navigationItems.find(i => i.key === route.name);
                        // Use activeTabName for visual focus instead of standard state.index
                        const isFocused = route.name === activeTabName;

                        // Get animation value by index (assuming route order matches navigationItems)
                        // Safety: use index % length or fallback to 0 if something is weird
                        const iconAnim = iconAnims[index] || new Animated.Value(0);

                        const onPress = () => {
                            const event = navigation.emit({
                                type: 'tabPress',
                                target: route.key,
                                canPreventDefault: true,
                            });

                            // Allow navigation even if focused (supports pop-to-top behavior)
                            if (!event.defaultPrevented) {
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
                                <Animated.View
                                    style={[
                                        {
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '100%',
                                            height: '100%',
                                            transform: [{ translateY: iconAnim }],
                                        },
                                    ]}
                                >
                                    {isFocused && <View style={styles.activeIndicator} />}
                                    <View style={styles.iconContainer}>
                                        <IconComponent width={24} height={24} />
                                    </View>
                                    <Text
                                        style={[
                                            styles.tabLabel,
                                            isFocused && styles.tabLabelActive,
                                        ]}
                                    >
                                        {item.label}
                                    </Text>
                                </Animated.View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </Animated.View>
        </>
    );
};

const renderTabBar = (props: BottomTabBarProps) => <CustomTabBar {...props} />;

// Helper to determine visibility for the Menu tab
const getMenuTabBarVisibility = (route: Partial<Route<string>>) => {
    const routeName = getFocusedRouteNameFromRoute(route) ?? 'MenuMain';
    // Allow tab bar only on the main menu screen and FarmStack
    if (routeName === 'MenuMain' || routeName === 'FarmStack') {
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
        backgroundColor: 'transparent',
    },
    bottomContainer: {
        backgroundColor: 'white',
        borderTopWidth: 0,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 10,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        // Removed flexDirection: 'row' here because it's on the inner View
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
        backgroundColor: colors.primary,
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
        tintColor: colors.primary,
    },
    iconInactive: {
        tintColor: colors.text,
    },
    tabLabel: {
        fontSize: 12,
        color: colors.text,
        fontWeight: '400',
        marginBottom: 4,
    },
    tabLabelActive: {
        color: colors.primary,
        fontWeight: '600',
    },
});
