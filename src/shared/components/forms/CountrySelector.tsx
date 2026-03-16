/**
 * @file CountrySelector.tsx
 * @description Country selector component using Ant Design React Native List and InputItem
 * @author Auto
 * @created 2025-01-27
 * @updated 2025-01-27 - Migrated to ANTD-RN List and InputItem
 */
import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    ViewStyle,
    Modal,
    FlatList,
    Pressable,
    Platform,
} from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { List, InputItem } from '@ant-design/react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius, typography, sizes } from '@/styles';

interface Country {
    label: string;
    value: string;
    code: string;
    flag: string;
}

const COUNTRIES: Country[] = [
    { label: 'Việt Nam', value: 'VN', code: 'VN', flag: '🇻🇳' },
    { label: 'Thái Lan', value: 'TH', code: 'TH', flag: '🇹🇭' },
    { label: 'Indonesia', value: 'ID', code: 'ID', flag: '🇮🇩' },
    { label: 'Malaysia', value: 'MY', code: 'MY', flag: '🇲🇾' },
    { label: 'Philippines', value: 'PH', code: 'PH', flag: '🇵🇭' },
    { label: 'Singapore', value: 'SG', code: 'SG', flag: '🇸🇬' },
    { label: 'Campuchia', value: 'KH', code: 'KH', flag: '🇰🇭' },
    { label: 'Lào', value: 'LA', code: 'LA', flag: '🇱🇦' },
    { label: 'Myanmar', value: 'MM', code: 'MM', flag: '🇲🇲' },
];

interface CountrySelectorProps {
    value?: string;
    onChange?: (value: string, country: Country) => void;
    label?: string;
    style?: ViewStyle;
    required?: boolean;
}

export function CountrySelector({
    value = 'VN',
    onChange,
    label,
    style,
    required = false,
}: CountrySelectorProps) {
    const [selectedValue, setSelectedValue] = useState(value);
    const [modalVisible, setModalVisible] = useState(false);
    const selectedCountry = COUNTRIES.find(c => c.value === selectedValue) || COUNTRIES[0];

    const handleChange = (val: string) => {
        setSelectedValue(val);
        const country = COUNTRIES.find(c => c.value === val) || COUNTRIES[0];
        onChange?.(val, country);
        setModalVisible(false);
    };

    const handleClear = () => {
        setSelectedValue('');
        onChange?.('', COUNTRIES[0]);
    };

    return (
        <View style={[styles.container, style]}>
            {label && (
                <Text style={styles.label}>
                    {label} {required && <Text style={styles.required}>*</Text>}
                </Text>
            )}
            <List style={styles.listContainer}>
                <TouchableOpacity onPress={() => setModalVisible(true)} activeOpacity={0.7}>
                    <View style={styles.selectorContent}>
                        <View style={styles.selectorLeft}>
                            <Text style={styles.flagIcon}>{selectedCountry.flag}</Text>
                            <Ionicons
                                name="chevron-down-outline"
                                size={sizes.icon.sm}
                                color={colors.textSecondary}
                                style={styles.chevronIcon}
                            />
                            <View style={styles.inputItemWrapper}>
                                <InputItem
                                    value={`${selectedCountry.label} (${selectedCountry.code})`}
                                    editable={false}
                                    onPress={() => setModalVisible(true)}
                                    extra={
                                        selectedValue ? (
                                            <TouchableOpacity
                                                onPress={e => {
                                                    e.stopPropagation();
                                                    handleClear();
                                                }}
                                                style={styles.clearButton}
                                                hitSlop={{
                                                    top: 10,
                                                    bottom: 10,
                                                    left: 10,
                                                    right: 10,
                                                }}
                                            >
                                                <Ionicons
                                                    name="close-circle"
                                                    size={20}
                                                    color={colors.textSecondary}
                                                />
                                            </TouchableOpacity>
                                        ) : (
                                            <Ionicons
                                                name="chevron-forward"
                                                size={sizes.icon.sm}
                                                color={colors.textSecondary}
                                            />
                                        )
                                    }
                                    styles={{
                                        container: styles.antdContainer,
                                        input: styles.antdInput,
                                    }}
                                >
                                    {''}
                                </InputItem>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            </List>

            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <Pressable style={styles.modalBackdrop} onPress={() => setModalVisible(false)}>
                    <Pressable style={styles.modalContent} onPress={e => e.stopPropagation()}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Chọn quốc gia</Text>
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Ionicons name="close" size={sizes.icon.md} color={colors.text} />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={COUNTRIES}
                            keyExtractor={item => item.value}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.countryItem,
                                        selectedValue === item.value && styles.countryItemSelected,
                                    ]}
                                    onPress={() => handleChange(item.value)}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.countryItemLeft}>
                                        <Text style={styles.countryFlag}>{item.flag}</Text>
                                        <Text
                                            style={[
                                                styles.countryItemText,
                                                selectedValue === item.value &&
                                                    styles.countryItemTextSelected,
                                            ]}
                                        >
                                            {item.label} ({item.code})
                                        </Text>
                                    </View>
                                    {selectedValue === item.value && (
                                        <Ionicons
                                            name="checkmark"
                                            size={20}
                                            color={colors.primary}
                                        />
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.lg,
    },
    label: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    required: {
        color: colors.error,
    },
    listContainer: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        backgroundColor: colors.white,
        overflow: 'hidden',
    },
    selectorContent: {
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: sizes.input.lg,
    },
    selectorLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        paddingHorizontal: spacing.md,
    },
    flagIcon: {
        fontSize: 20,
        marginRight: spacing.sm,
    },
    chevronIcon: {
        marginRight: spacing.sm,
    },
    inputItemWrapper: {
        flex: 1,
    },
    antdContainer: {
        backgroundColor: 'transparent',
        borderBottomWidth: 0,
        paddingLeft: 0,
        height: sizes.input.lg - 2,
        minHeight: sizes.input.lg - 2,
    },
    antdInput: {
        fontSize: typography.fontSize.base,
        color: colors.text,
        paddingVertical: 0,
    },
    clearButton: {
        padding: spacing.xs,
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.white,
        borderTopLeftRadius: borderRadius.lg,
        borderTopRightRadius: borderRadius.lg,
        maxHeight: '70%',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
            },
            android: {
                elevation: 5,
            },
        }),
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    modalTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.semibold,
        color: colors.text,
    },
    countryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    countryItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    countryFlag: {
        fontSize: 24,
        marginRight: spacing.md,
    },
    countryItemSelected: {
        backgroundColor: colors.backgroundSecondary,
    },
    countryItemText: {
        fontSize: typography.fontSize.base,
        color: colors.text,
    },
    countryItemTextSelected: {
        fontWeight: typography.fontWeight.semibold,
        color: colors.primary,
    },
});
