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
                        contentContainerStyle={styles.scrollContentContainer}
                    >
                        <View style={styles.tabsContent}>
                            {tabs.map((tab, index) => {
                                const isSelected = selectedTab === tab.key;
                                const isLast = index === tabs.length - 1;
                                return (
                                    <TouchableOpacity
                                        key={tab.key}
                                        style={[
                                            styles.tab,
                                            isSelected && styles.activeTab,
                                            isLast && { marginRight: 0 },
                                        ]}
                                        onPress={() => onTabSelect && onTabSelect(tab.key)}
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
                        </View>
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
        width: '100%',
    },
    scrollContentContainer: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    tabsContent: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    tab: {
        paddingVertical: spacing.xs + 4,
        marginRight: 16, // Exact 16px gap
        marginLeft: 0,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: colors.primary,
    },
    tabText: {
        fontSize: 14,
        color: colors.textSecondary,
        fontWeight: '400',
    },
    activeTabText: {
        color: colors.primary,
        fontWeight: '700',
    },
});
