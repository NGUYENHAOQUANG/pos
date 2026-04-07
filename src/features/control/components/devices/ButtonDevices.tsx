import React, { useEffect, useRef } from 'react';
import {
    StyleSheet,
    StyleProp,
    ViewStyle,
    TouchableOpacity,
    View,
    Animated,
    Easing,
} from 'react-native';
import { useAppTheme } from '@/styles/themeContext';
import { haptics } from '@/shared/utils/haptics';

interface ButtonDevicesProps {
    value: boolean;
    onValueChange: (val: boolean) => void;
    trackColor?: string; // Color when ON
    style?: StyleProp<ViewStyle>;
    disabled?: boolean;
}

export const ButtonDevices: React.FC<ButtonDevicesProps> = React.memo(
    ({ value, onValueChange, trackColor, style, disabled = false }) => {
        const theme = useAppTheme();
        const effectiveTrackColor = trackColor || theme.primary;
        const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

        useEffect(() => {
            Animated.timing(animatedValue, {
                toValue: value ? 1 : 0,
                duration: 200,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
            }).start();
        }, [value, animatedValue]);

        const translateX = animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 20],
        });

        // Set backgroundColor directly instead of animating it (backgroundColor can't use native driver)
        const currentTrackColor = value ? effectiveTrackColor : theme.gray[400];

        return (
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                    haptics.medium();
                    onValueChange(!value);
                }}
                disabled={disabled}
                style={[style]}
            >
                <View style={[styles.track, { backgroundColor: currentTrackColor }]}>
                    <Animated.View
                        style={[
                            styles.thumb,
                            {
                                transform: [{ translateX }],
                                backgroundColor: theme.white,
                            },
                        ]}
                    />
                </View>
            </TouchableOpacity>
        );
    }
);

const styles = StyleSheet.create({
    track: {
        width: 44,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        padding: 2,
    },
    thumb: {
        width: 20,
        height: 20,
        borderRadius: 10,
    },
});
