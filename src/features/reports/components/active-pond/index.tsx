import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const ActivePondChart = () => {
  return (
    <View style={styles.container}>
      <Text>Active Pond Component</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});
