import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ViewStyle,
    StyleProp,
} from 'react-native';
import { borderRadius, colors, spacing } from '@/styles';

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
    const renderTabs = tabs.map(tab => {
        const isSelected = selectedTab === tab.key;
        return (
            <TouchableOpacity
                key={tab.key}
                style={[styles.tab, flexTabs && { flex: 1 }, isSelected && styles.activeTab]}
                onPress={() => onTabSelect(tab.key)}
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
                        <View style={[styles.scrollContent, { width: '100%' }]}>{renderTabs}</View>
                    ) : (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.scrollContent}
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

const styles = StyleSheet.create({
    backgroundWrapper: {
        height: 40,
        backgroundColor: colors.gray[100],
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
        backgroundColor: colors.white,
        borderWidth: 0.5,
        borderColor: colors.border,
    },
    tabText: {
        fontSize: 14,
        lineHeight: 20,
        color: colors.gray[500],
        fontWeight: '400',
    },
    activeTabText: {
        color: colors.text,
        fontWeight: '600',
    },
});
