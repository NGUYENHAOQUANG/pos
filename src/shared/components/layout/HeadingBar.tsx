import React, { useState, useCallback, useEffect, useRef } from 'react';
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
}

export const HeadingBar: React.FC<HeadingBarProps> = ({
    tabs,
    selectedTab,
    onTabSelect,
    containerStyle,
    flexTabs = false,
}) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    // Store layout measurements for each tab
    const [tabLayouts, setTabLayouts] = useState<Record<string, TabLayout>>({});
    const indicatorX = useSharedValue(0);
    const indicatorWidth = useSharedValue(0);
    const [isReady, setIsReady] = useState(false);

    // Auto-scroll logic
    const scrollViewRef = useRef<ScrollView>(null);
    const [scrollViewWidth, setScrollViewWidth] = useState(0);

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

        // Auto-scroll to center
        if (scrollViewRef.current && scrollViewWidth > 0 && !flexTabs) {
            const targetX = layout.x + layout.width / 2 - scrollViewWidth / 2;
            scrollViewRef.current.scrollTo({
                x: Math.max(0, targetX),
                animated: true,
            });
        }
    }, [selectedTab, tabLayouts, indicatorX, indicatorWidth, isReady, scrollViewWidth, flexTabs]);

    // Animated style for the sliding indicator
    const indicatorStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: indicatorX.value }],
        width: indicatorWidth.value,
    }));

    const renderTabs = tabs.map(tab => {
        const isSelected = selectedTab === tab.key;
        return (
            <TouchableOpacity
                key={tab.key}
                style={[styles.tab, flexTabs ? { flex: 1 } : { flexGrow: 1, flexShrink: 0 }]}
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
            <View style={styles.backgroundWrapper}>
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
                            ref={scrollViewRef}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={[styles.scrollContent, { flexGrow: 1 }]}
                            onLayout={e => setScrollViewWidth(e.nativeEvent.layout.width)}
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
