import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ViewStyle,
    StyleProp,
    LayoutChangeEvent,
} from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { borderRadius, spacing } from '@/styles';
import { haptics } from '@/shared/utils/haptics';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

/** Spring config for smooth, snappy sliding */
const SPRING_CONFIG = {
    damping: 20,
    stiffness: 200,
    mass: 0.8,
};

/** Layout info for each tab */
interface TabLayout {
    x: number;
    width: number;
}

export interface HeadingBarItem {
    key: string;
    label: string;
    count?: number;
}

export interface HeadingBarProps {
    tabs: HeadingBarItem[];
    selectedTab: string;
    onTabSelect: (tab: string) => void;
    containerStyle?: StyleProp<ViewStyle>;
    flexTabs?: boolean;
    /** Spread tabs evenly but still allow horizontal scroll on small screens */
    spreadTabs?: boolean;
}

export const HeadingBar: React.FC<HeadingBarProps> = ({
    tabs,
    selectedTab,
    onTabSelect,
    containerStyle,
    flexTabs = false,
    spreadTabs = false,
}) => {
    // Track container width for spreadTabs calculation
    const [containerWidth, setContainerWidth] = useState(0);
    const theme = useAppTheme();
    const styles = getStyles(theme);

    // Store layout measurements for each tab
    const [tabLayouts, setTabLayouts] = useState<Record<string, TabLayout>>({});
    const indicatorX = useSharedValue(0);
    const indicatorWidth = useSharedValue(0);
    const [isReady, setIsReady] = useState(false);

    const handleLayout = useCallback((event: LayoutChangeEvent) => {
        setContainerWidth(event.nativeEvent.layout.width);
    }, []);

    // Measure each tab's layout
    const handleTabLayout = useCallback((key: string, event: LayoutChangeEvent) => {
        const { x, width } = event.nativeEvent.layout;
        setTabLayouts(prev => ({ ...prev, [key]: { x, width } }));
    }, []);

    // Animate indicator when selectedTab or layouts change
    useEffect(() => {
        const layout = tabLayouts[selectedTab];
        if (!layout) return;

        if (!isReady) {
            // First render — snap immediately without animation
            indicatorX.value = layout.x;
            indicatorWidth.value = layout.width;
            setIsReady(true);
        } else {
            // Subsequent changes — spring animation
            indicatorX.value = withSpring(layout.x, SPRING_CONFIG);
            indicatorWidth.value = withSpring(layout.width, SPRING_CONFIG);
        }
    }, [selectedTab, tabLayouts, indicatorX, indicatorWidth, isReady]);

    // Animated style for the sliding indicator
    const indicatorStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: indicatorX.value }],
        width: indicatorWidth.value,
    }));

    // Calculate min width per tab when spreadTabs is enabled
    // Subtract padding (4px each side = 8px total) from container width
    const tabMinWidth =
        spreadTabs && containerWidth > 0 && tabs.length > 0
            ? (containerWidth - 8) / tabs.length
            : 0;

    const renderTabs = tabs.map(tab => {
        const isSelected = selectedTab === tab.key;
        return (
            <TouchableOpacity
                key={tab.key}
                style={[
                    styles.tab,
                    flexTabs && { flex: 1 },
                    spreadTabs && tabMinWidth > 0 && { minWidth: tabMinWidth },
                ]}
                onPress={() => {
                    haptics.light();
                    onTabSelect(tab.key);
                }}
                onLayout={event => handleTabLayout(tab.key, event)}
                activeOpacity={0.7}
            >
                <Text style={[styles.tabText, isSelected && styles.activeTabText]}>
                    {tab.label} {tab.count !== undefined ? `(${tab.count})` : ''}
                </Text>
            </TouchableOpacity>
        );
    });

    return (
        <View style={containerStyle}>
            {/* Outer grey pill - provides background color and pill shape */}
            <View style={styles.backgroundWrapper} onLayout={spreadTabs ? handleLayout : undefined}>
                {/* Inner clip view - clips scrollable tab content to pill shape */}
                <View style={styles.scrollClip}>
                    {flexTabs ? (
                        <View style={[styles.scrollContent, { width: '100%' }]}>
                            {/* Sliding indicator inside content */}
                            {isReady && (
                                <Animated.View style={[styles.indicator, indicatorStyle]} />
                            )}
                            {renderTabs}
                        </View>
                    ) : (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={[
                                styles.scrollContent,
                                spreadTabs && { flexGrow: 1 },
                            ]}
                            style={styles.scrollView}
                        >
                            {/* Sliding indicator inside ScrollView content */}
                            {isReady && (
                                <Animated.View style={[styles.indicator, indicatorStyle]} />
                            )}
                            {renderTabs}
                        </ScrollView>
                    )}
                </View>
            </View>
        </View>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        backgroundWrapper: {
            height: 40,
            backgroundColor: theme.backgroundTertiary,
            borderRadius: borderRadius.full,
            marginHorizontal: spacing.md,
            padding: 4,
            flexDirection: 'row',
            alignItems: 'center',
        },
        scrollClip: {
            flex: 1,
            height: 36,
            borderRadius: borderRadius.full,
            overflow: 'hidden',
        },
        scrollView: {
            flexGrow: 0,
        },
        scrollContent: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        indicator: {
            position: 'absolute',
            top: 0,
            left: 0,
            height: 36,
            borderRadius: borderRadius.full,
            backgroundColor: theme.backgroundButtonActive,
            borderWidth: 0.5,
            borderColor: theme.defaultBorder,
        },
        tab: {
            height: 36,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: borderRadius.full,
            justifyContent: 'center',
            alignItems: 'center',
        },
        tabText: {
            fontSize: 14,
            lineHeight: 20,
            color: theme.textSecondary,
            fontWeight: '400',
        },
        activeTabText: {
            color: theme.text,
            fontWeight: '600',
        },
    });
