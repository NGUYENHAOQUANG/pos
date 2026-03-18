import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, Platform, LayoutAnimation, UIManager } from 'react-native';
import { CollapseHead } from '@/shared/components/layout/CollapseHead';
import { borderRadius, colors, spacing } from '@/styles';
import { DropdownMaterial, DropdownOption } from '../DropdownMaterial';

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
    zones: any[];
    ponds: any[];
    isLoadingZones?: boolean;
    isLoadingPonds?: boolean;
    children?: React.ReactNode;
}

export const ExportWarehouseInformation: React.FC<ExportWarehouseInformationProps> = ({
    date,
    onDateChange,
    selectedZone,
    onZoneChange,
    selectedPond,
    onPondChange,
    zones,
    ponds,
    isLoadingZones,
    isLoadingPonds,
    children,
}) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    // Auto-select "Trại Kiên Giang" or first zone if available and none selected
    useEffect(() => {
        if (!selectedZone && zones.length > 0) {
            const defaultZone =
                zones.find((z: any) => z.name.toLowerCase().includes('kiên giang')) || zones[0];
            onZoneChange(defaultZone.id.toString());
        }
    }, [zones, selectedZone, onZoneChange]);

    // Zones Dropdown Options
    const zoneOptions: DropdownOption[] = useMemo(() => {
        return zones.map((z: any) => ({
            label: z.name,
            value: z.id.toString(),
        }));
    }, [zones]);

    // Ponds dropdown map
    const pondOptions: DropdownOption[] = useMemo(() => {
        if (!selectedZone || ponds.length === 0) return [];

        return ponds.map(p => ({
            label: p.name,
            value: p.id,
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
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        margin: spacing.md,
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.border,
        zIndex: 10,
    },

    content: {
        paddingHorizontal: 12,
        paddingTop: spacing.md,
        paddingBottom: 12,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: colors.gray[100],
    },
    inputGroup: {
        marginBottom: spacing.md,
    },
});
