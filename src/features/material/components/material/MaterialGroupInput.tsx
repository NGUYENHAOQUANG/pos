import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Platform,
    Modal,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius, sizes } from '@/styles';

interface MaterialGroupProps {
    label?: string;
    required?: boolean;
    value?: string;
    options?: string[];
    onChange?: (value: string) => void;
    placeholder?: string;
}

export const MaterialGroup: React.FC<MaterialGroupProps> = ({
    label = 'Nhóm vật tư',
    required = false,
    value,
    options = [],
    onChange,
    placeholder = 'Chọn nhóm vật tư',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [layout, setLayout] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

    const handleSelect = (option: string) => {
        onChange?.(option);
        setIsOpen(false);
    };

    return (
        <View
            style={styles.container}
            onLayout={(event) => {
                setLayout(event.nativeEvent.layout);
            }}
        >
            {/* Label */}
            {label && (
                <View style={styles.labelContainer}>
                    {required && <Text style={styles.required}>* </Text>}
                    <Text style={styles.label}>{label}</Text>
                </View>
            )}

            {/* Trigger Button */}
            <TouchableOpacity
                style={styles.trigger}
                onPress={() => setIsOpen(!isOpen)}
                activeOpacity={0.7}
            >
                <Text style={[styles.valueText, !value && styles.placeholderText]}>
                    {value || placeholder}
                </Text>
                <Ionicons
                    name="chevron-down"
                    size={20}
                    color={colors.textSecondary || '#999'}
                />
            </TouchableOpacity>

            {/* Dropdown List */}
            {isOpen && (
                <View style={styles.dropdown}>
                    <ScrollView nestedScrollEnabled style={styles.scrollContent}>
                        {options.map((option, index) => {
                            const isSelected = option === value;
                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={[styles.option, isSelected && styles.selectedOption]}
                                    onPress={() => handleSelect(option)}
                                >
                                    <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
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
        marginBottom: spacing.md,
        zIndex: 10, // Ensure dropdown appears on top
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
    trigger: {
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
    valueText: {
        fontSize: 15,
        color: colors.text,
    },
    placeholderText: {
        color: colors.textSecondary || '#999',
    },
    dropdown: {
        position: 'absolute',
        top: '100%', // Position right below the trigger
        left: 0,
        right: 0,
        marginTop: 4,
        backgroundColor: colors.white,
        borderRadius: borderRadius.sm,
        borderWidth: 1,
        borderColor: colors.border,
        maxHeight: 200,
        zIndex: 1000,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    scrollContent: {
        paddingVertical: spacing.xs,
    },
    option: {
        paddingVertical: spacing.sm + 2,
        paddingHorizontal: spacing.md,
    },
    selectedOption: {
        backgroundColor: colors.background || '#F5F5F5',
    },
    optionText: {
        fontSize: 14,
        color: colors.text,
    },
    selectedOptionText: {
        fontWeight: '500',
    },
});
