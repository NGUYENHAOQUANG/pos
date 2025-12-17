import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '@/styles/colors';
import EditIcon from '@/assets/images/Icon/IconFarm/Edit.svg';

interface CardHeaderProps {
  title: string;
  onEdit?: () => void;
  style?: any;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ title, onEdit, style }) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
      {onEdit && (
        <TouchableOpacity onPress={onEdit} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <EditIcon style={styles.editIcon} color={colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 8,
    backgroundColor: '#00000005',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 22,
  },
  editIcon: {
    width: '100%',
    height: '100%',
  },
});
