/**
 * @file BackButton.tsx
 * @description Back button component using Ant Design React Native
 * @updated 2025-11-17 - Migrated to ANTD-RN Button with ghost type
 *
 * @see https://rn.mobile.ant.design/components/button
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button as AntdButton } from '@ant-design/react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { colors, sizes } from '@/styles';

interface BackButtonProps {
  onPress?: () => void;
}

export function BackButton({ onPress }: BackButtonProps) {
  const navigation = useNavigation();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    }
  };

  return (
    <View style={styles.container}>
      <AntdButton
        type="ghost"
        onPress={handlePress}
        style={styles.button}
      >
        <Ionicons name="arrow-back" size={sizes.icon.md} color={colors.text} />
      </AntdButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    zIndex: 1,
  },
  button: {
    width: sizes.icon.xl,
    height: sizes.icon.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
});
