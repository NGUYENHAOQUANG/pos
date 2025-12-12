import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { colors } from '@/styles/colors';
import { DataRow } from './DataRow';
import { CardHeader } from './CardHeader';

export interface ActivityData {
  label: string;
  value: string | number;
  unit?: string;
  isWarning?: boolean;
}

interface ActivityCardProps {
  title: string;
  data: ActivityData[];
  onEdit?: () => void;
  note?: string;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({ title, data, onEdit, note }) => {
  const [expanded, setExpanded] = useState(false);
  const MAX_VISIBLE_ITEMS = 4;
  const shouldCollapse = data.length > MAX_VISIBLE_ITEMS;

  // Lọc data hiển thị
  const visibleData = expanded || !shouldCollapse ? data : data.slice(0, MAX_VISIBLE_ITEMS);

  return (
    <View style={styles.card}>
      {/* 1. Header Component */}
      <CardHeader title={title} onEdit={onEdit} />

      {/* 2. Body Content */}
      <View style={styles.body}>
        {visibleData.map((item, index) => (
          <DataRow
            key={index}
            label={item.label}
            value={item.value}
            unit={item.unit}
            isWarning={item.isWarning}
          />
        ))}

        {/* Note Area */}
        {note && (
          <View style={styles.noteBox}>
            <Text style={styles.noteLabel}>Ghi chú:</Text>
            <Text style={styles.noteContent}>{note}</Text>
          </View>
        )}

        {/* 3. Footer Toggle (Xem thêm/Thu gọn) */}
        {shouldCollapse && (
          <TouchableOpacity style={styles.toggleButton} onPress={() => setExpanded(!expanded)}>
            <Text style={styles.toggleText}>{expanded ? 'Thu gọn' : 'Xem thêm'}</Text>
            <Icon
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={colors.primary}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
    overflow: 'hidden',
  },
  body: {
    padding: 12,
  },
  noteBox: {
    marginTop: 8,
    padding: 8,
    backgroundColor: colors.gray[50],
    borderRadius: 4,
  },
  noteLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
    fontWeight: '600',
  },
  noteContent: {
    fontSize: 13,
    color: colors.text,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  toggleText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
    marginRight: 4,
  },
});
