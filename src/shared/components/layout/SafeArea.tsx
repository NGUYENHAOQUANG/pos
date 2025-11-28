/**
 * @file SafeArea.tsx
 * @description SafeArea component
 * @author Kindy
 * @created 2025-11-16
 */
import React from 'react';
import {SafeAreaView, StyleSheet, ViewStyle} from 'react-native';
import {colors} from '@/styles/colors';

interface SafeAreaProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function SafeArea({children, style}: SafeAreaProps) {
  return (
    <SafeAreaView style={[styles.container, style]}>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});

