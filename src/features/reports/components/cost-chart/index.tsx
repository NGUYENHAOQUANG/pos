import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const CostChart = () => {
  return (
    <View style={styles.container}>
      <Text>Cost Chart Component</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});
