/**
 * @file ZoomableImage.tsx
 * @description Cross-platform pinch-to-zoom image component
 * using react-native-gesture-handler + react-native-reanimated.
 */
import React from 'react';
import { StyleSheet, ImageSourcePropType, ViewStyle, StyleProp } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';

interface ZoomableImageProps {
    /** Image source */
    source: ImageSourcePropType;
    /** Container style */
    style?: StyleProp<ViewStyle>;
    /** Max zoom scale (default: 4) */
    maxScale?: number;
}

export const ZoomableImage: React.FC<ZoomableImageProps> = ({ source, style, maxScale = 4 }) => {
    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const savedTranslateX = useSharedValue(0);
    const savedTranslateY = useSharedValue(0);

    // Pinch gesture for zooming
    const pinchGesture = Gesture.Pinch()
        .onUpdate(e => {
            const newScale = savedScale.value * e.scale;
            scale.value = Math.min(Math.max(newScale, 1), maxScale);
        })
        .onEnd(() => {
            savedScale.value = scale.value;
            if (scale.value <= 1) {
                // Reset position when zoomed out
                scale.value = withTiming(1);
                savedScale.value = 1;
                translateX.value = withTiming(0);
                translateY.value = withTiming(0);
                savedTranslateX.value = 0;
                savedTranslateY.value = 0;
            }
        });

    // Pan gesture for moving when zoomed
    const panGesture = Gesture.Pan()
        .onUpdate(e => {
            if (scale.value > 1) {
                translateX.value = savedTranslateX.value + e.translationX;
                translateY.value = savedTranslateY.value + e.translationY;
            }
        })
        .onEnd(() => {
            savedTranslateX.value = translateX.value;
            savedTranslateY.value = translateY.value;
        });

    // Double tap to toggle zoom
    const doubleTapGesture = Gesture.Tap()
        .numberOfTaps(2)
        .onEnd(() => {
            if (scale.value > 1) {
                scale.value = withTiming(1);
                savedScale.value = 1;
                translateX.value = withTiming(0);
                translateY.value = withTiming(0);
                savedTranslateX.value = 0;
                savedTranslateY.value = 0;
            } else {
                scale.value = withTiming(2.5);
                savedScale.value = 2.5;
            }
        });

    const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture, doubleTapGesture);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: scale.value },
        ],
    }));

    return (
        <GestureHandlerRootView style={[styles.container, style]}>
            <GestureDetector gesture={composedGesture}>
                <Animated.Image
                    source={source}
                    style={[styles.image, animatedStyle]}
                    resizeMode="cover"
                />
            </GestureDetector>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
    },
});
