import React from 'react';
import { StyleSheet, FlatList, ListRenderItem } from 'react-native';

import { spacing } from '@/styles';
import { useFarm } from '@/features/farm/context/FarmContext';
import { ShrimpPond } from '@/features/farm/components/pond/ShrimpPond';
import { PondType } from '@/features/farm/components/pond/PondTypeTag';
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
    const { getLatestPondActivity } = useFarm();

    const getStatus = (pondType: PondType, activityName?: string): TagStatus | undefined => {
        if (!activityName || activityName === '-') return undefined;

        // Logic based on PondType and/or activity
        // Ao vèo (Nursery) and Ao sẵn sàng (Ready) should be 'preparing'
        if (pondType === 'Ao vèo' || pondType === 'Ao sẵn sàng' || pondType === 'Ao lắng') {
            return 'preparing';
        }

        // Ao nuôi (Grow-out) -> Active
        if (pondType === 'Ao nuôi') {
            return 'active';
        }

        return 'preparing'; // Default fallback
    };

    const renderItem: ListRenderItem<PondData> = ({ item }) => {
        const latestActivity = getLatestPondActivity(item.id);
        const displayActivity = latestActivity?.lastActivity || item.lastActivity;
        const computedStatus = getStatus(item.type, displayActivity);

        return (
            <ShrimpPond
                name={item.name}
                area={item.area}
                type={item.type}
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
