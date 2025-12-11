import React from 'react';
import { StyleSheet, FlatList, ListRenderItem } from 'react-native';
import { spacing } from '@/styles';
import { ShrimpPond } from './ShrimpPond';
import { PondType } from './PondTypeTag';

interface PondData {
  id: string;
  name: string;
  area: string;
  type: PondType;
  lastUpdate?: string;
  lastActivity?: string;
}

const DUMMY_DATA: PondData[] = [
  {
    id: '1',
    name: 'Tên ao',
    area: '{diện tích ao}',
    type: 'Ao vèo',
    lastUpdate: '-',
    lastActivity: '-',
  },
  {
    id: '2',
    name: 'Tên ao',
    area: '{diện tích ao}',
    type: 'Ao nuôi',
    lastUpdate: '-',
    lastActivity: '-',
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

export const ShrimpPondList = () => {
  const renderItem: ListRenderItem<PondData> = ({ item }) => (
    <ShrimpPond
      name={item.name}
      area={item.area}
      type={item.type}
      lastUpdate={item.lastUpdate}
      lastActivity={item.lastActivity}
      style={styles.item}
      onMenuPress={() => {}}
      onDetailPress={() => {}}
    />
  );

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
