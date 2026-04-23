import React, { useEffect, useState } from 'react';
import { View, StyleSheet, LayoutChangeEvent } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { spacing } from '@/styles';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    runOnJS,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

export interface SurveyNumberSliderProps {
    min: number;
    max: number;
    unit?: string;
    value?: number;
    onChange: (value: number) => void;
}

export const SurveyNumberSlider: React.FC<SurveyNumberSliderProps> = ({
    min,
    max,
    unit = '',
    value,
    onChange,
}) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);
    const [sliderWidth, setSliderWidth] = useState(0);

    // Default to min or provided value
    const initialValue = value !== undefined ? value : min;
    const [currentValue, setCurrentValue] = useState(initialValue);

    // Reanimated value for the thumb X position
    const translateX = useSharedValue(0);

    const isSliding = useSharedValue(false);

    const isInitialized = React.useRef(false);

    // Set initial position once slider layout is known, or update if value changes externally
    useEffect(() => {
        if (sliderWidth > 0) {
            if (!isInitialized.current) {
                // First time we get width, set exact position
                const range = max - min;
                const percentage = (initialValue - min) / range;
                translateX.value = percentage * sliderWidth;
                isInitialized.current = true;
            } else if (value !== undefined && value !== currentValue) {
                // Value changed externally (not by sliding)
                const range = max - min;
                const percentage = (value - min) / range;
                translateX.value = withSpring(percentage * sliderWidth, {
                    damping: 12,
                    stiffness: 350,
                });
                setCurrentValue(value);
            }
        }
    }, [sliderWidth, value, min, max, initialValue, currentValue, translateX]);

    const handleLayout = (e: LayoutChangeEvent) => {
        setSliderWidth(e.nativeEvent.layout.width);
    };

    const updateValue = (newX: number) => {
        const clampedX = Math.max(0, Math.min(newX, sliderWidth));
        const percentage = clampedX / sliderWidth;
        const newValue = Math.round(min + percentage * (max - min));

        setCurrentValue(newValue);
        onChange(newValue);
    };

    const panGesture = Gesture.Pan()
        .minDistance(0)
        .onBegin(e => {
            isSliding.value = true;
            const clampedX = Math.max(0, Math.min(e.x, sliderWidth));
            const percentage = clampedX / sliderWidth;
            const newValue = Math.round(min + percentage * (max - min));
            const snappedX = ((newValue - min) / (max - min)) * sliderWidth;
            translateX.value = withSpring(snappedX, { damping: 18, stiffness: 450 });
            runOnJS(updateValue)(clampedX);
        })
        .onUpdate(e => {
            const clampedX = Math.max(0, Math.min(e.x, sliderWidth));
            const percentage = clampedX / sliderWidth;
            const newValue = Math.round(min + percentage * (max - min));
            const snappedX = ((newValue - min) / (max - min)) * sliderWidth;
            translateX.value = withSpring(snappedX, { damping: 18, stiffness: 450 });
            runOnJS(updateValue)(clampedX);
        })
        .onEnd(e => {
            isSliding.value = false;
            // Snap to exact value position
            const clampedX = Math.max(0, Math.min(e.x, sliderWidth));
            const percentage = clampedX / sliderWidth;
            const finalValue = Math.round(min + percentage * (max - min));
            const snappedX = ((finalValue - min) / (max - min)) * sliderWidth;

            translateX.value = withSpring(snappedX, {
                damping: 18,
                stiffness: 450,
            });
        });

    const animatedThumbStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: translateX.value }],
        };
    });

    const animatedTrackStyle = useAnimatedStyle(() => {
        return {
            width: translateX.value,
        };
    });

    return (
        <View style={styles.container}>
            <View style={styles.valueContainer}>
                <Text style={styles.valueText}>{currentValue}</Text>
                {currentValue === max && <Text style={styles.plusText}>+</Text>}
                {unit && (
                    <Text
                        style={[
                            styles.unitText,
                            currentValue === max && { marginLeft: spacing.xs },
                        ]}
                    >
                        {unit}
                    </Text>
                )}
            </View>

            <View style={styles.sliderHitSlop}>
                <GestureDetector gesture={panGesture}>
                    <View style={styles.sliderWrapper} hitSlop={{ top: 20, bottom: 20 }}>
                        <View style={styles.trackBackground} onLayout={handleLayout}>
                            <Animated.View style={[styles.trackActive, animatedTrackStyle]} />
                        </View>

                        <Animated.View
                            style={[styles.thumb, animatedThumbStyle]}
                            pointerEvents="none"
                        >
                            <View style={styles.thumbInner} />
                        </Animated.View>
                    </View>
                </GestureDetector>

                <View style={styles.labelsContainer}>
                    {[
                        min,
                        Math.round(max / 4),
                        Math.round(max / 2),
                        Math.round((max * 3) / 4),
                        max,
                    ].map((labelValue, index) => {
                        const percentage = ((labelValue - min) / (max - min)) * 100;

                        return (
                            <View
                                key={index}
                                style={[styles.labelWrapper, { left: `${percentage}%` }]}
                            >
                                <Text
                                    style={[
                                        styles.labelText,
                                        currentValue === labelValue && styles.labelActiveText,
                                    ]}
                                >
                                    {labelValue}
                                    {labelValue === max ? '+' : ''}
                                </Text>
                            </View>
                        );
                    })}
                </View>
            </View>
        </View>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            paddingHorizontal: spacing.lg,
            marginTop: spacing.xl,
        },
        valueContainer: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            marginBottom: 40,
        },
        valueText: {
            fontSize: 72,
            fontWeight: '700',
            color: theme.text,
            includeFontPadding: false,
        },
        plusText: {
            fontSize: 48,
            fontWeight: '700',
            color: theme.text,
            marginTop: -4,
            marginLeft: 2,
            includeFontPadding: false,
        },
        unitText: {
            fontSize: 20,
            fontWeight: '500',
            color: theme.textSecondary,
            marginLeft: spacing.xs,
            marginTop: 12, // align to top/superscript position
        },
        sliderWrapper: {
            width: '100%',
            height: 40,
            justifyContent: 'center',
            position: 'relative',
        },
        sliderHitSlop: {
            marginHorizontal: 16,
        },
        trackBackground: {
            width: '100%',
            height: 6,
            backgroundColor: theme.border,
            borderRadius: 3,
            position: 'absolute',
        },
        trackActive: {
            height: 6,
            backgroundColor: theme.primaryOrange,
            borderRadius: 3,
        },
        thumb: {
            position: 'absolute',
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: theme.white,
            borderWidth: 2,
            borderColor: theme.primaryOrange,
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: -14, // Center thumb over the track
            shadowColor: theme.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
        },
        thumbInner: {
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: theme.white,
        },
        labelsContainer: {
            width: '100%',
            height: 24,
            position: 'relative',
            marginTop: spacing.sm,
        },
        labelWrapper: {
            position: 'absolute',
            width: 48,
            marginLeft: -24,
            alignItems: 'center',
        },
        labelText: {
            fontSize: 14,
            fontWeight: '400',
            color: theme.textSecondary,
            textAlign: 'center',
        },
        labelActiveText: {
            fontSize: 14,
            fontWeight: '700',
            color: theme.text,
        },
    });
