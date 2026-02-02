import React from 'react';
import { StyleSheet, FlatList, ListRenderItem } from 'react-native';

import { spacing } from '@/styles';
import { useFarmStore } from '@/features/farm/store/farmStore';
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
    zoneId?: string; // Add prop to pass selected zone
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
            zoneId,
        },
        ref
    ) => {
        const getStatus = (item: PondData): TagStatus | undefined => {
            // Strict mapping based on Backend PondStatusEnum
            if (item.status === 'Framing') return 'active';
            if (item.status === 'Available') return 'preparing';

            // Null or other values -> no tag
            return undefined;
        };

        // Use individual selectors instead of useFarm() to prevent unnecessary re-renders
        const getLatestPondActivity = useFarmStore(state => state.getLatestPondActivity);

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
                    effectiveZoneId={zoneId}
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
