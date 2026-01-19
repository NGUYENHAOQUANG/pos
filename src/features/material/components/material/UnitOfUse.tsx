import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Platform,
    TouchableWithoutFeedback,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AutoScrollText } from '@/shared/components/ui/AutoScrollText';
import { colors, spacing, borderRadius } from '@/styles';

interface UnitOfUseProps {
    label?: string;
    value?: string;
    options?: string[];
    onChange?: (value: string) => void;
    placeholder?: string;
    tooltipText?: string;
    isOpen: boolean;
    onToggle: () => void;
    disabled?: boolean;
}

export const UnitOfUse: React.FC<UnitOfUseProps> = ({
    label = 'Đơn vị sử dụng',
    value,
    options = [],
    onChange,
    placeholder = 'Chọn đơn vị sử dụng',
    tooltipText = 'Đơn vị sử dụng được dùng khi xuất kho sản phẩm (Ví dụ cho ăn ở ao, xuất kho hoá chất).',
    isOpen,
    onToggle,
    disabled = false,
}) => {
    const [showTooltip, setShowTooltip] = useState(false);

    const handleSelect = (option: string) => {
        onChange?.(option);
        onToggle();
    };

    return (
        <View style={styles.container}>
            {showTooltip && (
                <TouchableWithoutFeedback onPress={() => setShowTooltip(false)}>
                    <View style={styles.overlay} />
                </TouchableWithoutFeedback>
            )}
            {label && (
                <View style={styles.labelContainer}>
                    <Text style={styles.label}>{label}</Text>
                    <TouchableOpacity
                        onPress={() => setShowTooltip(!showTooltip)}
                        style={styles.helpIcon}
                    >
                        <Ionicons
                            name="help-circle-outline"
                            size={16}
                            color={colors.textSecondary || '#999'}
                        />
                    </TouchableOpacity>
                </View>
            )}

            {showTooltip && (
                <View style={styles.tooltipContainer}>
                    <View style={styles.tooltipArrow} />
                    <View style={styles.tooltipContent}>
                        <Text style={styles.tooltipText}>{tooltipText}</Text>
                    </View>
                </View>
            )}

            <TouchableOpacity
                style={[styles.trigger, disabled && styles.triggerDisabled]}
                onPress={() => !disabled && onToggle()}
                activeOpacity={0.7}
                disabled={disabled}
            >
                <AutoScrollText
                    key={value || placeholder}
                    text={value || placeholder}
                    style={[
                        styles.valueText,
                        !value && styles.placeholderText,
                        disabled && styles.textDisabled,
                    ]}
                    containerStyle={{ flex: 1, marginRight: 8 }}
                />
                <Ionicons
                    name="chevron-down"
                    size={20}
                    color={
                        disabled ? colors.textSecondary || '#999' : colors.textSecondary || '#999'
                    }
                />
            </TouchableOpacity>

            {isOpen && !disabled && (
                <View style={styles.dropdown}>
                    <ScrollView
                        nestedScrollEnabled
                        style={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {options.map((option, index) => {
                            const isSelected = option === value;
                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={[styles.option, isSelected && styles.selectedOption]}
                                    onPress={() => handleSelect(option)}
                                >
                                    <Text
                                        style={[
                                            styles.optionText,
                                            isSelected && styles.selectedOptionText,
                                        ]}
                                    >
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
    container: { marginBottom: spacing.md, zIndex: 8 },
    labelContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs },
    label: { fontSize: 14, color: colors.text, fontWeight: '400', marginRight: spacing.xs },
    helpIcon: { padding: 2 },
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
    triggerDisabled: {
        borderColor: colors.borderDisabled,
    },
    valueText: { flex: 1, fontSize: 15, color: colors.text },
    placeholderText: { color: colors.textSecondary || '#999' },
    textDisabled: { color: colors.textSecondary || '#999', opacity: 0.6 },
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
        maxHeight: 250,
        zIndex: 1000,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
            },
            android: { elevation: 4 },
        }),
    },
    scrollContent: { paddingVertical: spacing.xs },
    option: {
        paddingVertical: spacing.sm + 2,
        paddingHorizontal: spacing.md,
        marginHorizontal: spacing.xs,
        borderRadius: borderRadius.sm,
    },
    selectedOption: { backgroundColor: '#F3F4F6' },
    optionText: { fontSize: 14, color: colors.text },
    selectedOptionText: { fontWeight: '500', color: colors.text },
    tooltipContainer: {
        position: 'absolute',
        bottom: '100%',
        left: 0,
        right: 0,
        marginBottom: -10,
        zIndex: 2000,
        alignItems: 'flex-start',
    },
    overlay: {
        position: 'absolute',
        top: -1000,
        bottom: -1000,
        left: -1000,
        right: -1000,
        backgroundColor: 'transparent',
        zIndex: 1900,
    },
    tooltipContent: {
        backgroundColor: '#1F2937',
        padding: spacing.sm,
        borderRadius: borderRadius.sm,
        maxWidth: '100%',
    },
    tooltipText: { color: colors.white, fontSize: 12, lineHeight: 18 },
    tooltipArrow: {
        position: 'absolute',
        bottom: -6,
        left: 100,
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderTopWidth: 6,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: '#1F2937',
    },
});
