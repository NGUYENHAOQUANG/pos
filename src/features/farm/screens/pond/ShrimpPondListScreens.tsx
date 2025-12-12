import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '@/styles';
import { ShrimpPondList } from '@/features/farm/components/pond/ShrimpPondList';

interface ShrimpPondListScreensProps {
  onPondPress?: (pond: any) => void;
}

export const ShrimpPondListScreens: React.FC<ShrimpPondListScreensProps> = ({ onPondPress }) => {
  return (
    <View style={styles.container}>
      <ShrimpPondList onPondPress={onPondPress} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
});
