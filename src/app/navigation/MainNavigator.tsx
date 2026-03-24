import React, { useContext, useEffect, useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Animated, LayoutChangeEvent } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import LinearGradient from 'react-native-linear-gradient';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import BottomBarContext, { BottomBarProvider } from '@/app/navigation/BottomBarContext';

import { ReportsScreen } from '@/features/reports/screens/ReportsScreen';
import { colors, borderRadius } from '@/styles';
import { SvgProps } from 'react-native-svg';

// Main screens only (no nested stacks)
import { ShrimpPondListScreens } from '@/features/farm/screens/pond_list/ShrimpPondListScreens';
import { DeviceControlScreens } from '@/features/control/screens/DeviceControlScreens';
import { DevicesInPondScreens } from '@/features/control/screens/devices/DeviceInPondScreens'; // Import Control Detail
import { MaterialScreen } from '@/features/material/screens/material';
// Note: MenuProvider removed - now using Zustand store (useMenuStore)
import { MenuScreens } from '@/features/menu/screens/MenuScreens';

// Providers
// Note: ControlProvider removed - now using Zustand store (useControlStore)

// Native Stack for Control Tab
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const ControlStack = createNativeStackNavigator();

// Control Stack Screen - no provider needed, using Zustand directly
const ControlStackScreen = () => (
    <ControlStack.Navigator screenOptions={{ headerShown: false }}>
        <ControlStack.Screen name="ControlList" component={DeviceControlScreens} />
        <ControlStack.Screen name="ControlDetail" component={DevicesInPondScreens} />
    </ControlStack.Navigator>
);

const MenuScreenWithProvider = MenuScreens;

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
        label: 'Thiết bị',
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
        component: MaterialScreen,
    },
    {
        key: 'Menu',
        label: 'Tài khoản',
        Icon: IconSetting,
        IconActive: IconSettingActive,
        component: MenuScreenWithProvider,
    },
];

const Tab = createBottomTabNavigator();

interface AnimatedTabItemProps {
    route: { key: string; name: string };
    item: NavigationItem;
    isFocused: boolean;
    onPress: () => void;
}

const AnimatedTabItem: React.FC<AnimatedTabItemProps> = ({ route, item, isFocused, onPress }) => {
    const indicatorScale = useRef(new Animated.Value(0)).current;

    // Animate active indicator when tab becomes focused
    useEffect(() => {
        if (isFocused) {
            indicatorScale.setValue(0.8); // Start slightly smaller for pop effect
            Animated.spring(indicatorScale, {
                toValue: 1,
                friction: 8,
                tension: 100,
                useNativeDriver: true,
            }).start();
        }
    }, [isFocused, indicatorScale]);

    const IconComponent = isFocused ? item.IconActive : item.Icon;

    const iconFill = isFocused ? colors.white : undefined;
    const iconColor = isFocused ? colors.white : undefined;

    return (
        <TouchableOpacity
            key={route.key}
            style={[styles.tabItem]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={[styles.tabItemContent]}>
                <View style={[styles.iconContainer, isFocused && styles.iconActiveContainer]}>
                    <IconComponent width={20} height={20} fill={iconFill} color={iconColor} />
                </View>
                <Text
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.8}
                    style={[styles.tabLabel, isFocused && styles.tabLabelActive]}
                >
                    {item.label}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

/**
 * Custom Tab Bar with spring animations
 * Animation triggers when navigating back from detail screens
 */
const CustomTabBar = ({ state, navigation }: BottomTabBarProps) => {
    const insets = useSafeAreaInsets();
    const [barWidth, setBarWidth] = useState(0);
    const slideAnim = useRef(new Animated.Value(state.index)).current;
    const { onBarLayout } = useContext(BottomBarContext);

    const currentRoute = state.routes[state.index];

    useEffect(() => {
        Animated.spring(slideAnim, {
            toValue: state.index,
            friction: 7,
            tension: 50,
            useNativeDriver: true,
        }).start();
    }, [state.index, slideAnim]);

    const handleLayout = (e: LayoutChangeEvent) => {
        setBarWidth(e.nativeEvent.layout.width);
    };
    const innerWidth = Math.max(0, barWidth - 10);
    const tabWidth = innerWidth > 0 ? innerWidth / state.routes.length : 0;

    // Tab bar items shared between glass and fallback
    const tabBarItems = (
        <>
            {barWidth > 0 && (
                <Animated.View
                    style={[
                        styles.slidingIndicator,
                        {
                            width: tabWidth,
                            transform: [
                                {
                                    translateX: slideAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0, tabWidth],
                                    }),
                                },
                            ],
                        },
                    ]}
                >
                    <View style={styles.slidingIndicatorInner} />
                </Animated.View>
            )}

            {state.routes.map(route => {
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
                        key={route.key}
                        route={route}
                        item={item}
                        isFocused={isFocused}
                        onPress={onPress}
                    />
                );
            })}
        </>
    );

    const tabBarContent = (
        <View
            onLayout={e => {
                handleLayout(e);
                onBarLayout(e);
            }}
            style={[
                styles.bottomContainer,
                {
                    marginBottom: insets.bottom + 4,
                },
            ]}
        >
            {tabBarItems}
        </View>
    );

    return (
        <View style={styles.tabBarWrapper}>
            {/* Fade gradient below tab bar - always visible */}
            <LinearGradient
                colors={[
                    colors.fade[0],
                    colors.fade[8],
                    colors.fade[20],
                    colors.fade[40],
                    colors.fade[65],
                    colors.fade[85],
                    colors.fade[95],
                ]}
                locations={[0, 0.15, 0.3, 0.45, 0.6, 0.8, 1]}
                style={styles.blurContainer}
                pointerEvents="none"
            />
            {/* Tab bar sits on top */}
            {tabBarContent}
        </View>
    );
};

const renderTabBar = (props: BottomTabBarProps) => <CustomTabBar {...props} />;

export function MainNavigator() {
    return (
        <BottomBarProvider>
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
        </BottomBarProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    bottomContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: borderRadius.full,
        borderColor: colors.border,
        borderWidth: 1,
        marginHorizontal: 16,
        padding: 4,
        overflow: 'hidden',
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: borderRadius.full,
        elevation: 1,
        zIndex: 1,
    },
    tabBarWrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    blurContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
        marginHorizontal: 16,
        overflow: 'hidden',
    },
    tabItem: {
        flex: 1,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabItemContent: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
    },
    slidingIndicator: {
        position: 'absolute',
        top: 4,
        bottom: 4,
        left: 4,
        zIndex: 0,
    },
    slidingIndicatorInner: {
        flex: 1,
        backgroundColor: colors.orange[800],
        borderRadius: borderRadius.full,
    },

    iconContainer: {
        marginBottom: 2,
    },
    iconActiveContainer: {
        // Add subtle bounce for icon when selected
        transform: [{ scale: 1.1 }],
    },
    tabLabel: {
        fontSize: 12,
        color: colors.text,
        fontWeight: '400',
    },
    tabLabelActive: {
        color: colors.white,
        fontWeight: '500',
    },
});
