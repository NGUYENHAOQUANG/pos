import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
    FlatList,
    ViewStyle,
    Modal,
    TouchableWithoutFeedback,
    StatusBar,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius } from '@/styles';

interface DropdownMaterialTypeProps {
    value?: string;
    onChange?: (value: string) => void;
    group?: string;
    label?: string;
    required?: boolean;
    placeholder?: string;
    dropdownStyle?: ViewStyle;
    isOpen: boolean;
    onToggle: () => void;
}

const MATERIAL_TYPES_MAP: Record<string, string[]> = {
    Nuôi: ['Con giống khác', 'Thức ăn sống'],
    'Vật tư nội bộ': [
        'Chất cải thiện nước',
        'Chất xử lý nước',
        'Chế phẩm sinh học',
        'Dinh dưỡng bổ sung',
        'Hoá chất',
        'Khoáng chất',
        'Khác',
        'Nauplii',
        'Thuốc trộn',
        'Thức ăn cho tôm',
        'Trị bệnh',
        'Tôm bố mẹ',
        'Tôm giống',
    ],
    CCDC: ['Công cụ dụng cụ', 'Kit kiểm tra chất lượng nước', 'Nhiên liệu', 'Phụ tùng'],
    'Thiết bị điện': ['Thiết bị điện'],
    'Chi phí khác': [
        'Chi phí bán hàng',
        'Chi phí khác',
        'Chi phí khấu hao',
        'Chi phí lương',
        'Chi phí điện',
        'Chi phí điện nước',
        'Chi phí quản lý doanh nghiệp',
    ],
};

export const DropdownMaterialType: React.FC<DropdownMaterialTypeProps> = ({
    value,
    onChange,
    group,
    label = 'Loại vật tư',
    required,
    placeholder = 'Chọn loại',
    dropdownStyle,
    isOpen,
    onToggle,
}) => {
    const [options, setOptions] = useState<string[]>([]);
    const buttonRef = useRef<View>(null);
    const [dropdownCoords, setDropdownCoords] = useState({ top: 0, left: 0, width: 0 });

    useEffect(() => {
        if (group && MATERIAL_TYPES_MAP[group]) {
            setOptions(MATERIAL_TYPES_MAP[group]);
        } else {
            setOptions([]);
        }
    }, [group]);

    useEffect(() => {
        if (isOpen && buttonRef.current) {
            // Measure button position to place dropdown correctly
            buttonRef.current.measure(
                (fx: number, fy: number, width: number, height: number, px: number, py: number) => {
                    const statusBarHeight =
                        Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
                    setDropdownCoords({
                        top: py + height - statusBarHeight + 2,
                        left: px,
                        width: width,
                    });
                }
            );
        }
    }, [isOpen]);

    const handleSelect = (option: string) => {
        onChange?.(option);
        onToggle();
    };

    const isDisabled = !group || options.length === 0;

    const renderItem = ({ item }: { item: string }) => {
        const isSelected = item === value;
        return (
            <TouchableOpacity
                style={[styles.item, isSelected && styles.itemSelected]}
                onPress={() => handleSelect(item)}
            >
                <Text style={[styles.itemText, isSelected && styles.itemTextSelected]}>{item}</Text>
            </TouchableOpacity>
        );
    };

    const dynamicDropdownStyle: ViewStyle = {
        top: dropdownCoords.top,
        left: dropdownCoords.left,
        width: dropdownCoords.width,
    };

    return (
        <View style={styles.container}>
            {label && (
                <View style={styles.labelContainer}>
                    {required && <Text style={styles.required}>* </Text>}
                    <Text style={styles.label}>{label}</Text>
                </View>
            )}

            <TouchableOpacity
                ref={buttonRef}
                style={[styles.button, isDisabled && styles.buttonDisabled]}
                onPress={() => !isDisabled && onToggle()}
                activeOpacity={0.7}
                disabled={isDisabled}
            >
                <Text style={[styles.text, !value && styles.placeholderText]}>
                    {value || placeholder}
                </Text>
                <Ionicons
                    name="chevron-down"
                    size={20}
                    color={isDisabled ? colors.textSecondary : colors.textSecondary || '#999'}
                />
            </TouchableOpacity>

            <Modal
                visible={isOpen}
                transparent={true}
                animationType="fade"
                onRequestClose={onToggle}
            >
                <TouchableWithoutFeedback onPress={onToggle}>
                    <View style={styles.modalOverlay}>
                        <View style={[styles.dropdown, dropdownStyle, dynamicDropdownStyle]}>
                            <FlatList
                                data={options}
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={renderItem}
                                nestedScrollEnabled={true}
                                keyboardShouldPersistTaps="handled"
                                contentContainerStyle={styles.scrollContent}
                                showsVerticalScrollIndicator={true}
                                indicatorStyle="black"
                            />
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, zIndex: 10 },
    labelContainer: { flexDirection: 'row', marginBottom: spacing.xs },
    label: { fontSize: 14, color: colors.text, fontWeight: '400' },
    required: { fontSize: 14, color: colors.error || '#FF4D4F' },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 44,
        paddingHorizontal: spacing.md,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.sm,
    },
    buttonDisabled: { backgroundColor: '#F5F5F5', borderColor: '#E0E0E0' },
    text: { flex: 1, fontSize: 15, color: colors.text },
    placeholderText: { color: colors.textSecondary || '#999' },
    modalOverlay: {
        flex: 1,
        // No background color to keep it fully transparent
    },
    dropdown: {
        position: 'absolute',
        // top/left/width will be set via inline styles
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
    itemSelected: { backgroundColor: '#F3F4F6' },
    itemText: { fontSize: 14, color: colors.text },
    itemTextSelected: { fontWeight: '500', color: colors.text },
});
