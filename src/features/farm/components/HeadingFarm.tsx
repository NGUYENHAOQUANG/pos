import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing } from '@/styles';
import { HeaderFarm } from '@/features/farm/components/HeaderFarm';
import { PondData } from '@/features/farm/types/farm.types';
import { PondType } from '@/features/farm/components/pond/PondTypeTag';
import { TagStatus } from '@/features/farm/components/pond/Tag';

export interface TabItem {
    key: string;
    label: string;
    count?: number;
}

interface HeadingFarmProps {
    selectedTab: string;
    onTabSelect: (tab: string) => void;
    /**
     * Optional custom tabs. If not provided, defaults based on tabType.
     */
    tabs?: TabItem[];
    counts?: {
        all: number;
        active: number;
        preparing: number;
    };
    fullWidth?: boolean;
    tabType?: 'dashboard' | 'pond-detail';

    // Header props for 'pond-detail'
    pond?: PondData;
    displayPondType?: PondType; // Allow overriding the type displayed in header
    status?: TagStatus; // Added status prop
    onBack?: () => void;
    menuOptions?: { value: string; onMenuOptionPress: () => void }[];
}

export const HeadingFarm: React.FC<HeadingFarmProps> = ({
    selectedTab,
    onTabSelect,
    tabs: customTabs,
    counts = { all: 0, active: 0, preparing: 0 },
    fullWidth = false,
    tabType = 'dashboard',
    pond,
    displayPondType,
    status,
    onBack,
    menuOptions,
}) => {
    const dashboardTabs: TabItem[] = [
        { key: 'all', label: 'Tất cả', count: counts.all },
        { key: 'active', label: 'Đang hoạt động', count: counts.active },
        { key: 'preparing', label: 'Đang chuẩn bị', count: counts.preparing },
    ];

    const pondDetailTabs: TabItem[] = [
        { key: 'work', label: 'Công việc' },
        { key: 'log', label: 'Nhật ký công việc' },
    ];

    const tabs = customTabs || (tabType === 'pond-detail' ? pondDetailTabs : dashboardTabs);

    return (
        <View style={styles.container}>
            {/* Optional Header for Pond Detail Mode */}
            {tabType === 'pond-detail' && (
                <HeaderFarm
                    type="detail"
                    title={pond?.name || 'Ao số 1'}
                    subtitle={pond?.area || '784 m²'}
                    tagType={displayPondType || pond?.type || 'Ao vèo'}
                    status={status}
                    onBack={onBack}
                    menuOptions={menuOptions}
                />
            )}
            <ScrollView
                horizontal={!fullWidth}
                scrollEnabled={!fullWidth}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={[styles.scrollContent, fullWidth && styles.fullWidthContent]}
            >
                {tabs.map(tab => {
                    const isSelected = selectedTab === tab.key;
                    return (
                        <TouchableOpacity
                            key={tab.key}
                            style={[styles.tab, fullWidth && styles.fullWidthTab]}
                            onPress={() => onTabSelect(tab.key)}
                            activeOpacity={0.7}
                        >
                            <View
                                style={[
                                    styles.tabContent,
                                    isSelected && styles.activeTabContent,
                                    fullWidth && styles.tabContentFixed, // Fixed width for fullWidth mode
                                    !fullWidth && isSelected && styles.activeTab, // Keep old behavior for non-fullWidth if needed
                                ]}
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
    fullWidthContent: {
        width: '100%',
        paddingHorizontal: 0,
        flexDirection: 'row',
    },
    tab: {
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.lg,
    },
    fullWidthTab: {
        flex: 1,
        marginRight: 0,
        paddingVertical: 0,
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
    activeTab: {
        // Legacy support if needed
    },
    tabContentFixed: {
        width: 165,
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
