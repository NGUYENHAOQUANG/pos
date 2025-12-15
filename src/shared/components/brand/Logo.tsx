import React from 'react';
import { View, StyleSheet } from 'react-native';
import LogoSvg from '@/assets/images/Mebione-logo-auth.svg';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
}

export function Logo({ size = 'small' }: LogoProps) {
  const sizeMap = {
    small: { width: 20, height: 30 },
    medium: { width: 110, height: 35 },
    large: { width: 160, height: 60 },
  };

  const dimensions = sizeMap[size];

  return (
    <View style={styles.container}>
      <LogoSvg width={dimensions.width} height={dimensions.height} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    // Dimensions will be applied from size prop
  },
});
