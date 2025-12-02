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
import { MaterialGroup } from './MaterialGroupInput';
import { UnitOfMeasure } from './UnitOfMeasure';
import { colors, spacing, borderRadius, sizes } from '@/styles';

if (
    Platform.OS === 'android' &&
    UIManager.setLayoutAnimationEnabledExperimental
) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface AddMeterialBasicProps {
    name?: string;
    onNameChange?: (text: string) => void;
    group?: string;
    onGroupChange?: (value: string) => void;
    unit?: string;
    onUnitChange?: (value: string) => void;
    groupOptions?: string[];
    unitOptions?: string[];
}

export const AddMeterialBasic: React.FC<AddMeterialBasicProps> = ({
    name,
    onNameChange,
    group,
    onGroupChange,
    unit,
    onUnitChange,
    groupOptions = [],
    unitOptions = [],
}) => {
    const [isExpanded, setIsExpanded] = useState(true);

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
                <Text style={styles.headerTitle}>Thông tin cơ bản</Text>
                <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={colors.text}
                />
            </TouchableOpacity>

            {/* Content */}
            {isExpanded && (
                <View style={styles.content}>
                    {/* Material Name Input */}
                    <View style={styles.inputGroup}>
                        <View style={styles.labelContainer}>
                            <Text style={styles.required}>* </Text>
                            <Text style={styles.label}>Tên vật tư</Text>
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder="Nhập tên vật tư"
                            placeholderTextColor={colors.textSecondary || '#999'}
                            value={name}
                            onChangeText={onNameChange}
                        />
                    </View>

                    {/* Dropdowns Row */}
                    <View style={styles.row}>
                        <View style={styles.halfWidth}>
                            <MaterialGroup
                                label="Nhóm vật tư"
                                required
                                value={group}
                                options={groupOptions}
                                onChange={onGroupChange}
                            />
                        </View>
                        <View style={styles.halfWidth}>
                            <UnitOfMeasure
                                label="Đơn vị tính"
                                required
                                value={unit}
                                options={unitOptions}
                                onChange={onUnitChange}
                            />
                        </View>
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
    row: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    halfWidth: {
        flex: 1,
    },
});
