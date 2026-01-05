import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Platform,
    LayoutAnimation,
    UIManager,
} from 'react-native';
import CalenderIcon from '@/assets/Icon/Calender.svg';
import { CollapseHead } from '../CollapseHead';
import { colors, spacing, borderRadius } from '@/styles';
import { DatePickerModal } from '@/shared/components/modal/DatePickerModal';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface WarehouseInformationProps {
    date: Date;
    onDateChange: (date: Date) => void;
    supplier: string;
    onSupplierChange: (text: string) => void;
}

export const WarehouseInformation: React.FC<WarehouseInformationProps> = ({
    date,
    onDateChange,
    supplier,
    onSupplierChange,
}) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isDatePickerVisible, setDatePickerVisible] = useState(false);

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsExpanded(!isExpanded);
    };

    const formatDate = (dateValue: Date) => {
        if (!dateValue) return '';
        // Ensure we have a valid date object
        const d = new Date(dateValue);
        if (isNaN(d.getTime())) return '';

        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${day}/${month}/${year}`;
    };

    return (
        <View style={styles.cardContainer}>
            <CollapseHead
                title="Thông tin nhập kho"
                isExpanded={isExpanded}
                onToggle={toggleExpand}
            />

            {isExpanded && (
                <View style={styles.content}>
                    {/* Date Input */}
                    <View style={styles.inputGroup}>
                        <View style={styles.labelContainer}>
                            <Text style={styles.required}>* </Text>
                            <Text style={styles.label}>Ngày nhập</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.dateInput}
                            onPress={() => setDatePickerVisible(true)}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.dateText} numberOfLines={1}>
                                {formatDate(date)}
                            </Text>
                            <CalenderIcon width={20} height={20} />
                        </TouchableOpacity>
                    </View>

                    {/* Supplier Input */}
                    <View style={styles.inputGroup}>
                        <View style={styles.labelContainer}>
                            <Text style={styles.required}>* </Text>
                            <Text style={styles.label}>Nhà cung cấp</Text>
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder="Nhập nhà cung cấp"
                            placeholderTextColor={colors.textSecondary || '#999'}
                            value={supplier}
                            onChangeText={onSupplierChange}
                        />
                    </View>
                </View>
            )}

            <DatePickerModal
                visible={isDatePickerVisible}
                onClose={() => setDatePickerVisible(false)}
                date={date}
                onSelectDate={onDateChange}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: colors.white,
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
        // overflow: 'hidden',
    },

    content: {
        padding: spacing.md,
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
    dateInput: {
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
    dateText: {
        fontSize: 15,
        color: colors.text,
        flex: 1,
        marginRight: spacing.sm,
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
});
