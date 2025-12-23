import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const ProdChart = () => {
  return (
    <View style={styles.container}>
      <Text>Production Chart Component</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});
