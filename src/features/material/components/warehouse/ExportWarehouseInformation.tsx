import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, Platform, LayoutAnimation, UIManager } from 'react-native';
import { CollapseHead } from '@/shared/components/layout/CollapseHead';
import { colors, spacing } from '@/styles';
import { DropdownMaterial, DropdownOption } from '../material/DropdownMaterialGroup';
import { useFarmStore } from '@/features/farm/store/farmStore';
import { DateInputButton } from '@/features/farm/components/pondwork/DateInputButton';
import { formatMaterialDate } from '@/features/material/utils/dateUtils';

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
    children?: React.ReactNode;
}

export const ExportWarehouseInformation: React.FC<ExportWarehouseInformationProps> = ({
    date,
    onDateChange,
    selectedZone,
    onZoneChange,
    selectedPond,
    onPondChange,
    children,
}) => {
    const [isExpanded, setIsExpanded] = useState(true);
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
                    <DateInputButton
                        label="Ngày xuất"
                        date={date}
                        dateText={formatMaterialDate(date)}
                        onDateChange={onDateChange}
                        required
                    />

                    <DropdownMaterial
                        label="Trại nuôi"
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
                        required
                    />
                    <DropdownMaterial
                        label="Ao nuôi"
                        value={selectedPond}
                        options={pondOptions}
                        onChange={onPondChange}
                        placeholder={isLoadingPonds ? 'Đang tải danh sách ao...' : 'Chọn ao nuôi'}
                        showAllOption={false}
                        isOpen={activeDropdown === 'pond'}
                        onToggle={() => handleToggleDropdown('pond')}
                        disabled={!selectedZone || isLoadingPonds}
                        inline={false}
                        required
                    />
                    {/* Children Content (e.g., File Uploader) */}
                    {children}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: colors.white,
        marginBottom: spacing.sm,
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
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: colors.gray[100],
    },
    inputGroup: {
        marginBottom: spacing.md,
    },
});
