import React from 'react';
import { StyleSheet, FlatList, ListRenderItem } from 'react-native';

import { spacing } from '@/styles';
import { useFarm } from '@/features/farm/context/FarmContext';
import { ShrimpPond } from '@/features/farm/components/pond/ShrimpPond';
import { TagStatus } from '@/features/farm/components/pond/Tag';
import { PondData } from '@/features/farm/types/farm.types';

interface ShrimpPondListProps {
    data: PondData[];
    onPondPress?: (pond: PondData) => void;
    onInfoPress?: (pond: PondData) => void;
}

export const ShrimpPondList: React.FC<ShrimpPondListProps> = ({
    data,
    onPondPress,
    onInfoPress,
}) => {
    const { getLatestPondActivity, activeCycles, getCyclesByPondId } = useFarm();

    const checkHasCycle = (pondId: string) => {
        const currentCycle = activeCycles[pondId];
        if (currentCycle) return true;
        const cycles = getCyclesByPondId(pondId);
        return cycles.some(c => c.receivingPonds?.includes(pondId));
    };

    const getStatus = (item: PondData, activityName?: string): TagStatus | undefined => {
        if (!activityName || activityName === '-') return undefined;

        // Ao sẵn sàng: Only 'preparing' if it has a cycle
        if (item.type === 'Ao sẵn sàng') {
            return checkHasCycle(item.id) ? 'preparing' : undefined;
        }

        // Ao vèo, Ao lắng -> Always 'preparing' tag if they have activity
        if (['Ao vèo', 'Ao lắng'].includes(item.type)) {
            return 'preparing';
        }

        // Ao nuôi -> Always 'active' tag if they have activity
        if (item.type === 'Ao nuôi') {
            return 'active';
        }

        if (item.status === 'Đang hoạt động') return 'active';
        if (item.status === 'Chuẩn bị') return 'preparing';

        return undefined; // Default fallback
    };

    const renderItem: ListRenderItem<PondData> = ({ item }) => {
        const latestActivity = getLatestPondActivity(item.id);
        const displayActivity = latestActivity?.lastActivity || item.lastActivity;
        const computedStatus = getStatus(item, displayActivity);

        const hasCycle = checkHasCycle(item.id);
        // Force type to 'Ao vèo' if it is 'Ao sẵn sàng' AND has active cycle
        const displayType = (item.type === 'Ao sẵn sàng' && hasCycle ? 'Ao vèo' : item.type) as any;

        return (
            <ShrimpPond
                name={item.name}
                area={item.area}
                type={displayType}
                lastUpdate={latestActivity?.lastUpdate || item.lastUpdate}
                lastActivity={displayActivity}
                status={computedStatus}
                style={styles.item}
                pondId={item.id}
                onInfoPress={() => onInfoPress?.(item)}
                onCyclePress={() => {}}
                onDetailPress={() => onPondPress?.(item)}
            />
        );
    };

    return (
        <FlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
        />
    );
};

const styles = StyleSheet.create({
    listContent: {
        padding: spacing.md,
    },
    item: {
        marginBottom: spacing.md,
    },
});
