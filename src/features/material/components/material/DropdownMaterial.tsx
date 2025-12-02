import React, { useState } from 'react';
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

interface DropdownMaterialProps {
    value?: string;
    onChange?: (value: string) => void;
    options?: string[];
    label?: string;
    required?: boolean;
    placeholder?: string;
    dropdownStyle?: ViewStyle;
    showAllOption?: boolean;
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
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const displayOptions = showAllOption
        ? options
        : options.filter(option => option !== 'Tất cả nhóm vật tư');

    const handleSelect = (option: string) => {
        onChange?.(option);
        setIsOpen(false);
    };

    return (
        <View style={styles.container}>
            {/* Label */}
            {label && (
                <View style={styles.labelContainer}>
                    {required && <Text style={styles.required}>* </Text>}
                    <Text style={styles.label}>{label}</Text>
                </View>
            )}

            <TouchableOpacity
                style={styles.button}
                onPress={() => setIsOpen(!isOpen)}
                activeOpacity={0.7}
            >
                <Text style={[styles.text, !value && styles.placeholderText]}>
                    {value || placeholder}
                </Text>
                <Ionicons
                    name="chevron-down"
                    size={20}
                    color={colors.textSecondary || '#999'}
                />
            </TouchableOpacity>

            {isOpen && (
                <View style={[styles.dropdown, dropdownStyle]}>
                    <ScrollView nestedScrollEnabled style={styles.scrollContent}>
                        {displayOptions.map((option, index) => {
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
    text: {
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
        marginTop: spacing['2xl'],
        backgroundColor: colors.white,
        borderRadius: borderRadius.md, // Increased border radius
        borderWidth: 1,
        borderColor: '#E5E7EB', // Lighter border
        maxHeight: 250,
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
        marginHorizontal: spacing.xs, // Add margin for rounded hover effect look
        borderRadius: borderRadius.sm,
    },
    itemSelected: {
        backgroundColor: '#F3F4F6', // Light gray background
    },
    itemText: {
        fontSize: 14,
        color: colors.text,
    },
    itemTextSelected: {
        fontWeight: '500',
        color: colors.text,
    },
});
