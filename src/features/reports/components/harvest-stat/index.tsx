import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const HarvestStat = () => {
  return (
    <View style={styles.container}>
      <Text>Harvest Statistics Component</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});
