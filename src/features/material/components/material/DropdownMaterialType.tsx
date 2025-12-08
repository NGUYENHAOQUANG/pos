import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
    ScrollView,
    ViewStyle,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius } from '@/styles';

interface DropdownMaterialTypeProps {
    value?: string;
    onChange?: (value: string) => void;
    group?: string; // The selected material group
    label?: string;
    required?: boolean;
    placeholder?: string;
    dropdownStyle?: ViewStyle;
}

// Define the mapping based on analysis
const MATERIAL_TYPES_MAP: Record<string, string[]> = {
    'Nuôi': [
        'Con giống khác',
        'Thức ăn sống',
    ],
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
    'CCDC': [
        'Công cụ dụng cụ',
        'Kit kiểm tra chất lượng nước',
        'Nhiên liệu',
        'Phụ tùng',
    ],
    'Thiết bị điện': [
        'Thiết bị điện',
    ],
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
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [options, setOptions] = useState<string[]>([]);

    // Update options when group changes
    useEffect(() => {
        if (group && MATERIAL_TYPES_MAP[group]) {
            setOptions(MATERIAL_TYPES_MAP[group]);
            // If the current value is not in the new options, clear it (optional, but good UX)
            // We'll let the parent handle clearing if needed, or do it here.
            // However, to be safe, if we switch groups, we should probably clear value if it doesn't match.
            // But the prop `value` is controlled by parent. We can't clear it here directly without triggering onChange('')
            // Let's just update options.
        } else {
            setOptions([]);
        }
    }, [group]);


    const handleSelect = (option: string) => {
        onChange?.(option);
        setIsOpen(false);
    };

    const isDisabled = !group || options.length === 0;

    return (
        <View style={[styles.container, isOpen && styles.containerZ1000]}>
            {/* Label */}
            {label && (
                <View style={styles.labelContainer}>
                    {required && <Text style={styles.required}>* </Text>}
                    <Text style={styles.label}>{label}</Text>
                </View>
            )}

            <TouchableOpacity
                style={[styles.button, isDisabled && styles.buttonDisabled]}
                onPress={() => !isDisabled && setIsOpen(!isOpen)}
                activeOpacity={0.7}
                disabled={isDisabled}
            >
                <Text style={[styles.text, !value && styles.placeholderText]}>
                    {value || placeholder}
                </Text>
                <Ionicons
                    name="chevron-down"
                    size={20}
                    color={isDisabled ? colors.textSecondary : (colors.textSecondary || '#999')}
                />
            </TouchableOpacity>

            {isOpen && (
                <View style={[styles.dropdown, dropdownStyle]}>
                    <ScrollView nestedScrollEnabled style={styles.scrollContent}>
                        {options.map((option, index) => {
                            const isSelected = option === value;
                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={[styles.item, isSelected && styles.itemSelected]}
                                    onPress={() => handleSelect(option)}
                                >
                                    <Text style={[styles.itemText, isSelected && styles.itemTextSelected]}>
                                        {option}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        zIndex: 10,
        position: 'relative',
    },
    labelContainer: {
        flexDirection: 'row',
        marginBottom: spacing.xs,
    },
    label: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '400',
    },
    required: {
        fontSize: 14,
        color: colors.error || '#FF4D4F',
    },
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
    buttonDisabled: {
        backgroundColor: '#F5F5F5',
        borderColor: '#E0E0E0',
    },
    text: {
        flex: 1,
        fontSize: 15,
        color: colors.text,
    },
    placeholderText: {
        color: colors.textSecondary || '#999',
    },
    dropdown: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        marginTop: 4,
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        maxHeight: 800,
        zIndex: 1000,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    scrollContent: {
        paddingVertical: spacing.xs,
    },
    item: {
        paddingVertical: spacing.sm + 2,
        paddingHorizontal: spacing.md,
        marginHorizontal: spacing.xs,
        borderRadius: borderRadius.sm,
    },
    itemSelected: {
        backgroundColor: '#F3F4F6',
    },
    itemText: {
        fontSize: 14,
        color: colors.text,
    },
    itemTextSelected: {
        fontWeight: '500',
        color: colors.text,
    },
    containerZ1000: {
        zIndex: 1000,
    },
});
