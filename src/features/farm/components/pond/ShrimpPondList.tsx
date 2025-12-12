import React from 'react';
import { StyleSheet, FlatList, ListRenderItem } from 'react-native';
import { spacing } from '@/styles';
import { ShrimpPond } from './ShrimpPond';
import { PondType } from './PondTypeTag';
import { TagStatus } from './Tag';

interface PondData {
  id: string;
  name: string;
  area: string;
  type: PondType;
  lastUpdate?: string;
  lastActivity?: string;
  status?: TagStatus; // From Tag.tsx
}

const DUMMY_DATA: PondData[] = [
  {
    id: '1',
    name: 'Tên ao',
    area: '{diện tích ao}',
    type: 'Ao vèo',
    lastUpdate: '01/12/2025, 08:00',
    lastActivity: 'Đo thông số môi trường',
  },
  {
    id: '2',
    name: 'Tên ao',
    area: '{diện tích ao}',
    type: 'Ao nuôi',
    lastUpdate: '12/12/2025, 19:40',
    lastActivity: 'Cho ăn',
  },
  {
    id: '3',
    name: 'Tên ao',
    area: '{diện tích ao}',
    type: 'Ao sẵn sàng',
    lastUpdate: '-',
    lastActivity: '-',
  },
  {
    id: '4', // Ao lắng - Empty state
    name: 'Tên ao',
    area: '{diện tích ao}',
    type: 'Ao lắng',
  },
  {
    id: '5', // Ao thải - Empty state
    name: 'Tên ao',
    area: '{diện tích ao}',
    type: 'Ao thải',
  },
];

interface ShrimpPondListProps {
  onPondPress?: (pond: PondData) => void;
}

import { useFarm } from '../../context/FarmContext';

export const ShrimpPondList: React.FC<ShrimpPondListProps> = ({ onPondPress }) => {
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
        onMenuPress={() => {}}
        onDetailPress={() => onPondPress?.(item)}
      />
    );
  };

  return (
    <FlatList
      data={DUMMY_DATA}
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
