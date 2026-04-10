/**
 * @file ChatbotFAB.tsx
 * @description Draggable Floating Action Button for Chatbot
 * - Displays on all screens except Chatbot, Ingest, CameraPlayer
 * - Tap to navigate to Chatbot, drag to reposition, snaps to nearest edge
 * - Drag into dismiss zone (bottom center X icon) to hide the FAB
 * - Shake device to restore the FAB
 * @author Kindy
 */
import React, { useRef, useCallback, useState, useEffect, memo } from 'react';
import { StyleSheet, Animated, PanResponder, Dimensions } from 'react-native';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { navigate, navigationRef } from '@/app/navigation/NavigationRef';
import RNShake from 'react-native-shake';
import BotIcon from '@/assets/Icon/IconMenu/BotIcon.svg';
import CloseOutlined from '@/assets/Icon/CloseOutlined.svg';
import { colors } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { useSettingsStore } from '@/features/menu/store/settingsStore';

const HIDDEN_SCREENS = ['Chatbot', 'Ingest', 'CameraPlayer'];
const FAB_SIZE = 56;
const EDGE_MARGIN = 12;
const DISMISS_ZONE_SIZE = 64;
const DISMISS_ZONE_THRESHOLD = 80;

export const ChatbotFAB = memo(() => {
    const insets = useSafeAreaInsets();
    const theme = useAppTheme();
    const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

    // Initial position: bottom-right
    const initialX = SCREEN_W - FAB_SIZE - EDGE_MARGIN;
    const initialY = SCREEN_H - FAB_SIZE - 100 - Math.max(insets.bottom, 16);

    const pan = useRef(new Animated.ValueXY({ x: initialX, y: initialY })).current;
    const isDragging = useRef(false);
    const lastOffset = useRef({ x: initialX, y: initialY });

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

    // Shake to restore FAB
    useEffect(() => {
        const subscription = RNShake.addListener(() => {
            if (isHidden) {
                setIsHidden(false);
                const resetX = SCREEN_W - FAB_SIZE - EDGE_MARGIN;
                const resetY = SCREEN_H - FAB_SIZE - 100 - Math.max(insets.bottom, 16);
                lastOffset.current = { x: resetX, y: resetY };
                pan.setValue({ x: resetX, y: resetY });
                pan.setOffset({ x: 0, y: 0 });
                Toast.show({
                    type: 'success',
                    text1: 'Đã bật lại trợ lý ảo AI',
                    visibilityTime: 2000,
                });
            }
        });

        return () => subscription.remove();
    }, [isHidden, SCREEN_W, SCREEN_H, insets.bottom, pan]);

    // Restore FAB automatically when entering the Chatbot screen manually (e.g. from menu)
    useEffect(() => {
        if (currentRouteName === 'Chatbot' && isHidden) {
            setIsHidden(false);
            const resetX = SCREEN_W - FAB_SIZE - EDGE_MARGIN;
            const resetY = SCREEN_H - FAB_SIZE - 100 - Math.max(insets.bottom, 16);
            lastOffset.current = { x: resetX, y: resetY };
            pan.setValue({ x: resetX, y: resetY });
            pan.setOffset({ x: 0, y: 0 });
        }
    }, [currentRouteName, isHidden, SCREEN_W, SCREEN_H, insets.bottom, pan]);

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

            lastOffset.current = { x: snapX, y: snapY };
            pan.setOffset({ x: 0, y: 0 });

            Animated.spring(pan, {
                toValue: { x: snapX, y: snapY },
                friction: 7,
                tension: 80,
                useNativeDriver: true, // Optimized: running snap animation on UI thread
            }).start();
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
                pan.setOffset(lastOffset.current);
                pan.setValue({ x: 0, y: 0 });
            },
            onPanResponderMove: (_, gestureState) => {
                if (Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5) {
                    if (!isDragging.current) {
                        isDragging.current = true;
                        showDismissRef.current();
                    }
                }

                if (isDragging.current) {
                    const currentX = lastOffset.current.x + gestureState.dx;
                    const currentY = lastOffset.current.y + gestureState.dy;
                    setIsOverDismissZoneRef.current(isInDismissZoneRef.current(currentX, currentY));
                }

                pan.x.setValue(gestureState.dx);
                pan.y.setValue(gestureState.dy);
            },
            onPanResponderRelease: (_, gestureState) => {
                pan.flattenOffset();
                const finalX = lastOffset.current.x + gestureState.dx;
                const finalY = lastOffset.current.y + gestureState.dy;

                hideDismissRef.current();

                if (!isDragging.current) {
                    navigate('Chatbot');
                    lastOffset.current = { x: finalX, y: finalY };
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
                        backgroundColor: theme.background,
                        borderColor: theme.border,
                        transform: [{ translateX: pan.x }, { translateY: pan.y }],
                    },
                ]}
            >
                <BotIcon width={44} height={44} />
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
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.gray[200],
        zIndex: 9999,
    },
    dismissZone: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9998,
    },
});
