import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
    LayoutAnimation,
    UIManager,
} from 'react-native';
import CalenderIcon from '@/assets/Icon/Calender.svg';
import { CollapseHead } from '../CollapseHead';
import { colors, spacing, borderRadius } from '@/styles';
import { DatePickerModal } from '@/shared/components/modal/DatePickerModal';
import { formatMaterialDate } from '@/features/material/utils/dateUtils';
import { DropdownMaterial, DropdownOption } from '../material/DropdownMaterialGroup';
import { useFarm } from '@/features/farm/store/farmStore';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ExportWarehouseInformationProps {
    date: Date;
    onDateChange: (date: Date) => void;
    farm: string;
    onFarmChange: (value: string) => void;
}

export const ExportWarehouseInformation: React.FC<ExportWarehouseInformationProps> = ({
    date,
    onDateChange,
    farm,
    onFarmChange,
}) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isDatePickerVisible, setDatePickerVisible] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    // Get ponds from farm store
    const { ponds, fetchPonds, isLoadingPonds } = useFarm();

    // Fetch ponds on mount
    useEffect(() => {
        if (ponds.length === 0) {
            fetchPonds();
        }
    }, [ponds.length, fetchPonds]);

    // Convert ponds to dropdown options
    const pondOptions: DropdownOption[] = useMemo(() => {
        return ponds.map(pond => ({
            label: pond.name,
            value: pond.name,
        }));
    }, [ponds]);

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsExpanded(!isExpanded);
    };

    const handleToggleDropdown = (key: string) => {
        if (activeDropdown === key) {
            setActiveDropdown(null);
        } else {
            setActiveDropdown(key);
        }
    };

    return (
        <View style={styles.cardContainer}>
            <CollapseHead
                title="Thông tin xuất kho"
                isExpanded={isExpanded}
                onToggle={toggleExpand}
            />

            {isExpanded && (
                <View style={styles.content}>
                    {/* Date Input */}
                    <View style={styles.inputGroup}>
                        <View style={styles.labelContainer}>
                            <Text style={styles.required}>* </Text>
                            <Text style={styles.label}>Ngày xuất</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.dateInput}
                            onPress={() => setDatePickerVisible(true)}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.dateText} numberOfLines={1}>
                                {formatMaterialDate(date)}
                            </Text>
                            <CalenderIcon width={20} height={20} />
                        </TouchableOpacity>
                    </View>

                    {/* Farm Dropdown */}
                    <View style={styles.inputGroup}>
                        <View style={styles.labelContainer}>
                            <Text style={styles.required}>* </Text>
                            <Text style={styles.label}>Ao nuôi</Text>
                        </View>
                        <DropdownMaterial
                            value={farm}
                            options={pondOptions}
                            onChange={onFarmChange}
                            placeholder="Chọn ao nuôi"
                            showAllOption={false}
                            isOpen={activeDropdown === 'farm'}
                            onToggle={() => handleToggleDropdown('farm')}
                            disabled={isLoadingPonds}
                            inline={false}
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
});
