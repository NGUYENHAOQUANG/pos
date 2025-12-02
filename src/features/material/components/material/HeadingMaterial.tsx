import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { colors, spacing } from '@/styles';

export type TabType = 'list' | 'history' | 'inventory';

interface HeadingMeterialProps {
    selectedTab: TabType;
    onTabSelect: (tab: TabType) => void;
}

export const HeadingMeterial: React.FC<HeadingMeterialProps> = ({
    selectedTab,
    onTabSelect,
}) => {
    const tabs: { key: TabType; label: string }[] = [
        { key: 'list', label: 'Danh sách vật tư' },
        { key: 'history', label: 'Lịch sử nhập kho' },
        { key: 'inventory', label: 'Kiểm kê' },
    ];

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {tabs.map((tab) => {
                    const isSelected = selectedTab === tab.key;
                    return (
                        <TouchableOpacity
                            key={tab.key}
                            style={[styles.tab, isSelected && styles.activeTab]}
                            onPress={() => onTabSelect(tab.key)}
                            activeOpacity={0.7}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    isSelected && styles.activeTabText,
                                ]}
                            >
                                {tab.label}
                            </Text>
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
        paddingVertical: spacing.md,
        marginRight: spacing.lg,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: colors.primary,
    },
    tabText: {
        fontSize: 15,
        color: colors.textSecondary || '#666', // Fallback if textSecondary isn't defined
        fontWeight: '400',
    },
    activeTabText: {
        color: colors.primary,
        fontWeight: '600',
    },
});
