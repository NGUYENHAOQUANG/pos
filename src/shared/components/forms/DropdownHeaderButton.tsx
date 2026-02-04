import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    FlatList,
    StyleProp,
    ViewStyle,
    useWindowDimensions,
    Animated,
    Easing,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { colors, spacing, borderRadius, shadows } from '@/styles';

// Optional: Pass an icon component potentially
import IconEnvironment from '@/assets/Icon/IconDevices/EnvironmentOutlined.svg';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export interface DropDownHeaderItem {
    id: string | number;
    label: string;
    value?: any;
}

export interface DropdownHeaderButtonProps {
    data?: DropDownHeaderItem[];
    value?: DropDownHeaderItem;
    onSelect?: (item: DropDownHeaderItem) => void;
    style?: StyleProp<ViewStyle>;
    showIcon?: boolean;
    height?: number;
    borderRadius?: number;
    disabled?: boolean;
    placeholder?: string;
    icon?: React.ReactNode;
    rightItemWidth?: number;
}

export const DropdownHeaderButton: React.FC<DropdownHeaderButtonProps> = ({
    data = [],
    value,
    onSelect,
    style,
    showIcon = true,
    height = 40,
    borderRadius: customBorderRadius = spacing.sm,
    disabled = false,
    placeholder = 'Chọn',
    icon,
    rightItemWidth = 0,
}) => {
    const { width: windowWidth } = useWindowDimensions();
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [currentItem, setCurrentItem] = useState<DropDownHeaderItem | undefined>(value);

    // Animation State
    const widthAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const [isExpanded, setIsExpanded] = useState(false);
    const naturalWidth = useRef(0);
    const shouldAnimateRef = useRef(false);
    const pendingItemRef = useRef<DropDownHeaderItem | undefined>(undefined);

    const dropdownButtonRef = useRef<View>(null);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

    React.useEffect(() => {
        setCurrentItem(value);
    }, [value]);

    const handleDropdownPress = () => {
        if (disabled) return;
        if (dropdownButtonRef.current) {
            dropdownButtonRef.current.measureInWindow((x, y, width, measuredHeight) => {
                naturalWidth.current = width;
                setDropdownPosition({
                    top: y + measuredHeight + 4,
                    left: x,
                    width: width,
                });
                setIsDropdownVisible(true);
                // Start Fade In
                opacityAnim.setValue(0);
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                    easing: Easing.out(Easing.ease),
                }).start();
            });
        }
    };

    const handleClose = () => {
        // Gentle contraction
        Animated.parallel([
            Animated.timing(widthAnim, {
                toValue: naturalWidth.current,
                duration: 300,
                useNativeDriver: false,
                easing: Easing.out(Easing.ease),
            }),
            Animated.timing(opacityAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
                easing: Easing.out(Easing.ease),
            }),
        ]).start(() => {
            setIsExpanded(false);
            setIsDropdownVisible(false);
        });
    };

    const handleSelect = (item: DropDownHeaderItem) => {
        shouldAnimateRef.current = true;
        pendingItemRef.current = item;
        setCurrentItem(item); // Update content immediately

        // Start Fade Out immediately logic for modal
        Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
            easing: Easing.out(Easing.ease),
        }).start();
    };

    const onGhostLayout = (event: any) => {
        if (shouldAnimateRef.current) {
            shouldAnimateRef.current = false;
            const targetWidth = event.nativeEvent.layout.width;

            // Animate width to new target
            Animated.timing(widthAnim, {
                toValue: targetWidth,
                duration: 300,
                useNativeDriver: false,
                easing: Easing.out(Easing.ease),
            }).start(() => {
                setIsExpanded(false);
                setIsDropdownVisible(false);
                if (pendingItemRef.current) {
                    onSelect?.(pendingItemRef.current);
                    pendingItemRef.current = undefined;
                }
            });
        }
    };

    const onButtonLayout = (event: any) => {
        // Only update natural width if we are NOT currently overriding it with animation
        if (!isExpanded) {
            naturalWidth.current = event.nativeEvent.layout.width;
        }
    };

    const onModalLayout = (event: any) => {
        const { width } = event.nativeEvent.layout;
        // If modal width is significantly larger than current button width, animate expansion.
        // Threshold of 2 pixels to avoid micro-animations.
        if (width > naturalWidth.current + 2 && !isExpanded) {
            widthAnim.setValue(naturalWidth.current);
            setIsExpanded(true);
            Animated.timing(widthAnim, {
                toValue: width,
                duration: 400, // Slower duration for "gentle" feel
                useNativeDriver: false,
                easing: Easing.out(Easing.ease),
            }).start();
        }
    };

    const renderItem = ({ item }: { item: DropDownHeaderItem }) => {
        const isSelected = currentItem ? item.id === currentItem.id : false;
        return (
            <TouchableOpacity
                style={[styles.dropdownItem, isSelected && styles.dropdownItemSelected]}
                onPress={() => handleSelect(item)}
                activeOpacity={0.7}
            >
                <View style={styles.dropdownItemTextContainer}>
                    <Text
                        style={[
                            styles.dropdownItemText,
                            isSelected && styles.dropdownItemTextSelected,
                        ]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {item.label}
                    </Text>
                </View>
                {isSelected && <Ionicons name="checkmark" size={18} color={colors.primary} />}
            </TouchableOpacity>
        );
    };

    return (
        <View style={style}>
            {/* Ghost View for Measurement */}
            <View
                style={[
                    styles.locationButton,
                    { position: 'absolute', opacity: 0, zIndex: -1000 },
                    { width: undefined }, // Unconstrained
                ]}
                pointerEvents="none"
                onLayout={onGhostLayout}
            >
                {showIcon &&
                    (icon || (
                        <IconEnvironment width={18} height={18} style={styles.locationIcon} />
                    ))}
                <Text
                    style={[
                        styles.locationText,
                        !currentItem && styles.placeholderText,
                        // Adjust margin if icon is missing
                        !showIcon && { marginLeft: 0 },
                    ]}
                    numberOfLines={1}
                >
                    {currentItem?.label || placeholder}
                </Text>
                {!disabled && (
                    <Ionicons name={'chevron-down'} size={18} color={colors.defaultBorder} />
                )}
            </View>

            {/* Dropdown Picker */}
            <View ref={dropdownButtonRef} collapsable={false} onLayout={onButtonLayout}>
                <AnimatedTouchableOpacity
                    style={[
                        styles.locationButton,
                        { height, borderRadius: customBorderRadius },
                        disabled && styles.disabledButton,
                        isExpanded ? { width: widthAnim } : undefined,
                    ]}
                    onPress={handleDropdownPress}
                    activeOpacity={disabled ? 1 : 0.7}
                >
                    {showIcon &&
                        (icon || (
                            <IconEnvironment width={18} height={18} style={styles.locationIcon} />
                        ))}
                    <Text
                        style={[
                            styles.locationText,
                            !currentItem && styles.placeholderText,
                            disabled && styles.disabledText,
                            // Adjust margin if icon is missing
                            !showIcon && { marginLeft: 0 },
                        ]}
                        numberOfLines={1}
                    >
                        {currentItem?.label || placeholder}
                    </Text>
                    <View style={{ flex: 1 }} />
                    {!disabled && (
                        <Ionicons
                            name={isDropdownVisible ? 'chevron-up' : 'chevron-down'}
                            size={18}
                            color={colors.defaultBorder}
                        />
                    )}
                </AnimatedTouchableOpacity>
            </View>

            {/* Dropdown Modal */}
            <Modal
                visible={isDropdownVisible}
                transparent
                animationType="none"
                onRequestClose={handleClose}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={handleClose}
                >
                    <Animated.View
                        onLayout={onModalLayout}
                        style={[
                            styles.dropdownContainer,
                            {
                                opacity: opacityAnim,
                                top: dropdownPosition.top,
                                left: dropdownPosition.left,
                                minWidth: dropdownPosition.width,
                                maxWidth:
                                    windowWidth - dropdownPosition.left - (rightItemWidth + 16),
                                borderRadius: customBorderRadius,
                            },
                        ]}
                    >
                        <FlatList
                            data={data}
                            keyExtractor={item => item.id.toString()}
                            renderItem={renderItem}
                            contentContainerStyle={styles.dropdownScrollContent}
                        />
                    </Animated.View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    locationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: colors.white,
        paddingHorizontal: spacing.md,
        borderWidth: 1,
        borderColor: colors.gray[200],
    },
    locationIcon: {
        width: 18,
        height: 18,
        marginRight: spacing.xs,
    },
    locationText: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.text,
        marginRight: spacing.xs,
    },
    modalOverlay: {
        flex: 1,
    },
    dropdownContainer: {
        position: 'absolute',
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.gray[200],
        ...shadows.md,
        maxHeight: 220,
    },
    dropdownScrollContent: {
        paddingVertical: spacing.xs,
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.sm + 2,
        paddingHorizontal: spacing.md,
        marginHorizontal: spacing.xs,
        borderRadius: borderRadius.sm,
    },
    dropdownItemSelected: {
        backgroundColor: colors.blue[50],
    },
    dropdownItemTextContainer: {
        marginRight: spacing.xs,
    },
    dropdownItemText: {
        fontSize: 14,
        color: colors.text,
    },
    dropdownItemTextSelected: {
        fontWeight: '500',
        color: colors.text,
    },
    disabledButton: {
        backgroundColor: colors.gray[100],
        borderColor: colors.gray[200],
    },
    disabledText: {
        color: colors.textSecondary,
    },
    placeholderText: {
        color: colors.textSecondary,
        fontWeight: 'normal',
    },
});
