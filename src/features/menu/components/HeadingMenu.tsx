import React from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { colors, spacing } from '@/styles';

export interface MenuTabItem {
    key: string;
    label: string;
    count?: number;
}

interface HeadingMenuProps {
    selectedTab: string;
    onTabSelect: (tab: string) => void;
    counts?: {
        all: number;
        active: number;
        ended: number;
    };
    tabs?: MenuTabItem[];
}

export const HeadingMenu: React.FC<HeadingMenuProps> = ({
    selectedTab,
    onTabSelect,
    counts = { all: 0, active: 0, ended: 0 },
    tabs: customTabs,
}) => {
    const tabs: MenuTabItem[] = customTabs || [
        { key: 'all', label: 'Tất cả', count: counts.all },
        // { key: 'active', label: 'Hoạt động', count: counts.active },
        { key: 'active', label: 'Đang nuôi', count: counts.active },
        { key: 'ended', label: 'Đã kết thúc', count: counts.ended },
    ];

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {tabs.map(tab => {
                    const isSelected = selectedTab === tab.key;
                    return (
                        <TouchableOpacity
                            key={tab.key}
                            style={styles.tab}
                            onPress={() => onTabSelect(tab.key)}
                            activeOpacity={0.7}
                        >
                            <View
                                style={[styles.tabContent, isSelected && styles.activeTabContent]}
                            >
                                <Text style={[styles.tabText, isSelected && styles.activeTabText]}>
                                    {tab.label} {tab.count !== undefined ? `(${tab.count})` : ''}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    scrollContent: {
        paddingHorizontal: spacing.md,
    },
    tab: {
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.lg,
    },
    tabContent: {
        paddingVertical: spacing.md,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
        alignItems: 'center',
    },
    activeTabContent: {
        borderBottomColor: colors.primary,
    },
    tabText: {
        fontSize: 15,
        color: colors.text,
        fontWeight: '400',
    },
    activeTabText: {
        color: colors.primary,
        fontWeight: '600',
    },
});
