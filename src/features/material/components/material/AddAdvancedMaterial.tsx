import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    LayoutAnimation,
    Platform,
    UIManager,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { UnitOfUse } from './UnitOfUse';
import { colors, spacing, borderRadius, sizes } from '@/styles';

if (
    Platform.OS === 'android' &&
    UIManager.setLayoutAnimationEnabledExperimental
) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface AddAdvancedMaterialProps {
    usage?: string;
    onUsageChange?: (text: string) => void;
    unitOfUse?: string;
    onUnitOfUseChange?: (value: string) => void;
    dosage?: string;
    onDosageChange?: (text: string) => void;
    manufacturer?: string;
    onManufacturerChange?: (text: string) => void;
    unitOptions?: string[];
}

export const AddAdvancedMaterial: React.FC<AddAdvancedMaterialProps> = ({
    usage,
    onUsageChange,
    unitOfUse,
    onUnitOfUseChange,
    dosage,
    onDosageChange,
    manufacturer,
    onManufacturerChange,
    unitOptions = [],
}) => {
    const [isExpanded, setIsExpanded] = useState(false); // Default collapsed as per "không bắt buộc"

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsExpanded(!isExpanded);
    };

    return (
        <View style={styles.container}>
            {/* Header / Toggle */}
            <TouchableOpacity
                style={styles.header}
                onPress={toggleExpand}
                activeOpacity={0.7}
            >
                <Text style={styles.headerTitle}>Thông tin nâng cao (không bắt buộc)</Text>
                <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={colors.text}
                />
            </TouchableOpacity>

            {/* Content */}
            {isExpanded && (
                <View style={styles.content}>
                    {/* Usage Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Công dụng</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Nhập công dụng"
                            placeholderTextColor={colors.textSecondary || '#999'}
                            value={usage}
                            onChangeText={onUsageChange}
                            multiline
                            textAlignVertical="top"
                        />
                    </View>

                    {/* Unit of Use and Dosage Row */}
                    <View style={styles.row}>
                        <View style={styles.halfWidth}>
                            <UnitOfUse
                                label="Đơn vị sử dụng"
                                value={unitOfUse}
                                options={unitOptions}
                                onChange={onUnitOfUseChange}
                            />
                        </View>
                        <View style={styles.halfWidth}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Liều dùng</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nhập liều dùng"
                                    placeholderTextColor={colors.textSecondary || '#999'}
                                    value={dosage}
                                    onChangeText={onDosageChange}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Manufacturer Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Nhà sản xuất</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nhập nhà sản xuất"
                            placeholderTextColor={colors.textSecondary || '#999'}
                            value={manufacturer}
                            onChangeText={onManufacturerChange}
                        />
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        marginBottom: spacing.md,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.md,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    content: {
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.md,
    },
    inputGroup: {
        marginBottom: spacing.md,
    },
    label: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '400',
        marginBottom: spacing.xs,
    },
    input: {
        height: 44,
        paddingHorizontal: spacing.md,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.sm,
        fontSize: 15,
        color: colors.text,
    },
    textArea: {
        height: 80,
        paddingVertical: spacing.sm,
    },
    row: {
        flexDirection: 'row',
        gap: spacing.md,
        zIndex: 1, // Ensure dropdowns in UnitOfUse can overlay if needed, though UnitOfUse handles its own zIndex
    },
    halfWidth: {
        flex: 1,
    },
});
