import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
    TouchableHighlight,
    Dimensions,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    interpolate,
    Extrapolation,
    runOnJS,
} from 'react-native-reanimated';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius } from '@/styles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ButtonMetaerialProps {
    onShowMenu: (position: { x: number; y: number; width: number; height: number }) => void;
    isOpen: boolean;
}

export const ButtonMetaerial: React.FC<ButtonMetaerialProps> = React.memo(
    ({ onShowMenu, isOpen }) => {
        const buttonRef = useRef<View>(null);
        const isMeasuring = useRef(false);
        const lastPosition = useRef<{ x: number; y: number; width: number; height: number } | null>(
            null
        );
        const rotation = useSharedValue(0);

        React.useEffect(() => {
            rotation.value = withTiming(isOpen ? 1 : 0, { duration: 250 });
        }, [isOpen, rotation]);

        const animatedIconStyle = useAnimatedStyle(() => {
            const rotate = interpolate(rotation.value, [0, 1], [0, 45]);
            return {
                transform: [{ rotate: `${rotate}deg` }],
            };
        });

        const handlePress = () => {
            if (isMeasuring.current) return;

            if (lastPosition.current && isOpen) {
                onShowMenu(lastPosition.current);
                return;
            }

            isMeasuring.current = true;
            buttonRef.current?.measure((x, y, width, height, pageX, pageY) => {
                isMeasuring.current = false;
                const position = {
                    x: pageX || 0,
                    y: pageY || 0,
                    width: width || 0,
                    height: height || 0,
                };
                lastPosition.current = position;
                onShowMenu(position);
            });
        };

        return (
            <TouchableOpacity
                ref={buttonRef}
                style={styles.button}
                onPress={handlePress}
                activeOpacity={0.7}
            >
                <Text style={styles.buttonText}>Thêm</Text>
                <Animated.View style={animatedIconStyle}>
                    <Ionicons name="add" size={20} color={colors.text} />
                </Animated.View>
            </TouchableOpacity>
        );
    }
);

interface MaterialMenuOverlayProps {
    isOpen: boolean;
    buttonPosition: { x: number; y: number; width: number; height: number };
    onClose: () => void;
    onPressCreateImport?: () => void;
    onPressCreateExport?: () => void;
    onPressCreateAdjustment?: () => void;
    onPressCreateMaterial?: () => void;
}

export const MaterialMenuOverlay: React.FC<MaterialMenuOverlayProps> = React.memo(props => {
    const {
        isOpen,
        buttonPosition,
        onClose,
        onPressCreateImport,
        onPressCreateExport,
        onPressCreateAdjustment,
        onPressCreateMaterial,
    } = props;

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

    const menuItems = [
        { label: 'Tạo Phiếu Nhập Kho', onPress: onPressCreateImport },
        { label: 'Tạo Phiếu Xuất Kho', onPress: onPressCreateExport },
        { label: 'Tạo Phiếu Điều Chỉnh Tồn Kho', onPress: onPressCreateAdjustment },
        { label: 'Tạo Vật Tư', onPress: onPressCreateMaterial },
    ];

    const menuRight = SCREEN_WIDTH - (buttonPosition?.x || 0) - (buttonPosition?.width || 0);
    const menuTop = (buttonPosition?.y || 0) + (buttonPosition?.height || 0) + 8;

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
                {menuItems.map((item, index) => (
                    <TouchableHighlight
                        key={index}
                        style={styles.menuItem}
                        underlayColor="#F5F5F7"
                        onPress={() => {
                            onClose();
                            setTimeout(() => {
                                item.onPress?.();
                            }, 50);
                        }}
                    >
                        <Text style={styles.menuItemText}>{item.label}</Text>
                    </TouchableHighlight>
                ))}
            </Animated.View>
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        alignItems: 'flex-end',
    },
    button: {
        flexDirection: 'row',
        height: 32,
        paddingHorizontal: 12,
        borderRadius: borderRadius.full,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    buttonText: {
        fontSize: 14,
        lineHeight: 22,
        fontWeight: '500',
        color: colors.text,
        marginRight: spacing.xs,
    },
    absoluteOverlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 2000,
        elevation: 2000,
    },
    modalOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'transparent',
    },
    overlayContainer: {
        position: 'absolute',
        zIndex: 1000,
    },
    menuContainer: {
        position: 'absolute',
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        paddingVertical: spacing.xs,
        minWidth: 280,
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
    menuItem: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.sm,
        marginHorizontal: spacing.xs,
    },
    menuItemText: {
        fontSize: 16,
        color: colors.text,
        fontWeight: '400',
    },
});
