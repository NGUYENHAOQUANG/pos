import React from 'react';
import { View, Text, StyleSheet, Image, Platform } from 'react-native';
import { Button } from '@/shared/components/buttons/Button';
import { colors, spacing, borderRadius, typography } from '@/styles';

interface AddMaterialCardProps {
    onPressAdd?: () => void;
}

export const AddWarehouseCard: React.FC<AddMaterialCardProps> = ({
    onPressAdd,
}) => {
    return (
        <View style={styles.container}>
            <Image
                source={require('@/assets/images/Material.png')}
                style={styles.image}
                resizeMode="contain"
            />
            <Text style={styles.text}>Chưa có phiếu nhập kho nào được tạo.</Text>
            <Button
                title="Tạo phiếu nhập kho"
                onPress={() => onPressAdd?.()}
                iconLeft="add"
                variant="primary"
                size="medium"
                style={styles.button}
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
