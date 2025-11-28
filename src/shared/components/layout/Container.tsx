/**
 * @file Container.tsx
 * @description Container component using Ant Design spacing components
 * @author Kindy
 * @created 2025-11-16
 * @updated 2025-11-17 - Migrated to use ANTD-RN WingBlank and WhiteSpace
 * @see https://rn.mobile.ant.design/components/wing-blank
 * @see https://rn.mobile.ant.design/components/white-space
 */
import React from 'react';
import {View, StyleSheet, ViewStyle} from 'react-native';
import WingBlank from '@ant-design/react-native/lib/wing-blank';

interface ContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: boolean;
}

/**
 * Container component that provides consistent horizontal spacing using ANTD-RN WingBlank
 *
 * @param children - Child components to render
 * @param style - Additional styles to apply
 * @param padding - Whether to apply horizontal padding (default: true)
 */
export function Container({children, style, padding = true}: ContainerProps) {
  if (padding) {
    return (
      <WingBlank size="md" style={[styles.container, style]}>
        {children}
      </WingBlank>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
