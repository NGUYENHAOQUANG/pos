/**
 * @file SegmentedControl.tsx
 * @description Tab/Segmented Control component following Ant Design principles with system colors
 * @author Kindy
 * @created 2025-01-XX
 * @updated 2025-01-XX - Redesigned with full Ant Design styling
 *
 * @see https://rn.mobile.ant.design/components/segmented-control
 */
import { borderRadius, colors, sizes, spacing, typography } from '@/styles';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    LayoutChangeEvent,
    Platform,
    StyleSheet,
    TouchableOpacity,
    UIManager,
    View,
    ViewStyle,
} from 'react-native';
import { Text } from '@/shared/components/typography/Text';

export interface SegmentedControlProps {
    /** Array of option labels */
    options: string[];
    /** Currently selected option index */
    selectedIndex: number;
    /** Callback when an option is selected */
    onSelect: (index: number) => void;
    /** Disable all tabs */
    disabled?: boolean;
    /** Custom container styles */
    containerStyle?: ViewStyle;
    /** Custom tab styles */
    tabStyle?: ViewStyle;
    /** Custom text styles */
    textStyle?: ViewStyle;
}

/**
 * SegmentedControl (Tab) component with Ant Design styling and system colors
 * Provides a tab-like interface for switching between options
 */
export function SegmentedControl({
    options,
    selectedIndex,
    onSelect,
    disabled = false,
    containerStyle,
    tabStyle,
    textStyle,
}: SegmentedControlProps) {
    // Slider animation - initialize with small values to avoid rendering issues
    const sliderPosition = useRef(new Animated.Value(0)).current;
    const sliderWidth = useRef(new Animated.Value(100)).current; // Start with a default width

    // Store tab layouts
    const [tabLayouts, setTabLayouts] = useState<Array<{ x: number; width: number }>>([]);
    const containerLayout = useRef<{ width: number; x: number } | null>(null);

    // Enable LayoutAnimation for Android (only once)
    useEffect(() => {
        if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
            UIManager.setLayoutAnimationEnabledExperimental(true);
        }
    }, []);

    // Animate slider when selectedIndex changes
    useEffect(() => {
        if (
            tabLayouts.length > 0 &&
            tabLayouts[selectedIndex] &&
            tabLayouts[selectedIndex].width > 0
        ) {
            const targetLayout = tabLayouts[selectedIndex];
            Animated.parallel([
                Animated.spring(sliderPosition, {
                    toValue: targetLayout.x,
                    tension: 300,
                    friction: 25,
                    useNativeDriver: false,
                }),
                Animated.spring(sliderWidth, {
                    toValue: targetLayout.width,
                    tension: 300,
                    friction: 25,
                    useNativeDriver: false,
                }),
            ]).start();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedIndex, tabLayouts]);

    // Handle tab layout
    const handleTabLayout = (index: number, event: LayoutChangeEvent) => {
        try {
            const { x, width } = event.nativeEvent.layout;
            if (width > 0 && x >= 0) {
                setTabLayouts(prev => {
                    const newLayouts = [...prev];
                    newLayouts[index] = { x, width };

                    if (index === selectedIndex && (!prev[index] || prev[index].width === 0)) {
                        sliderPosition.setValue(x);
                        sliderWidth.setValue(width);
                    }

                    return newLayouts;
                });
            }
        } catch (error) {
            console.warn('Error in handleTabLayout:', error);
        }
    };

    // Handle container layout
    const handleContainerLayout = (event: LayoutChangeEvent) => {
        const { x, width } = event.nativeEvent.layout;
        containerLayout.current = { x, width };
    };

    return (
        <View
            style={[styles.container, disabled && styles.containerDisabled, containerStyle]}
            onLayout={handleContainerLayout}
        >
            {/* Animated Slider Background */}
            {tabLayouts.length > 0 && tabLayouts[selectedIndex] && (
                <Animated.View
                    style={[
                        styles.slider,
                        {
                            transform: [{ translateX: sliderPosition }],
                            width: sliderWidth,
                        },
                    ]}
                />
            )}

            {/* Tabs */}
            {options.map((option, index) => {
                const isSelected = index === selectedIndex;
                const isFirst = index === 0;
                const isLast = index === options.length - 1;

                return (
                    <View
                        key={index}
                        style={[
                            styles.tab,
                            isFirst && styles.tabFirst,
                            isLast && styles.tabLast,
                            disabled && styles.tabDisabled,
                            tabStyle,
                        ]}
                        onLayout={e => handleTabLayout(index, e)}
                    >
                        <TouchableOpacity
                            onPress={() => !disabled && onSelect(index)}
                            activeOpacity={0.7}
                            disabled={disabled}
                            style={styles.tabTouchable}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    isSelected && styles.tabTextSelected,
                                    disabled && styles.tabTextDisabled,
                                    textStyle,
                                ]}
                            >
                                {option}
                            </Text>
                        </TouchableOpacity>
                    </View>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        borderRadius: borderRadius.full,
        padding: spacing.sm,
        backgroundColor: '#0146741A',
    },
    containerDisabled: {
        opacity: 0.5,
    },
    slider: {
        position: 'absolute',
        backgroundColor: colors.white,
        borderColor: colors.primary,
        borderWidth: 2,
        borderRadius: borderRadius.full,
        top: spacing.sm,
        bottom: spacing.sm,
        minHeight: sizes.button.sm,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.full,
        minHeight: sizes.button.sm,
        zIndex: 1,
    },
    tabTouchable: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabFirst: {
        marginRight: spacing.xs / 2,
    },
    tabLast: {
        marginLeft: spacing.xs / 2,
    },
    tabDisabled: {
        opacity: 0.6,
    },
    tabText: {
        textAlign: 'center',
        color: colors.black,
        fontWeight: typography.fontWeight.bold,
        fontSize: typography.fontSize.lg,
    },
    tabTextSelected: {
        color: colors.primary,
        fontWeight: typography.fontWeight.bold,
        fontSize: typography.fontSize.lg,
    },
    tabTextDisabled: {
        color: colors.primary,
        fontWeight: typography.fontWeight.bold,
        fontSize: typography.fontSize.lg,
    },
});
