import React, { useState, useCallback } from 'react';
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

    const handleLayout = useCallback((event: LayoutChangeEvent) => {
        setContainerWidth(event.nativeEvent.layout.width);
    }, []);

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
                    isSelected && styles.activeTab,
                ]}
                onPress={() => {
                    haptics.light();
                    onTabSelect(tab.key);
                }}
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
                        <View style={[styles.scrollContent, { width: '100%' }]}>{renderTabs}</View>
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
            backgroundColor: theme.backgroundTertiary, // Using backgroundTertiary for the grayish background
            borderRadius: borderRadius.full,
            marginHorizontal: spacing.md,
            padding: 4,
            flexDirection: 'row',
            alignItems: 'center',
            // No overflow:hidden here - that would clip the background at the corners on Android
        },
        // Separate inner view that does the actual clip of scrollable content
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
        tab: {
            height: 36,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: borderRadius.full,
            justifyContent: 'center',
            alignItems: 'center',
        },
        activeTab: {
            backgroundColor: theme.backgroundButtonActive,
            borderWidth: 0.5,
            borderColor: theme.defaultBorder,
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
