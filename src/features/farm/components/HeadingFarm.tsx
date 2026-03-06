import React from 'react';
import { View } from 'react-native';
import { HeaderFarm } from '@/features/farm/components/HeaderFarm';
import { PondData, PondType } from '@/features/farm/types/farm.types';
import { TagStatus } from '@/features/farm/components/pond/Tag';
import { HeadingBar } from '@/shared/components/layout/HeadingBar';

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
        <View>
            {/* Optional Header for Pond Detail Mode */}
            {tabType === 'pond-detail' && (
                <HeaderFarm
                    type="detail"
                    title={pond?.name || 'Ao số 1'}
                    subtitle={
                        pond?.area
                            ? `${parseInt(pond.area.toString().replace(/[^0-9.]/g, ''), 10)} m²`
                            : '784 m²'
                    }
                    tagType={displayPondType || pond?.type || 'Ao vèo'}
                    status={status}
                    onBack={onBack}
                    menuOptions={menuOptions}
                />
            )}
            <HeadingBar
                tabs={tabs}
                selectedTab={selectedTab}
                onTabSelect={onTabSelect}
                flexTabs={fullWidth}
                containerStyle={{
                    paddingBottom: 16,
                    paddingTop: tabType === 'dashboard' ? 0 : 16,
                }}
            />
        </View>
    );
};
