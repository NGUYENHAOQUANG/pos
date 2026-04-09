import React, { useContext, useEffect, useRef, useState } from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    View,
    Animated,
    LayoutChangeEvent,
    Platform,
} from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { isLiquidGlassSupported } from '@callstack/liquid-glass';
import LinearGradient from 'react-native-linear-gradient';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createNativeBottomTabNavigator } from '@react-navigation/bottom-tabs/unstable';
import { Route, useNavigation } from '@react-navigation/native';
import BottomBarContext, { BottomBarProvider } from '@/app/navigation/BottomBarContext';
import { useSettingsStore } from '@/features/menu/store/settingsStore';

import { ReportsScreen } from '@/features/reports/screens/ReportsScreen';
import { colors, borderRadius } from '@/styles';
import { fontFamily } from '@/styles/typography';
import { SvgProps } from 'react-native-svg';
import { useAppTheme } from '@/styles/themeContext';

// Main screens only (no nested stacks)
import { ShrimpPondListScreens } from '@/features/farm/screens/pond_list/ShrimpPondListScreens';
import { DeviceControlScreens } from '@/features/control/screens/DeviceControlScreens';
import { DevicesInPondScreens } from '@/features/control/screens/devices/DeviceInPondScreens';
import { MaterialScreen } from '@/features/material/screens/material/MaterialScreen';
import { MenuScreens } from '@/features/menu/screens/MenuScreens';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '@/app/navigation/AppStack';
import ChatBotIcon from '@/assets/Icon/IconMenu/ChatBotIcon.svg';

// Native Stack for Control Tab
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const ControlStack = createNativeStackNavigator();

const ControlStackScreen = () => (
    <ControlStack.Navigator screenOptions={{ headerShown: false }}>
        <ControlStack.Screen name="ControlList" component={DeviceControlScreens} />
        <ControlStack.Screen name="ControlDetail" component={DevicesInPondScreens} />
    </ControlStack.Navigator>
);

const MenuScreenWithProvider = MenuScreens;

// Import SVG Icons (for Android / iOS < 26 fallback)
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

// ════════════════════════════════════════════════════════════════════
// Navigation Item config (shared metadata)
// ════════════════════════════════════════════════════════════════════
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
        component: ControlStackScreen,
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

// ════════════════════════════════════════════════════════════════════
// iOS 26+ : Native Bottom Tabs (uses OS-level UITabBarController)
// ════════════════════════════════════════════════════════════════════
const NativeTab = createNativeBottomTabNavigator();

const NativeTabNavigator = () => {
    const themeColors = useAppTheme();

    return (
        <NativeTab.Navigator
            initialRouteName="Farm"
            screenOptions={{
                headerShown: false,
                tabBarBlurEffect: themeColors.isDark
                    ? 'systemChromeMaterialDark'
                    : 'systemChromeMaterialLight',
                tabBarActiveTintColor: themeColors.primaryOrange,
                tabBarInactiveTintColor: themeColors.textSecondary,
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '400',
                    fontFamily: fontFamily.regular,
                },
                tabBarStyle: {
                    // backgroundColor: themeColors.transparent,
                },
                lazy: false,
            }}
        >
            <NativeTab.Screen
                name="Reports"
                component={ReportsScreen}
                options={{
                    title: 'Báo cáo',
                    tabBarIcon: ({ focused }: { focused: boolean }) => ({
                        type: 'image' as const,
                        source: focused
                            ? require('@/assets/Icon/IconMainNavigator/Icon-Report-Active.png')
                            : themeColors.isDark
                            ? require('@/assets/Icon/IconMainNavigator/Icon-Report-Dark.png')
                            : require('@/assets/Icon/IconMainNavigator/Icon-Report.png'),
                        tinted: false,
                    }),
                }}
            />
            <NativeTab.Screen
                name="Devices"
                component={ControlStackScreen}
                options={{
                    title: 'Thiết bị',
                    tabBarIcon: ({ focused }: { focused: boolean }) => ({
                        type: 'image' as const,
                        source: focused
                            ? require('@/assets/Icon/IconMainNavigator/Icon-Devices-Active.png')
                            : themeColors.isDark
                            ? require('@/assets/Icon/IconMainNavigator/Icon-Devices-Dark.png')
                            : require('@/assets/Icon/IconMainNavigator/Icon-Devices.png'),
                        tinted: false,
                    }),
                }}
            />
            <NativeTab.Screen
                name="Farm"
                component={ShrimpPondListScreens}
                options={{
                    title: 'Trại nuôi',
                    tabBarIcon: ({ focused }: { focused: boolean }) => ({
                        type: 'image' as const,
                        source: focused
                            ? require('@/assets/Icon/IconMainNavigator/Icon-Farm-Active.png')
                            : themeColors.isDark
                            ? require('@/assets/Icon/IconMainNavigator/Icon-Farm-Dark.png')
                            : require('@/assets/Icon/IconMainNavigator/Icon-Farm.png'),
                        tinted: false,
                    }),
                }}
            />
            <NativeTab.Screen
                name="Material"
                component={MaterialScreen}
                options={{
                    title: 'Vật tư',
                    tabBarIcon: ({ focused }: { focused: boolean }) => ({
                        type: 'image' as const,
                        source: focused
                            ? require('@/assets/Icon/IconMainNavigator/Icon-Material-Active.png')
                            : themeColors.isDark
                            ? require('@/assets/Icon/IconMainNavigator/Icon-Material-Dark.png')
                            : require('@/assets/Icon/IconMainNavigator/Icon-Material.png'),
                        tinted: false,
                    }),
                }}
            />
            <NativeTab.Screen
                name="Menu"
                component={MenuScreenWithProvider}
                options={{
                    title: 'Tài khoản',
                    tabBarIcon: ({ focused }: { focused: boolean }) => ({
                        type: 'image' as const,
                        source: focused
                            ? require('@/assets/Icon/IconMainNavigator/Icon-Setting-Active.png')
                            : themeColors.isDark
                            ? require('@/assets/Icon/IconMainNavigator/Icon-Setting-Dark.png')
                            : require('@/assets/Icon/IconMainNavigator/Icon-Setting.png'),
                        tinted: false,
                    }),
                }}
            />
        </NativeTab.Navigator>
    );
};

// ════════════════════════════════════════════════════════════════════
// Android / iOS < 26 : Custom Tab Bar (SVG icons, floating pill,
//                      sliding indicator, white glass fallback)
// ════════════════════════════════════════════════════════════════════
const SlideTab = createMaterialTopTabNavigator();
const StandardTab = createBottomTabNavigator();

interface AnimatedTabItemProps {
    route: { key: string; name: string };
    item: NavigationItem;
    isFocused: boolean;
    onPress: () => void;
}

const AnimatedTabItem: React.FC<AnimatedTabItemProps> = ({ route, item, isFocused, onPress }) => {
    const theme = useAppTheme();
    const indicatorScale = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (isFocused) {
            indicatorScale.setValue(0.8);
            Animated.spring(indicatorScale, {
                toValue: 1,
                friction: 8,
                tension: 100,
                useNativeDriver: true,
            }).start();
        }
    }, [isFocused, indicatorScale]);

    const IconComponent = isFocused ? item.IconActive : item.Icon;
    // Active: white icon on orange pill; Inactive: theme-aware gray
    const inactiveColor = theme.isDark ? theme.gray[100] : theme.gray[600];
    const iconFill = isFocused ? colors.white : inactiveColor;
    const iconColor = isFocused ? colors.white : inactiveColor;

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
                    style={[
                        styles.tabLabel,
                        { color: inactiveColor },
                        isFocused && styles.tabLabelActive,
                    ]}
                >
                    {item.label}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

/**
 * Custom Tab Bar with sliding indicator
 * Works with both BottomTab and MaterialTopTab navigators
 * Using 'any' cast since both navigator types share identical tabBar shape
 * but TypeScript can't cleanly union their emit() signatures
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTabBar = ({ state, navigation }: { state: any; navigation: any }) => {
    const insets = useSafeAreaInsets();
    const theme = useAppTheme();
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

            {state.routes.map((route: Route<string, object | undefined>) => {
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

    // Theme-aware tab bar background
    const tabBarBg = theme.isDark ? theme.backgroundTertiary : colors.white;
    const tabBarBorderColor = theme.isDark ? theme.border : colors.border;

    return (
        <View style={styles.tabBarWrapper} pointerEvents="box-none">
            <LinearGradient
                colors={[
                    theme.fade[0],
                    theme.fade[8],
                    theme.fade[20],
                    theme.fade[40],
                    theme.fade[65],
                    theme.fade[85],
                    theme.fade[95],
                ]}
                locations={[0, 0.15, 0.3, 0.45, 0.6, 0.8, 1]}
                style={styles.fadeGradient}
                pointerEvents="none"
            />
            <View
                onLayout={e => {
                    handleLayout(e);
                    onBarLayout(e);
                }}
                style={[
                    styles.fallbackContainer,
                    {
                        backgroundColor: tabBarBg,
                        borderColor: tabBarBorderColor,
                        marginBottom: insets.bottom + 4,
                    },
                ]}
            >
                {tabBarItems}
            </View>
        </View>
    );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderTabBar = (props: any) => <CustomTabBar {...props} />;

// ════════════════════════════════════════════════════════════════════
// Main Navigator — picks the right implementation at runtime
// Liquid Glass (iOS 26+) → NativeTabNavigator
// Slide + Swipe enabled  → MaterialTopTab (SlideTab)
// Default fallback       → StandardTab (BottomTab)
// ════════════════════════════════════════════════════════════════════
export function MainNavigator() {
    const tabSlideEnabled = useSettingsStore(s => s.tabSlideEnabled);
    const tabSwipeEnabled = useSettingsStore(s => s.tabSwipeEnabled);

    // iOS 26+ with Liquid Glass — automatically use native OS tab bar
    if (Platform.OS === 'ios' && isLiquidGlassSupported) {
        return (
            <BottomBarProvider isNativeTab>
                <NativeTabNavigator />
                <ChatbotFAB />
            </BottomBarProvider>
        );
    }

    // Android / iOS < 26 — custom tab bar with swipe/slide options
    return (
        <BottomBarProvider>
            <View style={styles.container}>
                {tabSlideEnabled ? (
                    <SlideTab.Navigator
                        initialRouteName="Farm"
                        tabBarPosition="bottom"
                        screenOptions={{
                            swipeEnabled: tabSwipeEnabled,
                            animationEnabled: true,
                        }}
                        tabBar={renderTabBar}
                    >
                        {navigationItems.map(item => (
                            <SlideTab.Screen
                                key={item.key}
                                name={item.key}
                                component={item.component}
                            />
                        ))}
                    </SlideTab.Navigator>
                ) : (
                    <StandardTab.Navigator
                        initialRouteName="Farm"
                        screenOptions={{
                            headerShown: false,
                        }}
                        tabBar={renderTabBar}
                    >
                        {navigationItems.map(item => (
                            <StandardTab.Screen
                                key={item.key}
                                name={item.key}
                                component={item.component}
                            />
                        ))}
                    </StandardTab.Navigator>
                )}
                <ChatbotFAB />
            </View>
        </BottomBarProvider>
    );
}

// ════════════════════════════════════════════════════════════════════
// Chatbot Floating Action Button
// ════════════════════════════════════════════════════════════════════
const ChatbotFAB = () => {
    const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
    const insets = useSafeAreaInsets();

    return (
        <TouchableOpacity
            style={[styles.fab, { bottom: 80 + Math.max(insets.bottom, 16) }]}
            onPress={() => navigation.navigate('Chatbot')}
            activeOpacity={0.8}
        >
            <ChatBotIcon width={32} height={32} />
        </TouchableOpacity>
    );
};

// ════════════════════════════════════════════════════════════════════
// Styles (used by fallback / classic tab bar)
// ════════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    fab: {
        position: 'absolute',
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.gray[200],
    },

    fallbackContainer: {
        flexDirection: 'row',
        borderRadius: borderRadius.full,
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
    fadeGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
        overflow: 'hidden',
    },

    // ── Wrapper ─────────────────────────────────────────────────────
    tabBarWrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },

    // ── Tab Items ──────────────────────────────────────────────────
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

    // ── Sliding Indicator ──────────────────────────────────────────
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
        shadowColor: colors.orange[800],
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },

    // ── Icons & Labels ─────────────────────────────────────────────
    iconContainer: {
        marginBottom: 2,
    },
    iconActiveContainer: {
        transform: [{ scale: 1.1 }],
    },
    tabLabel: {
        fontSize: 12,
        fontWeight: '400',
    },
    tabLabelActive: {
        color: colors.white,
        fontWeight: '500',
    },
});
