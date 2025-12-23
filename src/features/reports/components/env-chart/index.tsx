import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const EnvironmentChart = () => {
  return (
    <View style={styles.container}>
      <Text>Environment Chart Component</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});
