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
import AntDesign from 'react-native-vector-icons/AntDesign';
import { colors, spacing, borderRadius, shadows, typography } from '@/styles';

export interface DropDownItem {
    id: string | number;
    label: string;
    value?: string | number;
}

interface DropDownButtonProps {
    data?: DropDownItem[];
    value?: DropDownItem;
    onSelect?: (item: DropDownItem) => void;
    style?: StyleProp<ViewStyle>;
    placeholder?: string;
    height?: number;
    borderRadius?: number;
}

const DEFAULT_DATA: DropDownItem[] = [
    { id: '1', label: 'Trại Kiên Giang' },
    { id: '2', label: 'Trại Cà Mau' },
    { id: '3', label: 'Trại Bạc Liêu' },
];

export const DropDownButton: React.FC<DropDownButtonProps> = ({
    data = DEFAULT_DATA,
    value,
    onSelect,
    style,
    placeholder = 'Chọn trại',
    height = 40,
    borderRadius: customBorderRadius,
}) => {
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [currentItem, setCurrentItem] = useState<DropDownItem | undefined>(value);
    const dropdownButtonRef = useRef<View>(null);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

    React.useEffect(() => {
        if (value !== undefined) {
            setCurrentItem(value);
        }
    }, [value]);

    const handleDropdownPress = () => {
        if (dropdownButtonRef.current) {
            dropdownButtonRef.current.measureInWindow((x, y, width, height) => {
                setDropdownPosition({
                    top: y + height + 4,
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
        const isSelected = item.id === currentItem?.id;
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
                {isSelected && <AntDesign name="check" size={18} color={colors.primary} />}
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, style]}>
            {/* Dropdown Picker */}
            <View ref={dropdownButtonRef} collapsable={false}>
                <TouchableOpacity
                    style={[
                        styles.dropdownButton,
                        { height, borderRadius: customBorderRadius ?? borderRadius.sm },
                    ]}
                    onPress={handleDropdownPress}
                    activeOpacity={0.7}
                >
                    <Text style={styles.buttonText} numberOfLines={1}>
                        {currentItem ? currentItem.label : placeholder}
                    </Text>
                    <AntDesign
                        name={isDropdownVisible ? 'up' : 'down'}
                        size={14}
                        color={colors.gray[400]}
                    />
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
                                width: dropdownPosition.width, // Match width exactly
                            },
                        ]}
                    >
                        <FlatList
                            data={data}
                            keyExtractor={item => item.id.toString()}
                            renderItem={renderItem}
                            contentContainerStyle={styles.dropdownScrollContent}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        zIndex: 1000,
    },
    dropdownButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        paddingHorizontal: spacing.md,
        borderWidth: 1,
        borderColor: colors.borderDark,
        justifyContent: 'space-between',
    },
    buttonText: {
        fontSize: typography.fontSize.sm,
        color: colors.text,
        flex: 1,
        marginRight: spacing.sm,
    },
    modalOverlay: {
        flex: 1,
    },
    dropdownContainer: {
        position: 'absolute',
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.borderDark,
        ...shadows.md,
        maxHeight: 250,
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
        backgroundColor: colors.blue[50], // Light blue bg for selected
    },
    dropdownItemText: {
        fontSize: typography.fontSize.sm,
        color: colors.text,
    },
    dropdownItemTextSelected: {
        fontWeight: typography.fontWeight.regular,
        color: colors.primary,
    },
});
