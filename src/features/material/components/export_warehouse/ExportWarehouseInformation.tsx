import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform, LayoutAnimation, UIManager } from 'react-native';
import { CollapseHead } from '@/shared/components/layout/CollapseHead';
import { borderRadius, colors, spacing } from '@/styles';
import { InfiniteScrollDropdown } from '@/shared/components/forms/InfiniteScrollDropdown';
import { useInfiniteDropdown } from '@/shared/hooks/useInfiniteDropdown';
import { DateInputButton } from '@/features/farm/components/pondwork/DateInputButton';
import { formatMaterialDate } from '@/features/material/utils/dateUtils';
import { useZones } from '@/features/farm/hooks/useZones';
import { useAllPondsByZone } from '@/features/farm/hooks/usePonds';
import { Zone } from '@/features/farm/types/farm.types';
import { PondData } from '@/features/farm/types/pond.types';

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
    /** Display name for zone in edit mode */
    zoneDisplayValue?: string;
    /** Display name for pond in edit mode */
    pondDisplayValue?: string;
    children?: React.ReactNode;
}

export const ExportWarehouseInformation: React.FC<ExportWarehouseInformationProps> = ({
    date,
    onDateChange,
    selectedZone,
    onZoneChange,
    selectedPond,
    onPondChange,
    zoneDisplayValue,
    pondDisplayValue,
    children,
}) => {
    const [isExpanded, setIsExpanded] = useState(true);

    // Zone dropdown state
    const zoneDropdown = useInfiniteDropdown();
    const { data: zones = [] } = useZones();

    // Pond dropdown state
    const pondDropdown = useInfiniteDropdown();
    const { data: ponds = [] } = useAllPondsByZone(selectedZone);

    // Filter zones by search
    const filteredZones = React.useMemo(() => {
        if (!zoneDropdown.debouncedSearch) return zones;
        const search = zoneDropdown.debouncedSearch.toLowerCase();
        return zones.filter((z: Zone) => z.name.toLowerCase().includes(search));
    }, [zones, zoneDropdown.debouncedSearch]);

    // Filter ponds by search
    const filteredPonds = React.useMemo(() => {
        if (!pondDropdown.debouncedSearch) return ponds;
        const search = pondDropdown.debouncedSearch.toLowerCase();
        return ponds.filter((p: PondData) => p.name.toLowerCase().includes(search));
    }, [ponds, pondDropdown.debouncedSearch]);

    // Auto-select first zone if none selected
    useEffect(() => {
        if (!selectedZone && zones.length > 0) {
            const defaultZone =
                zones.find((z: Zone) => z.name.toLowerCase().includes('kiên giang')) || zones[0];
            onZoneChange(defaultZone.id.toString());
        }
    }, [zones, selectedZone, onZoneChange]);

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsExpanded(!isExpanded);
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

                {/* Zone Dropdown */}
                <InfiniteScrollDropdown<Zone>
                    label="Trại nuôi"
                    required
                    value={selectedZone}
                    displayValue={zoneDisplayValue}
                    onSelect={zoneId => {
                        onZoneChange(zoneId);
                        onPondChange('');
                    }}
                    placeholder="Chọn trại nuôi"
                    searchPlaceholder="Tìm trại nuôi"
                    emptyText="Không tìm thấy trại nuôi"
                    isOpen={zoneDropdown.isOpen}
                    onOpen={zoneDropdown.handleOpen}
                    onClose={zoneDropdown.handleClose}
                    searchText={zoneDropdown.searchText}
                    onSearchChange={zoneDropdown.handleSearchChange}
                    onClearSearch={zoneDropdown.clearSearch}
                    items={filteredZones}
                    isLoading={false}
                />

                {/* Pond Dropdown */}
                <InfiniteScrollDropdown<PondData>
                    label="Ao nuôi"
                    required
                    value={selectedPond}
                    displayValue={pondDisplayValue}
                    onSelect={onPondChange}
                    placeholder={!selectedZone ? 'Chọn trại nuôi trước' : 'Chọn ao nuôi'}
                    searchPlaceholder="Tìm ao nuôi"
                    emptyText="Không tìm thấy ao nuôi"
                    disabled={!selectedZone}
                    isOpen={pondDropdown.isOpen}
                    onOpen={pondDropdown.handleOpen}
                    onClose={pondDropdown.handleClose}
                    searchText={pondDropdown.searchText}
                    onSearchChange={pondDropdown.handleSearchChange}
                    onClearSearch={pondDropdown.clearSearch}
                    items={filteredPonds}
                    isLoading={false}
                />

                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        marginHorizontal: spacing.md,
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.border,
        zIndex: 10,
    },
    content: {
        paddingHorizontal: 12,
        // paddingTop: spacing.md,
        paddingBottom: 12,
        gap: 12,
    },
});
