import React from 'react';
import { TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, borderRadius } from '@/styles';

interface ButtonHeaderProps {
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const ButtonHeader: React.FC<ButtonHeaderProps> = ({ onPress, style }) => {
  return (
    <TouchableOpacity style={[styles.menuButton, style]} onPress={onPress} activeOpacity={0.7}>
      <Ionicons name="ellipsis-vertical" size={20} color={colors.text} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.borderDark,
    backgroundColor: colors.white,
  },
});
