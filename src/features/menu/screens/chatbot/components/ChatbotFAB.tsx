import React, { useCallback, useState, useEffect, memo } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { navigate, navigationRef } from '@/app/navigation/NavigationRef';
import RNShake from 'react-native-shake';
import { ChatbotAvatar } from '@/features/menu/screens/chatbot/animation/ChatbotAvatar';
import CloseOutlined from '@/assets/Icon/CloseOutlined.svg';
import { colors } from '@/styles';
import { useSettingsStore } from '@/features/menu/store/settingsStore';

const HIDDEN_SCREENS = ['Chatbot', 'Ingest', 'CameraPlayer'];
const FAB_SIZE = 56;
const EDGE_MARGIN = 12;
const DISMISS_ZONE_SIZE = 64;
const DISMISS_ZONE_THRESHOLD = 80;

// Spring config for snap-to-edge animation
const SNAP_SPRING_CONFIG = {
    damping: 15,
    stiffness: 150,
    mass: 0.8,
};

export const ChatbotFAB = memo(() => {
    const insets = useSafeAreaInsets();
    const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

    // Initial position: bottom-right
    const initialX = SCREEN_W - FAB_SIZE - EDGE_MARGIN;
    const initialY = SCREEN_H - FAB_SIZE - 100 - Math.max(insets.bottom, 16);

    // Shared values for FAB position (UI thread)
    const translateX = useSharedValue(initialX);
    const translateY = useSharedValue(initialY);

    // Context to store position at drag start
    const contextX = useSharedValue(0);
    const contextY = useSharedValue(0);

    // Track drag state on UI thread
    const isDragging = useSharedValue(false);

    // Dismiss zone animation values
    const dismissOpacity = useSharedValue(0);
    const dismissScale = useSharedValue(0.5);
    const isOverDismiss = useSharedValue(false);

    // FAB visibility state (JS thread — controls render)
    const [isHidden, setIsHidden] = useState(false);
    const [showDismissZone, setShowDismissZone] = useState(false);
    const [isOverDismissZone, setIsOverDismissZone] = useState(false);

    // Dismiss zone position (bottom center)
    const dismissZoneX = SCREEN_W / 2 - DISMISS_ZONE_SIZE / 2;
    const dismissZoneY = SCREEN_H - DISMISS_ZONE_SIZE - insets.bottom - 24;

    // Track the deepest current route name via navigationRef
    const [currentRouteName, setCurrentRouteName] = useState('');

    useEffect(() => {
        const updateRoute = () => {
            const route = navigationRef.getCurrentRoute();
            setCurrentRouteName(route?.name ?? '');
        };

        if (navigationRef.isReady()) {
            updateRoute();
        }

        const unsubscribe = navigationRef.addListener('state', updateRoute);
        return unsubscribe;
    }, []);

    // Helper: reset FAB to default position
    const resetToDefaultPosition = useCallback(() => {
        const resetX = SCREEN_W - FAB_SIZE - EDGE_MARGIN;
        const resetY = SCREEN_H - FAB_SIZE - 100 - Math.max(insets.bottom, 16);
        translateX.value = resetX;
        translateY.value = resetY;
    }, [SCREEN_W, SCREEN_H, insets.bottom, translateX, translateY]);

    // Shake to restore FAB
    useEffect(() => {
        const subscription = RNShake.addListener(() => {
            if (isHidden) {
                setIsHidden(false);
                resetToDefaultPosition();
                Toast.show({
                    type: 'success',
                    text1: 'Đã bật lại trợ lý ảo AI',
                    visibilityTime: 2000,
                });
            }
        });

        return () => subscription.remove();
    }, [isHidden, resetToDefaultPosition]);

    // Restore FAB automatically when entering the Chatbot screen manually (e.g. from menu)
    useEffect(() => {
        if (currentRouteName === 'Chatbot' && isHidden) {
            setIsHidden(false);
            resetToDefaultPosition();
        }
    }, [currentRouteName, isHidden, resetToDefaultPosition]);

    // ── JS callbacks invoked from UI thread via runOnJS ──

    const showDismiss = useCallback(() => {
        setShowDismissZone(true);
    }, []);

    const hideDismiss = useCallback(() => {
        setShowDismissZone(false);
        setIsOverDismissZone(false);
    }, []);

    const updateOverDismissZone = useCallback((value: boolean) => {
        setIsOverDismissZone(value);
    }, []);

    const onTap = useCallback(() => {
        navigate('Chatbot');
    }, []);

    const onDismiss = useCallback(() => {
        setIsHidden(true);
        Toast.show({
            type: 'success',
            text1: 'Đã ẩn trợ lý ảo AI',
            text2: 'Lắc điện thoại để bật lại',
            visibilityTime: 4000,
        });
    }, []);

    // ── Check dismiss zone (UI thread) ──
    const checkDismissZone = (fabX: number, fabY: number): boolean => {
        'worklet';
        const fabCenterX = fabX + FAB_SIZE / 2;
        const fabCenterY = fabY + FAB_SIZE / 2;
        const zoneCenterX = dismissZoneX + DISMISS_ZONE_SIZE / 2;
        const zoneCenterY = dismissZoneY + DISMISS_ZONE_SIZE / 2;
        const distance = Math.sqrt(
            (fabCenterX - zoneCenterX) ** 2 + (fabCenterY - zoneCenterY) ** 2
        );
        return distance < DISMISS_ZONE_THRESHOLD;
    };

    // ── Snap to edge (UI thread) ──
    const snapToEdge = (x: number, y: number) => {
        'worklet';
        const snapX =
            x + FAB_SIZE / 2 < SCREEN_W / 2 ? EDGE_MARGIN : SCREEN_W - FAB_SIZE - EDGE_MARGIN;

        const minY = insets.top + EDGE_MARGIN;
        const maxY = SCREEN_H - FAB_SIZE - EDGE_MARGIN - insets.bottom;
        const snapY = Math.max(minY, Math.min(y, maxY));

        translateX.value = withSpring(snapX, SNAP_SPRING_CONFIG);
        translateY.value = withSpring(snapY, SNAP_SPRING_CONFIG);
    };

    // ── Pan Gesture (runs entirely on UI thread) ──
    const panGesture = Gesture.Pan()
        .minDistance(5)
        .onStart(() => {
            'worklet';
            // Save the current position at drag start
            contextX.value = translateX.value;
            contextY.value = translateY.value;
            isDragging.value = false;
        })
        .onUpdate(event => {
            'worklet';
            const hasMoved = Math.abs(event.translationX) > 5 || Math.abs(event.translationY) > 5;

            if (hasMoved && !isDragging.value) {
                isDragging.value = true;
                // Show dismiss zone
                dismissOpacity.value = withSpring(1, { damping: 10, stiffness: 120 });
                dismissScale.value = withSpring(1, { damping: 8, stiffness: 100 });
                runOnJS(showDismiss)();
            }

            // Update absolute position
            const currentX = contextX.value + event.translationX;
            const currentY = contextY.value + event.translationY;
            translateX.value = currentX;
            translateY.value = currentY;

            // Check dismiss zone hover
            if (isDragging.value) {
                const inZone = checkDismissZone(currentX, currentY);
                if (inZone !== isOverDismiss.value) {
                    isOverDismiss.value = inZone;
                    runOnJS(updateOverDismissZone)(inZone);
                }
            }
        })
        .onEnd(() => {
            'worklet';
            const finalX = translateX.value;
            const finalY = translateY.value;

            // Hide dismiss zone
            dismissOpacity.value = withTiming(0, { duration: 200 });
            dismissScale.value = withTiming(0.5, { duration: 200 });
            runOnJS(hideDismiss)();

            if (!isDragging.value) {
                // Was a tap — navigate to Chatbot
                runOnJS(onTap)();
            } else if (checkDismissZone(finalX, finalY)) {
                // Dropped in dismiss zone — hide FAB
                runOnJS(onDismiss)();
            } else {
                // Snap to nearest edge
                snapToEdge(finalX, finalY);
            }
        });

    // ── Animated styles (UI thread) ──
    const fabAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
    }));

    const dismissZoneAnimatedStyle = useAnimatedStyle(() => ({
        opacity: dismissOpacity.value,
        transform: [{ scale: dismissScale.value }],
    }));

    const chatbotEnabled = useSettingsStore(s => s.chatbotEnabled);

    // Don't render if disabled in settings, hidden locally, or on excluded screens
    if (!chatbotEnabled || isHidden || HIDDEN_SCREENS.includes(currentRouteName)) {
        return null;
    }

    return (
        <>
            {/* Dismiss Zone - appears when dragging */}
            {showDismissZone && (
                <Animated.View
                    pointerEvents="none"
                    style={[
                        styles.dismissZone,
                        {
                            left: dismissZoneX,
                            top: dismissZoneY,
                            width: DISMISS_ZONE_SIZE,
                            height: DISMISS_ZONE_SIZE,
                            borderRadius: DISMISS_ZONE_SIZE / 2,
                            backgroundColor: isOverDismissZone
                                ? colors.red[500]
                                : 'rgba(0, 0, 0, 0.6)',
                        },
                        dismissZoneAnimatedStyle,
                    ]}
                >
                    <CloseOutlined
                        width={24}
                        height={24}
                        fill={colors.white}
                        color={colors.white}
                    />
                </Animated.View>
            )}

            {/* Draggable FAB */}
            <GestureDetector gesture={panGesture}>
                <Animated.View style={[styles.fab, fabAnimatedStyle]}>
                    <ChatbotAvatar size={FAB_SIZE} animated />
                </Animated.View>
            </GestureDetector>
        </>
    );
});

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: FAB_SIZE,
        height: FAB_SIZE,
        borderRadius: FAB_SIZE / 2,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },
    dismissZone: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9998,
    },
});
