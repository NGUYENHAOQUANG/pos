import React from 'react';
import { View, ActivityIndicator, StyleSheet, ColorValue } from 'react-native';
import { colors } from '@/styles';

interface LoadingProps {
    size?: 'small' | 'large';
    color?: ColorValue;
}

export const Loading: React.FC<LoadingProps> = ({ size = 'large', color = colors.primary }) => {
    return (
        <View style={styles.container}>
            <ActivityIndicator size={size} color={color} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
});
