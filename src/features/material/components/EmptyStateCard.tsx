import React from 'react';
import { View, Text, StyleSheet, Image, Platform, ImageSourcePropType, ViewStyle } from 'react-native';
import { Button } from '@/shared/components/buttons/Button';
import { colors, spacing, borderRadius, typography } from '@/styles';

interface EmptyStateCardProps {
    message: string;
    buttonTitle: string;
    onPress: () => void;
    imageSource?: ImageSourcePropType;
    buttonStyle?: ViewStyle;
}

export const EmptyStateCard: React.FC<EmptyStateCardProps> = ({
    message,
    buttonTitle,
    onPress,
    imageSource = require('@/assets/images/Material.png'),
    buttonStyle,
}) => {
    return (
        <View style={styles.container}>
            <Image
                source={imageSource}
                style={styles.image}
                resizeMode="contain"
            />
            <Text style={styles.text}>{message}</Text>
            <Button
                title={buttonTitle}
                onPress={onPress}
                iconLeft="add"
                variant="primary"
                size="medium"
                style={StyleSheet.flatten([styles.button, buttonStyle])}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        padding: spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    image: {
        width: 100,
        height: 100,
        marginBottom: spacing.md,
    },
    text: {
        fontSize: 14,
        color: colors.text,
        textAlign: 'center',
        marginBottom: spacing.lg,
        fontFamily: typography.fontFamily.regular,
    },
    button: {
        minWidth: 160,
    },
});
