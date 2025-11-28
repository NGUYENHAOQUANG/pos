import React from 'react';
import { View, StyleSheet, Image } from 'react-native';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
}

export function Logo({ size = 'small' }: LogoProps) {
  const sizeMap = {
    small: { width: 80, height: 30 },
    medium: { width: 120, height: 45 },
    large: { width: 160, height: 60 },
  };

  const dimensions = sizeMap[size];

  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/logo.jpg')}
        style={[styles.logo, dimensions]}
        resizeMode="contain"
      />
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
