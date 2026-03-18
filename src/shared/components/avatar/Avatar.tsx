import React from 'react';
import { View, Image, StyleSheet, ViewStyle } from 'react-native';
import { Text } from '@/shared/components/typography/Text';

interface AvatarProps {
    source?: { uri: string } | number;
    name?: string;
    size?: 'small' | 'medium' | 'large';
    style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({ source, name, size = 'medium', style }) => {
    const sizeValue = {
        small: 40,
        medium: 56,
        large: 80,
    }[size];

    const getInitials = (fullName: string) => {
        return fullName
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <View
            style={[
                styles.avatar,
                { width: sizeValue, height: sizeValue, borderRadius: sizeValue / 2 },
                style,
            ]}
        >
            {source ? (
                <Image
                    source={source}
                    style={{ width: sizeValue, height: sizeValue, borderRadius: sizeValue / 2 }}
                />
            ) : (
                <View
                    style={[
                        styles.placeholder,
                        { width: sizeValue, height: sizeValue, borderRadius: sizeValue / 2 },
                    ]}
                >
                    <Text style={[styles.initials, { fontSize: sizeValue / 2.5 }]}>
                        {name ? getInitials(name) : '?'}
                    </Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    avatar: {
        overflow: 'hidden',
    },
    placeholder: {
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    initials: {
        color: '#fff',
        fontWeight: '600',
    },
});
