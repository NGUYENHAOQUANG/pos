import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const WaterUsage = () => {
  return (
    <View style={styles.container}>
      <Text>Water Usage Component</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});
