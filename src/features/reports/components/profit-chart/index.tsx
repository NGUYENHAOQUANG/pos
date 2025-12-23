import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const ProfitChart = () => {
  return (
    <View style={styles.container}>
      <Text>Profit Chart Component</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});
