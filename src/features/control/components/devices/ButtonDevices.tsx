import React, { useEffect, useRef } from 'react';
import { StyleSheet, StyleProp, ViewStyle, TouchableOpacity, Animated, Easing } from 'react-native';
import { colors } from '@/styles';

interface ButtonDevicesProps {
    value: boolean;
    onValueChange: (val: boolean) => void;
    trackColor?: string; // Color when ON
    style?: StyleProp<ViewStyle>;
    disabled?: boolean;
}

export const ButtonDevices: React.FC<ButtonDevicesProps> = ({
    value,
    onValueChange,
    trackColor = colors.primary, // Default Blue from colors
    style,
    disabled = false,
}) => {
    const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: value ? 1 : 0,
            duration: 200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false, // layout props like padding/margin or left/right need false usually, or we animate transform
        }).start();
    }, [value, animatedValue]);

    const translateX = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 20], // 0 (start at padding) -> 20 (travel distance: 44 - 4 - 20)
    });

    const backgroundColor = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [colors.gray[400], trackColor], // gray.400 for OFF state
    });

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onValueChange(!value)}
            disabled={disabled}
            style={[style]} // Removed opacity: disabled ? 0.5 : 1 to fix visual artifact
        >
            <Animated.View style={[styles.track, { backgroundColor }]}>
                <Animated.View
                    style={[
                        styles.thumb,
                        {
                            transform: [{ translateX }],
                        },
                    ]}
                />
            </Animated.View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    track: {
        width: 44,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        padding: 2, // gap between thumb and track border
    },
    thumb: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: colors.white,
        // Shadow for thumb
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
        elevation: 2,
    },
});
