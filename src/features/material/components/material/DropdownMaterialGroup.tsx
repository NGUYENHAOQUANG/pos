import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
    ViewStyle,
    FlatList,
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
    isOpen: boolean;
    onToggle: () => void;
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
}) => {
    const displayOptions = showAllOption
        ? options
        : options.filter(option => option !== 'Tất cả nhóm vật tư');

    const handleSelect = (option: string) => {
        onChange?.(option);
        onToggle();
    };

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

    return (
        <View style={[styles.container, isOpen && styles.containerZ1000]}>
            {label && (
                <View style={styles.labelContainer}>
                    {required && <Text style={styles.required}>* </Text>}
                    <Text style={styles.label}>{label}</Text>
                </View>
            )}

            <TouchableOpacity style={styles.button} onPress={onToggle} activeOpacity={0.7}>
                <Text style={[styles.text, !value && styles.placeholderText]}>
                    {value || placeholder}
                </Text>
                <Ionicons name="chevron-down" size={20} color={colors.textSecondary || '#999'} />
            </TouchableOpacity>

            {isOpen && (
                <View style={[styles.dropdown, dropdownStyle]}>
                    <FlatList
                        data={displayOptions}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={renderItem}
                        nestedScrollEnabled={true}
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={true}
                    />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, zIndex: 10, position: 'relative' },
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
    text: { flex: 1, fontSize: 15, color: colors.text },
    placeholderText: { color: colors.textSecondary || '#999' },
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
    containerZ1000: { zIndex: 1000 },
});
