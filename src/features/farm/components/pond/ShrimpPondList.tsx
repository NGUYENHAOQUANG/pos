import React from 'react';
import { StyleSheet, FlatList, ListRenderItem } from 'react-native';

import { spacing } from '@/styles';
import { useFarm } from '@/features/farm/store/farmStore';
import { ShrimpPond } from '@/features/farm/components/pond/ShrimpPond';
import { TagStatus } from '@/features/farm/components/pond/Tag';
import { PondData } from '@/features/farm/types/farm.types';

interface ShrimpPondListProps {
    data: PondData[];
    onPondPress?: (pond: PondData) => void;
    onInfoPress?: (pond: PondData) => void;
    onEndReached?: () => void;
    onEndReachedThreshold?: number;
    ListFooterComponent?: React.ComponentType | React.ReactElement | null;
    refreshing?: boolean;
    onRefresh?: () => void;
}

export const ShrimpPondList = React.forwardRef<FlatList, ShrimpPondListProps>(
    (
        {
            data,
            onPondPress,
            onInfoPress,
            onEndReached,
            onEndReachedThreshold = 0.5,
            ListFooterComponent,
            refreshing,
            onRefresh,
        },
        ref
    ) => {
        const { getLatestPondActivity, activeCycles, getCyclesByPondId } = useFarm();

        const checkHasCycle = (pondId: string) => {
            const currentCycle = activeCycles[pondId];
            if (currentCycle) return true;
            const cycles = getCyclesByPondId(pondId);
            // If there are any cycles associated, consider it valid (Active)
            // This matches ShrimpPond.tsx logic which falls back to cycles[0]
            return cycles.length > 0;
        };

        const getStatus = (item: PondData): TagStatus | undefined => {
            const hasCycle = checkHasCycle(item.id);

            if (hasCycle) {
                return 'active';
            }

            // Everything else is 'preparing' (Chuẩn bị) as per request
            return 'preparing';
        };

        const renderItem: ListRenderItem<PondData> = ({ item }) => {
            const latestActivity = getLatestPondActivity(item.id);
            const displayActivity = latestActivity?.lastActivity || item.lastActivity;
            const computedStatus = getStatus(item);

            const displayType = item.type;

            return (
                <ShrimpPond
                    name={item.name}
                    area={item.areaSqm ? `${Number(item.areaSqm).toFixed(2)} m²` : item.area || ''}
                    type={displayType}
                    lastUpdate={latestActivity?.lastUpdate || item.lastUpdate}
                    lastActivity={displayActivity}
                    status={computedStatus}
                    style={styles.item}
                    pondId={item.id || ''}
                    onInfoPress={() => onInfoPress?.(item)}
                    onCyclePress={() => {}}
                    onDetailPress={() => onPondPress?.(item)}
                />
            );
        };

        return (
            <FlatList
                ref={ref}
                data={data}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                onEndReached={onEndReached}
                onEndReachedThreshold={onEndReachedThreshold}
                ListFooterComponent={ListFooterComponent}
                refreshing={refreshing}
                onRefresh={onRefresh}
            />
        );
    }
);

const styles = StyleSheet.create({
    listContent: {
        padding: spacing.md,
    },
    item: {
        marginBottom: spacing.md,
    },
});
