import React from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView, StyleProp, ViewStyle } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { spacing } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
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
    const theme = useAppTheme();
    const themedStyles = getStyles(theme);

    const renderTabs = () => {
        if (tabs && tabs.length > 0) {
            return (
                <View style={themedStyles.tabsContainer}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={themedStyles.scrollContentContainer}
                    >
                        <View style={themedStyles.tabsContent}>
                            {tabs.map((tab, index) => {
                                const isSelected = selectedTab === tab.key;
                                const isLast = index === tabs.length - 1;
                                return (
                                    <TouchableOpacity
                                        key={tab.key}
                                        style={[
                                            themedStyles.tab,
                                            isSelected && themedStyles.activeTab,
                                            isLast && { marginRight: 0 },
                                        ]}
                                        onPress={() => onTabSelect && onTabSelect(tab.key)}
                                        activeOpacity={0.7}
                                    >
                                        <Text
                                            style={[
                                                themedStyles.tabText,
                                                isSelected && themedStyles.activeTabText,
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
        <Text style={themedStyles.rightLabel}>{rightLabel}</Text>
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

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        rightLabel: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.text,
        },
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
            borderBottomColor: theme.border,
        },
        tab: {
            paddingVertical: spacing.xs + 4,
            marginRight: 16,
            marginLeft: 0,
            borderBottomWidth: 2,
            borderBottomColor: 'transparent',
        },
        activeTab: {
            borderBottomColor: theme.primary,
        },
        tabText: {
            fontSize: 14,
            color: theme.textSecondary,
            fontWeight: '400',
        },
        activeTabText: {
            color: theme.primary,
            fontWeight: '700',
        },
    });
