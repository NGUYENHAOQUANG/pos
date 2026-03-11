import React from 'react';
import {
    Modal,
    View,
    StyleSheet,
    TouchableWithoutFeedback,
    Animated,
    Dimensions,
    StyleProp,
    ViewStyle,
} from 'react-native';
import { colors } from '@/styles';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * AnimatedBottomSheet - Shared slide-up/slide-down animation wrapper
 *
 * Provides a consistent bottom sheet animation pattern used across modals:
 * - Fade overlay backdrop (tap to dismiss)
 * - Spring slide-up animation on open
 * - Timing slide-down animation on close
 *
 * @example
 * <AnimatedBottomSheet visible={visible} onClose={onClose}>
 *   <Text>Content here</Text>
 * </AnimatedBottomSheet>
 *
 * @example
 * // With custom overlay and container styles
 * <AnimatedBottomSheet
 *   visible={visible}
 *   onClose={onClose}
 *   overlayStyle={{ paddingHorizontal: 16 }}
 *   containerStyle={{ borderRadius: 16, padding: 16 }}
 * >
 *   <Text>Custom styled content</Text>
 * </AnimatedBottomSheet>
 */
interface AnimatedBottomSheetProps {
    /** Whether the bottom sheet is visible */
    visible: boolean;
    /** Callback when the bottom sheet should close (overlay tap or Android back) */
    onClose: () => void;
    /** Content to render inside the animated container */
    children: React.ReactNode;
    /** Custom style for the overlay (background) */
    overlayStyle?: StyleProp<ViewStyle>;
    /** Custom style for the animated container */
    containerStyle?: StyleProp<ViewStyle>;
    /** Slide-down animation duration in ms. Default: 200 */
    closeDuration?: number;
}

export const AnimatedBottomSheet: React.FC<AnimatedBottomSheetProps> = ({
    visible,
    onClose,
    children,
    overlayStyle,
    containerStyle,
    closeDuration = 200,
}) => {
    const slideAnim = React.useRef(new Animated.Value(SCREEN_HEIGHT)).current;

    React.useEffect(() => {
        if (visible) {
            // Reset position before animating
            slideAnim.setValue(SCREEN_HEIGHT);
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 50,
                friction: 8,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: SCREEN_HEIGHT,
                duration: closeDuration,
                useNativeDriver: true,
            }).start();
        }
    }, [visible, slideAnim, closeDuration]);

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={[styles.overlay, overlayStyle]}>
                    <TouchableWithoutFeedback>
                        <Animated.View
                            style={[
                                styles.container,
                                containerStyle,
                                { transform: [{ translateY: slideAnim }] },
                            ]}
                        >
                            {children}
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: colors.overlay,
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: colors.white,
        borderRadius: 24,
    },
});
