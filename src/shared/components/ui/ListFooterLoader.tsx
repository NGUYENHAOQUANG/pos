import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, spacing } from '@/styles';

export const ListFooterLoader: React.FC = () => (
    <View style={styles.container}>
        <ActivityIndicator color={colors.primary} />
    </View>
);

const styles = StyleSheet.create({
    container: {
        paddingVertical: spacing.md,
        alignItems: 'center',
    },
});
