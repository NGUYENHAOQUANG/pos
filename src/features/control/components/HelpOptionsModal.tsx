import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, Platform, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    interpolate,
    Extrapolation,
    runOnJS,
} from 'react-native-reanimated';
import { colors, spacing } from '@/styles';
import { ButtonMaterialList } from '@/features/material/components/material/ButtonMaterialList';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface HelpOptionsModalProps {
    isOpen: boolean; // Renamed from visible to match Material pattern
    onClose: () => void;
    buttonPosition: { x: number; y: number; width: number; height: number } | null;
    onPressUserManual: () => void;
    onPressDeviceExplanation: () => void;
}

export const HelpOptionsModal: React.FC<HelpOptionsModalProps> = ({
    isOpen,
    onClose,
    buttonPosition,
    onPressUserManual,
    onPressDeviceExplanation,
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const animation = useSharedValue(0);

    React.useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            animation.value = withTiming(1, { duration: 250 });
        } else {
            animation.value = withTiming(0, { duration: 200 }, finished => {
                if (finished) {
                    runOnJS(setIsVisible)(false);
                }
            });
        }
    }, [isOpen, animation]);

    const animatedMenuStyle = useAnimatedStyle(() => {
        const opacity = interpolate(animation.value, [0, 1], [0, 1], Extrapolation.CLAMP);
        const scale = interpolate(animation.value, [0, 1], [0.95, 1], Extrapolation.CLAMP);
        const translateY = interpolate(animation.value, [0, 1], [-10, 0], Extrapolation.CLAMP);

        return {
            opacity,
            transform: [{ scale }, { translateY }],
        };
    });

    if (!isVisible && !isOpen) return null;

    // Calculate position
    // Calculate position
    // Default to strict null check handling
    const safePosition = buttonPosition || { x: 0, y: 0, width: 0, height: 0 };
    const menuRight = SCREEN_WIDTH - safePosition.x - safePosition.width;
    const menuTop = safePosition.y + safePosition.height;

    return (
        <View style={styles.absoluteOverlay} pointerEvents={isOpen ? 'auto' : 'none'}>
            <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />

            <Animated.View
                style={[
                    styles.menuContainer,
                    animatedMenuStyle,
                    {
                        top: menuTop,
                        right: menuRight,
                    },
                ]}
            >
                <View style={styles.content}>
                    <ButtonMaterialList
                        title="Hướng dẫn sử dụng"
                        onPress={() => {
                            onClose();
                            // Small delay to allow menu to start closing before nav
                            setTimeout(onPressUserManual, 50);
                        }}
                        icon={<Ionicons name="book-outline" size={20} color={colors.text} />}
                        style={styles.customButton}
                        textStyle={styles.customButtonText}
                    />

                    <View style={styles.divider} />

                    <ButtonMaterialList
                        title="Giải thích các thiết bị"
                        onPress={() => {
                            onClose();
                            setTimeout(onPressDeviceExplanation, 50);
                        }}
                        icon={
                            <Ionicons name="hardware-chip-outline" size={20} color={colors.text} />
                        }
                        style={styles.customButton}
                        textStyle={styles.customButtonText}
                    />
                </View>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    absoluteOverlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 2000,
        elevation: 2000,
    },
    menuContainer: {
        position: 'absolute',
        backgroundColor: colors.white,
        borderRadius: 16, // Kept 16 from previous design
        paddingVertical: spacing.xs,
        minWidth: 250, // Kept 250 from previous design
        zIndex: 1001,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    content: {
        overflow: 'hidden',
        borderRadius: 16,
    },
    // Override ButtonMaterialList styles
    customButton: {
        borderWidth: 0,
        backgroundColor: 'transparent',
        paddingVertical: spacing.md,
        borderRadius: 0,
        justifyContent: 'flex-start',
    },
    customButtonText: {
        fontSize: 15,
        fontWeight: '400',
    },
    divider: {
        height: 1,
        backgroundColor: colors.gray[100],
        marginHorizontal: spacing.md,
    },
});
