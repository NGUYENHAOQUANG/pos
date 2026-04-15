import React, { useRef, useCallback, useState, useEffect, memo } from 'react';
import { StyleSheet, Animated, PanResponder, Dimensions } from 'react-native';
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

export const ChatbotFAB = memo(() => {
    const insets = useSafeAreaInsets();
    const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

    // Initial position: bottom-right
    const initialX = SCREEN_W - FAB_SIZE - EDGE_MARGIN;
    const initialY = SCREEN_H - FAB_SIZE - 100 - Math.max(insets.bottom, 16);

    const pan = useRef(new Animated.ValueXY({ x: initialX, y: initialY })).current;
    const isDragging = useRef(false);
    // Stores the absolute position where the current drag started
    const dragStartPos = useRef({ x: initialX, y: initialY });
    // Reference to the currently running spring animation so we can stop it
    const springAnimRef = useRef<Animated.CompositeAnimation | null>(null);

    // FAB visibility state
    const [isHidden, setIsHidden] = useState(false);
    const [showDismissZone, setShowDismissZone] = useState(false);

    // Prevent excessive re-renders by tracking dismiss zone hover state with a ref
    const [isOverDismissZone, setIsOverDismissZoneState] = useState(false);
    const isOverDismissZoneRef = useRef(false);
    const setIsOverDismissZone = useCallback((value: boolean) => {
        if (isOverDismissZoneRef.current !== value) {
            isOverDismissZoneRef.current = value;
            setIsOverDismissZoneState(value);
        }
    }, []);

    const dismissZoneOpacity = useRef(new Animated.Value(0)).current;
    const dismissZoneScale = useRef(new Animated.Value(0.5)).current;

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

    // Helper: reset FAB to default position (absolute, no offset)
    const resetToDefaultPosition = useCallback(() => {
        const resetX = SCREEN_W - FAB_SIZE - EDGE_MARGIN;
        const resetY = SCREEN_H - FAB_SIZE - 100 - Math.max(insets.bottom, 16);
        springAnimRef.current?.stop();
        springAnimRef.current = null;
        pan.setValue({ x: resetX, y: resetY });
        dragStartPos.current = { x: resetX, y: resetY };
    }, [SCREEN_W, SCREEN_H, insets.bottom, pan]);

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

    // Use refs for callbacks used inside PanResponder to avoid stale closures
    const dismissZoneXRef = useRef(dismissZoneX);
    const dismissZoneYRef = useRef(dismissZoneY);
    dismissZoneXRef.current = dismissZoneX;
    dismissZoneYRef.current = dismissZoneY;

    const isInDismissZone = useCallback((fabX: number, fabY: number) => {
        const fabCenterX = fabX + FAB_SIZE / 2;
        const fabCenterY = fabY + FAB_SIZE / 2;
        const zoneCenterX = dismissZoneXRef.current + DISMISS_ZONE_SIZE / 2;
        const zoneCenterY = dismissZoneYRef.current + DISMISS_ZONE_SIZE / 2;
        const distance = Math.sqrt(
            (fabCenterX - zoneCenterX) ** 2 + (fabCenterY - zoneCenterY) ** 2
        );
        return distance < DISMISS_ZONE_THRESHOLD;
    }, []);

    const showDismiss = useCallback(() => {
        setShowDismissZone(true);
        Animated.parallel([
            Animated.spring(dismissZoneOpacity, {
                toValue: 1,
                friction: 8,
                useNativeDriver: true,
            }),
            Animated.spring(dismissZoneScale, {
                toValue: 1,
                friction: 6,
                useNativeDriver: true,
            }),
        ]).start();
    }, [dismissZoneOpacity, dismissZoneScale]);

    const hideDismiss = useCallback(() => {
        Animated.parallel([
            Animated.timing(dismissZoneOpacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(dismissZoneScale, {
                toValue: 0.5,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setShowDismissZone(false);
            setIsOverDismissZone(false);
        });
    }, [dismissZoneOpacity, dismissZoneScale, setIsOverDismissZone]);

    // Store callbacks in refs so PanResponder always has latest versions
    const showDismissRef = useRef(showDismiss);
    const hideDismissRef = useRef(hideDismiss);
    const isInDismissZoneRef = useRef(isInDismissZone);
    const setIsOverDismissZoneRef = useRef(setIsOverDismissZone);
    const snapToEdgeRef = useRef((_x: number, _y: number) => {});

    showDismissRef.current = showDismiss;
    hideDismissRef.current = hideDismiss;
    isInDismissZoneRef.current = isInDismissZone;
    setIsOverDismissZoneRef.current = setIsOverDismissZone;

    const snapToEdge = useCallback(
        (x: number, y: number) => {
            const snapX =
                x + FAB_SIZE / 2 < SCREEN_W / 2 ? EDGE_MARGIN : SCREEN_W - FAB_SIZE - EDGE_MARGIN;

            const minY = insets.top + EDGE_MARGIN;
            const maxY = SCREEN_H - FAB_SIZE - EDGE_MARGIN - insets.bottom;
            const snapY = Math.max(minY, Math.min(y, maxY));

            // Animate using absolute values — no offset manipulation
            // useNativeDriver: false ensures JS always has accurate position
            // for reliable mid-animation grab
            const anim = Animated.spring(pan, {
                toValue: { x: snapX, y: snapY },
                friction: 7,
                tension: 80,
                useNativeDriver: false,
            });
            springAnimRef.current = anim;
            anim.start(({ finished }) => {
                if (finished) {
                    dragStartPos.current = { x: snapX, y: snapY };
                    springAnimRef.current = null;
                }
            });
        },
        [SCREEN_W, SCREEN_H, insets, pan]
    );

    snapToEdgeRef.current = snapToEdge;

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gestureState) =>
                Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5,
            onPanResponderGrant: () => {
                isDragging.current = false;
                // Stop any running snap-to-edge spring animation immediately
                if (springAnimRef.current) {
                    springAnimRef.current.stop();
                    springAnimRef.current = null;
                }
                // Read the current absolute position from the animated value
                // With useNativeDriver: false, JS value is always accurate
                pan.stopAnimation(currentValue => {
                    dragStartPos.current = { x: currentValue.x, y: currentValue.y };
                });
            },
            onPanResponderMove: (_, gestureState) => {
                if (Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5) {
                    if (!isDragging.current) {
                        isDragging.current = true;
                        showDismissRef.current();
                    }
                }

                // Absolute position = drag start + gesture delta
                const currentX = dragStartPos.current.x + gestureState.dx;
                const currentY = dragStartPos.current.y + gestureState.dy;

                if (isDragging.current) {
                    setIsOverDismissZoneRef.current(isInDismissZoneRef.current(currentX, currentY));
                }

                // Set absolute value directly — no offset needed
                pan.setValue({ x: currentX, y: currentY });
            },
            onPanResponderRelease: (_, gestureState) => {
                const finalX = dragStartPos.current.x + gestureState.dx;
                const finalY = dragStartPos.current.y + gestureState.dy;

                hideDismissRef.current();

                if (!isDragging.current) {
                    navigate('Chatbot');
                    dragStartPos.current = { x: finalX, y: finalY };
                } else if (isInDismissZoneRef.current(finalX, finalY)) {
                    setIsHidden(true);
                    Toast.show({
                        type: 'success',
                        text1: 'Đã ẩn trợ lý ảo AI',
                        text2: 'Lắc điện thoại để bật lại',
                        visibilityTime: 4000,
                    });
                } else {
                    snapToEdgeRef.current(finalX, finalY);
                }
            },
        })
    ).current;

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
                            opacity: dismissZoneOpacity,
                            transform: [{ scale: dismissZoneScale }],
                            backgroundColor: isOverDismissZone
                                ? colors.red[500]
                                : 'rgba(0, 0, 0, 0.6)',
                        },
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
            <Animated.View
                {...panResponder.panHandlers}
                style={[
                    styles.fab,
                    {
                        transform: [{ translateX: pan.x }, { translateY: pan.y }],
                    },
                ]}
            >
                <ChatbotAvatar size={FAB_SIZE} animated />
            </Animated.View>
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
