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

export interface DropdownOption {
    label: string;
    value: string | number;
}

interface DropdownMaterialProps {
    value?: string | number;
    onChange?: (value: any) => void;
    options?: (string | DropdownOption)[];
    label?: string;
    required?: boolean;
    placeholder?: string;
    dropdownStyle?: ViewStyle;
    showAllOption?: boolean;
    inline?: boolean;
    isOpen: boolean;
    onToggle: () => void;
    useAutoScroll?: boolean;
    disabled?: boolean;
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
    useAutoScroll = false,
    disabled = false,
}) => {
    // Helper to get normalized options
    const getNormalizedOptions = (): DropdownOption[] => {
        return options.map(opt => {
            if (typeof opt === 'string') {
                return { label: opt, value: opt };
            }
            return opt;
        });
    };

    const allOptions = getNormalizedOptions();
    const displayOptions = showAllOption
        ? allOptions
        : allOptions.filter(opt => opt.label !== 'Tất cả nhóm vật tư');

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

    const handleSelect = (option: DropdownOption) => {
        onChange?.(option.value);
        onToggle();
    };

    const renderItem = ({ item }: { item: DropdownOption }) => {
        const isSelected = item.value === value;
        return (
            <TouchableOpacity
                style={[styles.item, isSelected && styles.itemSelected]}
                onPress={() => handleSelect(item)}
            >
                <AutoScrollText
                    text={item.label}
                    style={[styles.itemText, isSelected && styles.itemTextSelected]}
                    containerStyle={styles.autoScrollContainer}
                    speed={30}
                    spacing={40}
                />
            </TouchableOpacity>
        );
    };

    const dynamicDropdownStyle: ViewStyle = {
        top: dropdownCoords.top,
        left: dropdownCoords.left,
        width: dropdownCoords.width,
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
                keyExtractor={(item, index) => String(item.value) + index}
                renderItem={renderItem}
                nestedScrollEnabled={true}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={true}
                indicatorStyle="black"
            />
        </View>
    );

    // Get display label for current value
    const currentLabel = allOptions.find(opt => opt.value === value)?.label || value?.toString();

    const renderButtonContent = () => {
        if (useAutoScroll) {
            return value ? (
                <AutoScrollText
                    text={currentLabel || ''}
                    key={String(value)}
                    style={{
                        ...StyleSheet.flatten(styles.text),
                        flex: undefined,
                    }}
                    containerStyle={{ width: '100%' }}
                />
            ) : (
                <AutoScrollText
                    text={placeholder}
                    key={placeholder}
                    style={{
                        ...StyleSheet.flatten([styles.text, styles.placeholderText]),
                        flex: undefined,
                    }}
                    containerStyle={{ width: '100%' }}
                />
            );
        } else {
            return (
                <Text
                    style={[styles.text, !value && styles.placeholderText]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                    {currentLabel || placeholder}
                </Text>
            );
        }
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
                style={[styles.button, disabled && { opacity: 0.6 }]}
                onPress={onToggle}
                activeOpacity={0.7}
                disabled={disabled}
            >
                <View style={{ flex: 1, marginRight: spacing.xs, justifyContent: 'center' }}>
                    {renderButtonContent()}
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
    text: {
        flex: 1,
        fontSize: 15,
        color: colors.text,
        lineHeight: 44,
        textAlignVertical: 'center',
    },
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
    autoScrollContainer: {
        width: '100%',
        minHeight: 20,
    },
    dropdownInline: {
        position: 'relative',
        width: '100%',
        marginTop: spacing.xs,
        elevation: 0,
        shadowOpacity: 0,
    },
});
