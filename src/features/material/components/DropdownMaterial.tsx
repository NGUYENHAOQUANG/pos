import React, { useState, useEffect, useRef, useContext } from 'react';
import {
    View,
    TouchableOpacity,
    StyleSheet,
    Platform,
    ViewStyle,
    FlatList,
    Modal,
    TouchableWithoutFeedback,
    ScrollView,
} from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius } from '@/styles';
import { AutoScrollText } from '@/shared/components/ui/AutoScrollText';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { DropdownScrollContext } from '@/features/material/hooks/useDropdownScroll';
import { RequiredDot } from '@/shared/components/forms/Input';

export interface DropdownOption {
    label: string;
    value: string | number;
    disabled?: boolean;
}

interface DropdownMaterialProps {
    value?: string | number;
    onChange?: (value: any) => void;
    options?: (string | DropdownOption)[];
    label?: string | React.ReactNode;
    required?: boolean;
    placeholder?: string;
    dropdownStyle?: ViewStyle;
    showAllOption?: boolean;
    inline?: boolean;
    isOpen: boolean;
    onToggle: () => void;
    useAutoScroll?: boolean;
    disabled?: boolean;
    displayValue?: string;
}

export const DropdownMaterial: React.FC<DropdownMaterialProps> = ({
    value,
    onChange,
    options = [
        'Tất cả nhóm vật tư',
        'Nuôi',
        'Vật tư nội bộ',
        'CCDC',
        'Thiết bị điện',
        'Chi phí khác',
    ],
    label,
    required,
    placeholder = 'Tất cả nhóm vật tư',
    dropdownStyle,
    showAllOption = true,
    isOpen,
    onToggle,
    inline = false,
    useAutoScroll = false,
    disabled = false,
    displayValue,
}) => {
    // Helper to get normalized options
    const getNormalizedOptions = (): DropdownOption[] => {
        return options.map(opt => {
            if (typeof opt === 'string') {
                return { label: opt, value: opt };
            }
            return opt;
        });
    };

    const allOptions = getNormalizedOptions();
    const displayOptions = showAllOption
        ? allOptions
        : allOptions.filter(opt => opt.label !== 'Tất cả nhóm vật tư');

    const scrollOffset = useContext(DropdownScrollContext);
    const initialScrollY = useSharedValue(0);

    const buttonRef = useRef<View>(null);
    const flatListRef = useRef<FlatList<DropdownOption>>(null);
    const [dropdownCoords, setDropdownCoords] = useState({ top: 0, left: 0, width: 0 });

    useEffect(() => {
        if (!inline && isOpen && buttonRef.current) {
            buttonRef.current.measureInWindow((x, y, width, height) => {
                initialScrollY.value = scrollOffset?.value || 0;
                setDropdownCoords({
                    top: y + height + 4,
                    left: x,
                    width: width,
                });
            });
        }
    }, [isOpen, inline, scrollOffset, initialScrollY]);

    const animatedStyle = useAnimatedStyle(() => {
        if (!scrollOffset) return {};
        const deltaY = initialScrollY.value - scrollOffset.value;
        return {
            transform: [{ translateY: deltaY }],
        };
    });

    // Track previous isOpen state to detect when dropdown opens
    const prevIsOpenRef = useRef(isOpen);

    // Scroll to selected item when dropdown opens
    useEffect(() => {
        // Only scroll when dropdown changes from closed to open
        if (
            isOpen &&
            !prevIsOpenRef.current &&
            value &&
            flatListRef.current &&
            displayOptions.length > 0
        ) {
            // Find the index of the selected item
            const selectedIndex = displayOptions.findIndex(opt => opt.value === value);
            if (selectedIndex >= 0) {
                // Use setTimeout to ensure FlatList is rendered before scrolling
                const timeoutId = setTimeout(() => {
                    flatListRef.current?.scrollToIndex({
                        index: selectedIndex,
                        animated: true,
                        viewPosition: 0.5, // Center the item in the visible area
                    });
                }, 150);

                // Cleanup timeout on unmount or when dependencies change
                return () => clearTimeout(timeoutId);
            }
        }
        // Update previous isOpen state
        prevIsOpenRef.current = isOpen;
    }, [isOpen, value, displayOptions]);

    const handleSelect = (option: DropdownOption) => {
        // Don't handle selection if option is disabled
        if (option.disabled) {
            return;
        }
        onChange?.(option.value);
        onToggle();
    };

    const renderItem = ({ item }: { item: DropdownOption }) => {
        const isSelected = item.value === value;
        const isDisabled = item.disabled;
        return (
            <TouchableOpacity
                style={[
                    styles.item,
                    isSelected && styles.itemSelected,
                    isDisabled && styles.itemDisabled,
                ]}
                onPress={() => handleSelect(item)}
                disabled={isDisabled}
                activeOpacity={isDisabled ? 1 : 0.7}
            >
                <AutoScrollText
                    text={item.label}
                    style={[
                        styles.itemText,
                        isSelected && styles.itemTextSelected,
                        isDisabled && styles.itemTextDisabled,
                    ]}
                    containerStyle={styles.autoScrollContainer}
                    speed={30}
                    spacing={40}
                />
            </TouchableOpacity>
        );
    };

    const dynamicDropdownStyle: ViewStyle = {
        top: dropdownCoords.top,
        left: dropdownCoords.left,
        width: dropdownCoords.width,
    };

    const dropdownList = (
        <Animated.View
            style={[
                styles.dropdown,
                inline
                    ? styles.dropdownInline
                    : [dropdownStyle, dynamicDropdownStyle, animatedStyle],
            ]}
        >
            {inline ? (
                <ScrollView
                    nestedScrollEnabled={true}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.scrollContent}
                >
                    {displayOptions.map((item, index) => (
                        <View key={String(item.value) + index}>{renderItem({ item })}</View>
                    ))}
                </ScrollView>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={displayOptions}
                    keyExtractor={(item, index) => String(item.value) + index}
                    renderItem={renderItem}
                    nestedScrollEnabled={true}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={true}
                    indicatorStyle="black"
                    onScrollToIndexFailed={(info: {
                        index: number;
                        highestMeasuredFrameIndex: number;
                        averageItemLength: number;
                    }) => {
                        // Handle scroll to index failure by scrolling to offset
                        const wait = new Promise<void>(resolve => setTimeout(() => resolve(), 500));
                        wait.then(() => {
                            flatListRef.current?.scrollToIndex({
                                index: info.index,
                                animated: true,
                                viewPosition: 0.5,
                            });
                        });
                    }}
                />
            )}
        </Animated.View>
    );

    // Get display label for current value
    const currentLabel =
        displayValue || allOptions.find(opt => opt.value === value)?.label || value?.toString();

    const renderButtonContent = () => {
        if (useAutoScroll) {
            return value ? (
                <AutoScrollText
                    text={currentLabel || ''}
                    key={`${String(value)}-${currentLabel}`}
                    style={{
                        ...StyleSheet.flatten(styles.text),
                        flex: undefined,
                    }}
                    containerStyle={{ width: '100%' }}
                />
            ) : (
                <AutoScrollText
                    text={placeholder}
                    key={placeholder}
                    style={{
                        ...StyleSheet.flatten([styles.text, styles.placeholderText]),
                        flex: undefined,
                    }}
                    containerStyle={{ width: '100%' }}
                />
            );
        } else {
            return (
                <Text
                    style={[styles.text, !value && styles.placeholderText]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                    {currentLabel || placeholder}
                </Text>
            );
        }
    };

    return (
        <View style={styles.container}>
            {label && (
                <View style={styles.labelContainer}>
                    <Text style={styles.label} maxFontSizeMultiplier={1.1}>
                        {label}
                    </Text>
                    {required && <RequiredDot />}
                </View>
            )}

            <TouchableOpacity
                ref={buttonRef}
                style={[styles.button, disabled && { opacity: 0.6 }]}
                onPress={onToggle}
                activeOpacity={0.7}
                disabled={disabled}
            >
                <View style={{ flex: 1, marginRight: spacing.xs, justifyContent: 'center' }}>
                    {renderButtonContent()}
                </View>
                <Ionicons
                    name={isOpen ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={colors.textSecondary || '#999'}
                />
            </TouchableOpacity>

            {/* Inline Dropdown */}
            {inline && isOpen && dropdownList}

            {/* Modal Dropdown */}
            {!inline && (
                <Modal
                    visible={isOpen}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={onToggle}
                >
                    <TouchableWithoutFeedback onPress={onToggle}>
                        <View style={styles.modalOverlay}>{dropdownList}</View>
                    </TouchableWithoutFeedback>
                </Modal>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { zIndex: 10 },
    labelContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    label: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '500',
        lineHeight: 20,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 40,
        paddingHorizontal: 12,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.sm,
    },
    text: {
        flex: 1,
        fontSize: 14,
        color: colors.text,
        lineHeight: 40,
        textAlignVertical: 'center',
    },
    placeholderText: { color: colors.textSecondary || '#999' },
    modalOverlay: {
        flex: 1,
    },
    dropdown: {
        position: 'absolute',
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        maxHeight: 250,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
            },
            android: { elevation: 8 },
        }),
    },
    scrollContent: { paddingVertical: spacing.xs },
    item: {
        paddingVertical: spacing.sm + 2,
        paddingHorizontal: spacing.md,
        marginHorizontal: spacing.xs,
        borderRadius: borderRadius.sm,
    },
    itemDisabled: {
        opacity: 0.5,
    },
    itemSelected: { backgroundColor: '#F3F4F6' },
    itemText: { fontSize: 14, color: colors.text },
    itemTextSelected: { fontWeight: '500', color: colors.text },
    itemTextDisabled: { color: colors.textSecondary },
    autoScrollContainer: {
        width: '100%',
        minHeight: 20,
    },
    dropdownInline: {
        position: 'relative',
        width: '100%',
        marginTop: spacing.xs,
        elevation: 0,
        shadowOpacity: 0,
    },
});
