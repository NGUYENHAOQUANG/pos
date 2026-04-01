import React, { useState, useRef } from 'react';
import {
    View,
    TouchableOpacity,
    StyleSheet,
    Modal,
    FlatList,
    StyleProp,
    ViewStyle,
} from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import ChevronDownIcon from '@/assets/Icon/ChevronDown.svg';
import ChevronUpIcon from '@/assets/Icon/ChevronUp.svg';

import { colors, spacing, borderRadius, shadows, typography } from '@/styles';
import IconEnvironment from '@/assets/Icon/IconDevices/EnvironmentOutlined.svg';
import { AutoScrollText } from '@/shared/components/ui/AutoScrollText';
import { RequiredDot } from '@/shared/components/forms/Input';

export interface DropDownItem {
    id: string | number;
    label: string;
    value?: any;
}

interface DropDownButtonBasicProps {
    data?: DropDownItem[];
    value?: DropDownItem;
    onSelect?: (item: DropDownItem) => void;
    style?: StyleProp<ViewStyle>;
    showIcon?: boolean;
    height?: number;
    borderRadius?: number;
    disabled?: boolean;
    placeholder?: string;
    label?: string;
    required?: boolean;
}

const DEFAULT_DATA: DropDownItem[] = [
    { id: '1', label: 'Trại Kiên Giang' },
    { id: '2', label: 'Trại Cà Mau' },
    { id: '3', label: 'Trại Bạc Liêu' },
];

export const DropDownButtonBasic: React.FC<DropDownButtonBasicProps> = ({
    data = DEFAULT_DATA,
    value,
    onSelect,
    style,
    showIcon = true,
    height = 40,
    borderRadius: customBorderRadius = spacing.sm,
    disabled = false,
    placeholder = 'Chọn',
    label,
    required = false,
}) => {
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [currentItem, setCurrentItem] = useState<DropDownItem | undefined>(value);
    const dropdownButtonRef = useRef<View>(null);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

    React.useEffect(() => {
        setCurrentItem(value);
    }, [value]);

    const handleDropdownPress = () => {
        if (disabled) return;
        if (dropdownButtonRef.current) {
            dropdownButtonRef.current.measureInWindow((x, y, width, measuredHeight) => {
                setDropdownPosition({
                    top: y + measuredHeight + 4,
                    left: x,
                    width: width,
                });
                setIsDropdownVisible(true);
            });
        }
    };

    const handleSelect = (item: DropDownItem) => {
        setCurrentItem(item);
        setIsDropdownVisible(false);
        onSelect?.(item);
    };

    const renderItem = ({ item }: { item: DropDownItem }) => {
        const isSelected = currentItem ? item.id === currentItem.id : false;
        return (
            <TouchableOpacity
                style={[styles.dropdownItem, isSelected && styles.dropdownItemSelected]}
                onPress={() => handleSelect(item)}
                activeOpacity={0.7}
            >
                <View style={styles.dropdownItemTextContainer}>
                    <AutoScrollText
                        text={item.label}
                        style={[
                            styles.dropdownItemText,
                            isSelected && styles.dropdownItemTextSelected,
                        ]}
                        speed={25}
                    />
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={style}>
            {label && (
                <View style={[styles.labelWrapper, { marginBottom: 6 }]}>
                    <Text style={styles.labelText} maxFontSizeMultiplier={1.1}>
                        {label}
                    </Text>
                    {required && <RequiredDot />}
                </View>
            )}

            {/* Dropdown Picker */}
            <View ref={dropdownButtonRef} collapsable={false}>
                <TouchableOpacity
                    style={[
                        styles.locationButton,
                        { height, borderRadius: customBorderRadius },
                        disabled && styles.disabledButton,
                    ]}
                    onPress={handleDropdownPress}
                    activeOpacity={disabled ? 1 : 0.7}
                >
                    {showIcon && (
                        <IconEnvironment width={18} height={18} style={styles.locationIcon} />
                    )}
                    <Text
                        style={[
                            styles.locationText,
                            !currentItem && styles.placeholderText,
                            disabled && styles.disabledText,
                        ]}
                        numberOfLines={1}
                    >
                        {currentItem?.label || placeholder}
                    </Text>
                    {!disabled &&
                        (isDropdownVisible ? (
                            <ChevronUpIcon width={18} height={18} color={colors.defaultBorder} />
                        ) : (
                            <ChevronDownIcon width={18} height={18} color={colors.defaultBorder} />
                        ))}
                </TouchableOpacity>
            </View>

            {/* Dropdown Modal */}
            <Modal
                visible={isDropdownVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setIsDropdownVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setIsDropdownVisible(false)}
                >
                    <View
                        style={[
                            styles.dropdownContainer,
                            {
                                top: dropdownPosition.top,
                                left: dropdownPosition.left,
                                width: dropdownPosition.width,
                                borderRadius: customBorderRadius,
                            },
                        ]}
                    >
                        <FlatList
                            data={data}
                            keyExtractor={item => item.id.toString()}
                            renderItem={renderItem}
                            // scrollEnabled={false}
                            contentContainerStyle={styles.dropdownScrollContent}
                            showsVerticalScrollIndicator={false}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    labelWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    labelText: {
        fontSize: typography.fontSize.sm,
        fontWeight: '500',
        color: colors.text,
        lineHeight: 20,
    },
    locationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
        maxHeight: 220, // Limit height to show approx 5 items
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
        backgroundColor: colors.gray[200],
    },
    dropdownItemTextContainer: {
        flex: 1,
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
        color: colors.text,
    },
});
