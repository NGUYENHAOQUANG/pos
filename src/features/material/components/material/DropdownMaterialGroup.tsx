import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
    ViewStyle,
    FlatList,
    Modal,
    TouchableWithoutFeedback,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius } from '@/styles';
import { AutoScrollText } from '@/features/control/components/devices/AutoScrollText';

interface DropdownMaterialProps {
    value?: string;
    onChange?: (value: string) => void;
    options?: string[];
    label?: string;
    required?: boolean;
    placeholder?: string;
    dropdownStyle?: ViewStyle;
    showAllOption?: boolean;
    inline?: boolean;
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
    inline = false,
}) => {
    const displayOptions = showAllOption
        ? options
        : options.filter(option => option !== 'Tất cả nhóm vật tư');

    const buttonRef = useRef<View>(null);
    const [dropdownCoords, setDropdownCoords] = useState({ top: 0, left: 0, width: 0 });

    useEffect(() => {
        if (!inline && isOpen && buttonRef.current) {
            buttonRef.current.measureInWindow((x, y, width, height) => {
                setDropdownCoords({
                    top: y + height + 4,
                    left: x,
                    width: width,
                });
            });
        }
    }, [isOpen, inline]);

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

    const dynamicDropdownStyle: ViewStyle = {
        top: dropdownCoords.top,
        left: dropdownCoords.left,
        minWidth: dropdownCoords.width,
    };

    const dropdownList = (
        <View
            style={[
                styles.dropdown,
                inline ? styles.dropdownInline : [dropdownStyle, dynamicDropdownStyle],
            ]}
        >
            <FlatList
                data={displayOptions}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderItem}
                nestedScrollEnabled={true}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={true}
                indicatorStyle="black"
            />
        </View>
    );

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
                style={styles.button}
                onPress={onToggle}
                activeOpacity={0.7}
            >
                <View style={{ flex: 1, marginRight: spacing.xs, justifyContent: 'center' }}>
                    {value ? (
                        <AutoScrollText
                            text={value}
                            style={{
                                ...StyleSheet.flatten(styles.text),
                                flex: undefined,
                            }}
                            containerStyle={{ width: '100%' }}
                        />
                    ) : (
                        <AutoScrollText
                            text={placeholder}
                            style={{
                                ...StyleSheet.flatten([styles.text, styles.placeholderText]),
                                flex: undefined,
                            }}
                            containerStyle={{ width: '100%' }}
                        />
                    )}
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
    text: { flex: 1, fontSize: 15, color: colors.text },
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
        // zIndex: 1000, // removed as it is inside Modal
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
    dropdownInline: {
        position: 'relative',
        width: '100%',
        marginTop: spacing.xs,
        elevation: 0,
        shadowOpacity: 0,
    },
});
