import React from 'react';
import {
    Modal,
    View,
    StyleSheet,
    Pressable,
    Animated,
    Dimensions,
    StyleProp,
    ViewStyle,
} from 'react-native';
import { useAppTheme } from '@/styles/themeContext';

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
    /** Whether the modal should render behind the status bar (Android). Default: false */
    statusBarTranslucent?: boolean;
}

export const AnimatedBottomSheet: React.FC<AnimatedBottomSheetProps> = ({
    visible,
    onClose,
    children,
    overlayStyle,
    containerStyle,
    closeDuration = 200,
    statusBarTranslucent = false,
}) => {
    const theme = useAppTheme();
    const themedStyles = getStyles(theme);
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
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent={statusBarTranslucent}
            onRequestClose={onClose}
        >
            <Pressable onPress={onClose} style={{ flex: 1 }}>
                <View style={[themedStyles.overlay, overlayStyle]}>
                    <Animated.View
                        style={[
                            themedStyles.container,
                            containerStyle,
                            { transform: [{ translateY: slideAnim }] },
                        ]}
                        onStartShouldSetResponder={() => true}
                    >
                        {children}
                    </Animated.View>
                </View>
            </Pressable>
        </Modal>
    );
};

const getStyles = (theme: ReturnType<typeof useAppTheme>) =>
    StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: theme.overlay,
            justifyContent: 'flex-end',
        },
        container: {
            backgroundColor: theme.background,
            borderRadius: 24,
        },
    });
