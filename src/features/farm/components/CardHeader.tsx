import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { colors } from '@/styles/colors';

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
          <Icon name="edit-2" size={16} color={colors.textSecondary} />
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
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.gray[50],
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
});
