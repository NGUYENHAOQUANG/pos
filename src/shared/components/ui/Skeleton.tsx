import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, StyleProp, ViewStyle, DimensionValue } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors, borderRadius } from '@/styles';

interface SkeletonProps {
    /** Width of the skeleton line (number or string like '100%') */
    width?: DimensionValue;
    /** Height of the skeleton line */
    height: number;
    /** Additional styles */
    style?: StyleProp<ViewStyle>;
    /** Border radius override */
    borderRadius?: number;
    /** Background color override */
    backgroundColor?: string;
}

/**
 * Skeleton component with shimmer effect
 * Used to display loading placeholders with animated shimmer
 */
export const Skeleton: React.FC<SkeletonProps> = ({
    width = '100%',
    height,
    style,
    borderRadius: customBorderRadius,
    backgroundColor: customBackgroundColor,
}) => {
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.timing(animatedValue, {
                toValue: 1,
                duration: 1500,
                useNativeDriver: true,
            }),
            { resetBeforeIteration: true }
        );
        animation.start();
        return () => animation.stop();
    }, [animatedValue]);

    const translateX = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [-200, 200],
    });

    const dynamicStyle: ViewStyle = {
        height,
    };

    if (width !== undefined) {
        dynamicStyle.width = width;
    }

    if (customBorderRadius !== undefined) {
        dynamicStyle.borderRadius = customBorderRadius;
    }

    if (customBackgroundColor !== undefined) {
        dynamicStyle.backgroundColor = customBackgroundColor;
    }

    return (
        <View style={[styles.skeletonBase, dynamicStyle, style]}>
            <Animated.View
                style={[
                    styles.shimmer,
                    {
                        transform: [{ translateX }],
                    },
                ]}
            >
                <LinearGradient
                    colors={['transparent', 'rgba(255, 255, 255, 0.5)', 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                />
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    skeletonBase: {
        backgroundColor: colors.borderLight,
        borderRadius: borderRadius.sm,
        overflow: 'hidden',
    },
    shimmer: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
});
