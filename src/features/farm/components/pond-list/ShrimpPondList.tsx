import React from 'react';
import { StyleSheet, FlatList, ListRenderItem } from 'react-native';

import { spacing } from '@/styles';
import { ShrimpPond } from '@/features/farm/components/pond-list/ShrimpPond';
import { TagStatus } from '@/features/farm/components/pond/Tag';
import { PondData } from '@/features/farm/types/farm.types';
import { formatDateWithTime } from '@/features/farm/utils/dateUtils';

interface ShrimpPondListProps {
    data: PondData[];
    onPondPress?: (pond: PondData) => void;
    onInfoPress?: (pond: PondData) => void;
    onEndReached?: () => void;
    onEndReachedThreshold?: number;
    ListFooterComponent?: React.ComponentType | React.ReactElement | null;
    refreshing?: boolean;
    onRefresh?: () => void;
    zoneId?: string;
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
            if (item.status === 'Framing') return 'active';
            if (item.status === 'Available') return 'preparing';

            return undefined;
        };

        const renderItem: ListRenderItem<PondData> = ({ item }) => {
            const computedStatus = getStatus(item);
            const displayType = item.type!;

            return (
                <ShrimpPond
                    name={item.name}
                    area={
                        item.areaSqm
                            ? `${Number(item.areaSqm).toFixed(2)} m²`
                            : item.area?.toString() || ''
                    }
                    type={displayType}
                    lastUpdate={
                        item.lastUpdate ? formatDateWithTime(new Date(item.lastUpdate)) : '-'
                    }
                    lastActivity={item.lastActivity || '-'}
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
