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
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { colors, spacing, borderRadius, shadows } from '@/styles';
import IconEnvironment from '@/assets/Icon/IconDevices/EnvironmentOutlined.svg';

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
                <Text
                    style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextSelected]}
                >
                    {item.label}
                </Text>
                {isSelected && <Ionicons name="checkmark" size={18} color={colors.primary} />}
            </TouchableOpacity>
        );
    };

    return (
        <View style={style}>
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
                    {!disabled && (
                        <Ionicons
                            name={isDropdownVisible ? 'chevron-up' : 'chevron-down'}
                            size={18}
                            color={colors.defaultBorder}
                        />
                    )}
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
                                minWidth: dropdownPosition.width,
                                borderRadius: customBorderRadius,
                            },
                        ]}
                    >
                        <FlatList
                            data={data}
                            keyExtractor={item => item.id.toString()}
                            renderItem={renderItem}
                            scrollEnabled={false}
                            contentContainerStyle={styles.dropdownScrollContent}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
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
    },
});
