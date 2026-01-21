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
import { useFarmStore } from '@/features/farm/store/farmStore';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ExportWarehouseInformationProps {
    date: Date;
    onDateChange: (date: Date) => void;
    selectedZone: string;
    onZoneChange: (value: string) => void;
    selectedPond: string;
    onPondChange: (value: string) => void;
}

export const ExportWarehouseInformation: React.FC<ExportWarehouseInformationProps> = ({
    date,
    onDateChange,
    selectedZone,
    onZoneChange,
    selectedPond,
    onPondChange,
}) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isDatePickerVisible, setDatePickerVisible] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    // Get zones and ponds from form store
    const zones = useFarmStore(state => state.zones);
    const ponds = useFarmStore(state => state.ponds);
    const fetchZones = useFarmStore(state => state.fetchZones);
    const fetchPondsByZone = useFarmStore(state => state.fetchPondsByZone);
    const isLoadingZones = useFarmStore(state => state.isLoadingZones);
    const isLoadingPonds = useFarmStore(state => state.isLoadingPonds);

    // Fetch initial data (Zones)
    useEffect(() => {
        if (zones.length === 0) fetchZones();
    }, [zones.length, fetchZones]);

    // Fetch ponds when selectedZone changes
    useEffect(() => {
        if (selectedZone) {
            fetchPondsByZone(selectedZone);
        }
    }, [selectedZone, fetchPondsByZone]);

    // Auto-select "Trại Kiên Giang" or first zone if available and none selected
    useEffect(() => {
        if (!selectedZone && zones.length > 0) {
            const defaultZone =
                zones.find(z => z.name.toLowerCase().includes('kiên giang')) || zones[0];
            onZoneChange(defaultZone.id.toString());
        }
    }, [zones, selectedZone, onZoneChange]);

    // Zones Dropdown Options
    const zoneOptions: DropdownOption[] = useMemo(() => {
        return zones.map(z => ({
            label: z.name,
            value: z.id.toString(),
        }));
    }, [zones]);

    // Filter Ponds based on selected Zone
    const pondOptions: DropdownOption[] = useMemo(() => {
        if (!selectedZone) return [];

        const filteredPonds = ponds.filter(p => p.zoneId?.toString() === selectedZone);

        return filteredPonds.map(p => ({
            label: p.name,
            value: p.name,
        }));
    }, [ponds, selectedZone]);

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

                    {/* Zone Dropdown */}
                    <View style={styles.inputGroup}>
                        <View style={styles.labelContainer}>
                            <Text style={styles.required}>* </Text>
                            <Text style={styles.label}>Trại nuôi</Text>
                        </View>
                        <DropdownMaterial
                            value={selectedZone}
                            options={zoneOptions}
                            onChange={newValue => {
                                onZoneChange(newValue);
                                onPondChange('');
                            }}
                            placeholder="Chọn trại nuôi"
                            showAllOption={false}
                            isOpen={activeDropdown === 'zone'}
                            onToggle={() => handleToggleDropdown('zone')}
                            disabled={isLoadingZones}
                            inline={false}
                        />
                    </View>

                    {/* Pond Dropdown */}
                    <View style={styles.inputGroup}>
                        <View style={styles.labelContainer}>
                            <Text style={styles.required}>* </Text>
                            <Text style={styles.label}>Ao nuôi</Text>
                        </View>
                        <DropdownMaterial
                            value={selectedPond}
                            options={pondOptions}
                            onChange={onPondChange}
                            placeholder={
                                isLoadingPonds ? 'Đang tải danh sách ao...' : 'Chọn ao nuôi'
                            }
                            showAllOption={false}
                            isOpen={activeDropdown === 'pond'}
                            onToggle={() => handleToggleDropdown('pond')}
                            disabled={!selectedZone || isLoadingPonds}
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
        color: colors.error,
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
