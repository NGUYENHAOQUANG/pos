import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '@/styles';
import { ShrimpPondList } from '@/features/farm/components/pond/ShrimpPondList';

export const ShrimpPondListScreens = () => {
  return (
    <View style={styles.container}>
      <ShrimpPondList />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
});
