import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    StyleProp,
    ViewStyle,
} from 'react-native';
import { colors, spacing } from '@/styles';
import { HeaderSection } from '@/shared/components/layout/HeaderSection';

export interface TabItem {
    key: string;
    label: string;
}

export const CONTROL_TABS: TabItem[] = [
    { key: 'history', label: 'Lịch sử hoạt động' },
    { key: 'statistic', label: 'Thống kê cảm biến' },
];

interface HeaderDevicesProps {
    title?: string;
    tabs?: TabItem[];
    selectedTab?: string;
    onTabSelect?: (key: string) => void;
    onBackPress?: () => void;
    rightLabel?: string;
    rightComponent?: React.ReactNode;
    showBackButton?: boolean;
    includeSafeArea?: boolean;
    style?: StyleProp<ViewStyle>;
}

export const HeaderDevices: React.FC<HeaderDevicesProps> = ({
    title,
    tabs,
    selectedTab,
    onTabSelect,
    onBackPress,
    rightLabel,
    rightComponent,
    showBackButton = true,
    includeSafeArea = true,
    style,
}) => {
    const renderTabs = () => {
        if (tabs && tabs.length > 0) {
            return (
                <View style={styles.tabsContainer}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.tabsContent}
                    >
                        {tabs.map(tab => {
                            const isSelected = selectedTab === tab.key;
                            return (
                                <TouchableOpacity
                                    key={tab.key}
                                    style={[styles.tab, isSelected && styles.activeTab]}
                                    onPress={() => onTabSelect && onTabSelect(tab.key)}
                                    activeOpacity={0.7}
                                >
                                    <Text
                                        style={[styles.tabText, isSelected && styles.activeTabText]}
                                    >
                                        {tab.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>
            );
        }
        return null;
    };

    const centerNode = renderTabs();

    const rightNode = rightComponent ? (
        rightComponent
    ) : rightLabel ? (
        <Text style={styles.rightLabel}>{rightLabel}</Text>
    ) : undefined;

    return (
        <HeaderSection
            title={centerNode ? undefined : title}
            centerComponent={centerNode || undefined}
            rightComponent={rightNode}
            onBack={onBackPress}
            showBackButton={showBackButton}
            includeSafeArea={includeSafeArea}
            containerStyle={style}
        />
    );
};

const styles = StyleSheet.create({
    rightLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    // Tab styles
    tabsContainer: {
        flexDirection: 'row',
    },
    tabsContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tab: {
        paddingVertical: spacing.xs,
        marginHorizontal: spacing.sm,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: colors.primary,
    },
    tabText: {
        fontSize: 15,
        color: colors.textSecondary,
        fontWeight: '400',
    },
    activeTabText: {
        color: colors.primary,
        fontWeight: '600',
    },
});
