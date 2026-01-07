/**
 * @file MainNavigator.tsx
 * @description Main Tab Navigator - Only contains main screens for each tab
 * Tab Bar is always visible here. Detail screens are in AppStack (outside tabs).
 * Following Partner pattern.
 * @author Kindy
 * @created 2025-11-16
 * @updated 2025-01-07
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { StyleSheet, TouchableOpacity, View, Text, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import { ReportsScreen } from '@/features/reports/screens/ReportsScreen';
import { colors } from '@/styles';
import { SvgProps } from 'react-native-svg';

// Main screens only (no nested stacks)
import { ShrimpPondListScreens } from '@/features/farm/screens/pond/ShrimpPondListScreens';
import { DeviceControlScreens } from '@/features/control/screens/DeviceControlScreens';
import { DevicesInPondScreens } from '@/features/control/screens/devices/DeviceInPondScreens'; // Import Control Detail
import { MeterialScreen } from '@/features/material/screens/MaterialScreen';
import { MenuScreens } from '@/features/menu/screens/MenuScreens';

// Providers
import { MenuProvider } from '@/features/menu/context/MenuContext';
import { ControlProvider } from '@/features/control/context/ControlContext';

// Native Stack for Control Tab
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const ControlStack = createNativeStackNavigator();

// Wrapper components with providers including Stack for Control
const ControlStackScreen = () => (
    <ControlProvider>
        <ControlStack.Navigator screenOptions={{ headerShown: false }}>
            <ControlStack.Screen name="ControlList" component={DeviceControlScreens} />
            <ControlStack.Screen name="ControlDetail" component={DevicesInPondScreens} />
        </ControlStack.Navigator>
    </ControlProvider>
);

const MenuScreenWithProvider = () => (
    <MenuProvider>
        <MenuScreens />
    </MenuProvider>
);

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
const PADDING_BOTTOM = 12;

interface NavigationItem {
    key: string;
    label: string;
    Icon: React.FC<SvgProps>;
    IconActive: React.FC<SvgProps>;
    component: React.ComponentType<any>;
}

const navigationItems: NavigationItem[] = [
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
        component: ControlStackScreen, // Use Stack instead of single screen
    },
    {
        key: 'Farm',
        label: 'Trại nuôi',
        Icon: IconFarm,
        IconActive: IconFarmActive,
        component: ShrimpPondListScreens,
    },
    {
        key: 'Material',
        label: 'Vật tư',
        Icon: IconMaterial,
        IconActive: IconMaterialActive,
        component: MeterialScreen,
    },
    {
        key: 'Menu',
        label: 'Menu',
        Icon: IconSetting,
        IconActive: IconSettingActive,
        component: MenuScreenWithProvider,
    },
];

const Tab = createBottomTabNavigator();

// Animation constants
const BASE_DELAY = 10;
const STAGGER_DELAY = 30;

/**
 * Animated Tab Item Component
 * Spring animation from bottom, sequential from right to left
 */
interface AnimatedTabItemProps {
    route: { key: string; name: string };
    item: NavigationItem;
    isFocused: boolean;
    onPress: () => void;
    index: number;
    totalItems: number;
    animationKey: number; // Key to trigger re-animation
}

const AnimatedTabItem: React.FC<AnimatedTabItemProps> = ({
    route,
    item,
    isFocused,
    onPress,
    index,
    totalItems,
    animationKey,
}) => {
    const translateY = useRef(new Animated.Value(30)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const indicatorScale = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Calculate delay: from center (Farm at index 2) outward to both sides
        // Index order: 0-Reports, 1-Devices, 2-Farm, 3-Material, 4-Menu
        const centerIndex = 2; // Farm is at center
        const distanceFromCenter = Math.abs(index - centerIndex);
        const delay = BASE_DELAY + distanceFromCenter * STAGGER_DELAY;

        // Reset values IMMEDIATELY to prevent flash of old state
        translateY.setValue(30);
        opacity.setValue(0);
        indicatorScale.setValue(0);

        // Spring animation for icon and text
        Animated.parallel([
            Animated.sequence([
                Animated.delay(delay),
                Animated.spring(translateY, {
                    toValue: 0,
                    friction: 5,
                    tension: 100,
                    useNativeDriver: true,
                }),
            ]),
            Animated.sequence([
                Animated.delay(delay),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 150,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();
    }, [animationKey, translateY, opacity, indicatorScale, index, totalItems]);

    // Animate active indicator when tab becomes focused or when animation key changes
    useEffect(() => {
        if (isFocused) {
            indicatorScale.setValue(0);
            Animated.spring(indicatorScale, {
                toValue: 1,
                friction: 5,
                tension: 100,
                useNativeDriver: true,
            }).start();
        }
    }, [isFocused, indicatorScale, animationKey]);

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
                    styles.tabItemContent,
                    {
                        opacity,
                        transform: [{ translateY }],
                    },
                ]}
            >
                {/* Active indicator with scale animation */}
                {isFocused && (
                    <Animated.View
                        style={[
                            styles.activeIndicator,
                            {
                                transform: [{ scaleX: indicatorScale }],
                            },
                        ]}
                    />
                )}
                <View style={styles.iconContainer}>
                    <IconComponent width={24} height={24} />
                </View>
                <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
                    {item.label}
                </Text>
            </Animated.View>
        </TouchableOpacity>
    );
};

/**
 * Custom Tab Bar with spring animations
 * Animation triggers when navigating back from detail screens
 */
const CustomTabBar = ({ state, navigation }: BottomTabBarProps) => {
    const insets = useSafeAreaInsets();
    const safeBottom = Math.max(insets.bottom, PADDING_BOTTOM);
    const totalHeight = TAB_HEIGHT + safeBottom;

    // Animation key to trigger re-animation when tab bar becomes visible
    const [animationKey, setAnimationKey] = useState(0);

    // Trigger animation when MainNavigator gains focus (coming back from detail screens)
    useFocusEffect(
        useCallback(() => {
            // Increment key to trigger re-animation
            setAnimationKey(prev => prev + 1);
        }, [])
    );

    const currentRoute = state.routes[state.index];

    return (
        <View
            style={[
                styles.bottomContainer,
                {
                    height: totalHeight,
                    paddingBottom: safeBottom,
                },
            ]}
        >
            {state.routes.map((route, index) => {
                const item = navigationItems.find(i => i.key === route.name);
                const isFocused = route.name === currentRoute.name;

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!event.defaultPrevented) {
                        navigation.navigate(route.name);
                    }
                };

                if (!item) return null;

                return (
                    <AnimatedTabItem
                        key={`${route.key}-${animationKey}`} // Force remount to ensure clean animation start
                        route={route}
                        item={item}
                        isFocused={isFocused}
                        onPress={onPress}
                        index={index}
                        totalItems={state.routes.length}
                        animationKey={animationKey}
                    />
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
        backgroundColor: colors.backgroundPrimary, // Change from white to backgroundPrimary to show rounded corners
    },
    bottomContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderTopWidth: 0,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 10,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        // Ensure content is clipped to rounded corners if needed, though usually not for tab bar
        overflow: 'hidden',
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        position: 'relative',
    },
    tabItemContent: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
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
