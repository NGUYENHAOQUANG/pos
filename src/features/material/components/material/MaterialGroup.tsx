import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, borderRadius, spacing } from '@/styles';
import { MaterialGroupType } from '../../types/material.types';

interface MaterialGroupProps {
  group: MaterialGroupType;
}

export const MaterialGroup: React.FC<MaterialGroupProps> = ({ group }) => {
  const getStyle = (type: MaterialGroupType) => {
    switch (type) {
      case 'Nuôi':
      case 'Thức ăn': // Keep for backward compatibility if needed
        return {
          backgroundColor: '#FFF2E8', // Light orange
          color: '#FA541C', // Dark orange
          borderColor: '#FFBB96',
        };
      case 'Vật tư nội bộ':
        return {
          backgroundColor: '#E6F7FF', // Light blue
          color: '#1890FF', // Dark blue
          borderColor: '#91D5FF',
        };
      case 'CCDC':
        return {
          backgroundColor: '#F9F0FF', // Light purple
          color: '#722ED1', // Dark purple
          borderColor: '#D3ADF7',
        };
      case 'Thiết bị điện':
        return {
          backgroundColor: '#FFF1F0', // Light red
          color: '#F5222D', // Dark red
          borderColor: '#FFA39E',
        };
      case 'Chi phí khác':
        return {
          backgroundColor: '#F5F5F5', // Light gray
          color: '#595959', // Dark gray
          borderColor: '#D9D9D9',
        };
      default:
        return {
          backgroundColor: '#F5F5F5',
          color: colors.text,
          borderColor: colors.border,
        };
    }
  };

  const style = getStyle(group);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: style.backgroundColor, borderColor: style.borderColor },
      ]}
    >
      <Text style={[styles.text, { color: style.color }]}>{group}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    alignSelf: 'flex-start', // Wrap content
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 12,
    fontWeight: '400',
  },
});
