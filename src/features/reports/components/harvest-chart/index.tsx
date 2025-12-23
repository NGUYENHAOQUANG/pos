import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const HarvestChart = () => {
  return (
    <View style={styles.container}>
      <Text>Harvest Chart Component</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});
