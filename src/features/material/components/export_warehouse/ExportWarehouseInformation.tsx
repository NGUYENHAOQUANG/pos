import React, { useState } from 'react';
import { View, StyleSheet, LayoutAnimation } from 'react-native';
import { DocumentPickerResponse } from '@react-native-documents/picker';

import { CollapseHead } from '@/shared/components/layout/CollapseHead';
import { InfiniteScrollDropdown } from '@/shared/components/forms/InfiniteScrollDropdown';
import { Input } from '@/shared/components/forms/Input';
import { FileUploader, FileUploaderRef } from '@/shared/components/forms/FileUploader';

import { useAppTheme } from '@/styles/themeContext';
import { Colors, borderRadius, spacing } from '@/styles';
import { useInfiniteDropdown } from '@/shared/hooks/useInfiniteDropdown';
import { DateInputButton } from '@/features/farm/components/pondwork/DateInputButton';
import { formatMaterialDate } from '@/features/material/utils/dateUtils';
import { Zone } from '@/features/farm/types/farm.types';
import { PondData } from '@/features/farm/types/pond.types';

interface ExportWarehouseInformationProps {
    date: Date;
    onDateChange: (date: Date) => void;
    zones: Zone[];
    selectedZone: string;
    onZoneChange: (zoneId: string) => void;
    ponds: PondData[];
    selectedPond: string;
    onPondChange: (pondId: string) => void;
    isEditMode: boolean;
    creatorName?: string;
    note: string;
    onNoteChange: (val: string) => void;
    files: DocumentPickerResponse[];
    onFilesSelected: (files: DocumentPickerResponse[]) => void;
    fileUploaderRef: React.RefObject<FileUploaderRef | null>;
}

export const ExportWarehouseInformation: React.FC<ExportWarehouseInformationProps> = ({
    date,
    onDateChange,
    zones,
    selectedZone,
    onZoneChange,
    ponds,
    selectedPond,
    onPondChange,
    isEditMode,
    creatorName,
    note,
    onNoteChange,
    files,
    onFilesSelected,
    fileUploaderRef,
}) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const theme = useAppTheme();
    const styles = getStyles(theme);

    const zoneDropdown = useInfiniteDropdown();
    const pondDropdown = useInfiniteDropdown();

    const filteredZones = React.useMemo(() => {
        if (!zoneDropdown.debouncedSearch) return zones;
        const search = zoneDropdown.debouncedSearch.toLowerCase();
        return zones.filter((z: Zone) => z.name.toLowerCase().includes(search));
    }, [zones, zoneDropdown.debouncedSearch]);

    const filteredPonds = React.useMemo(() => {
        if (!pondDropdown.debouncedSearch) return ponds;
        const search = pondDropdown.debouncedSearch.toLowerCase();
        return ponds.filter((p: PondData) => p.name.toLowerCase().includes(search));
    }, [ponds, pondDropdown.debouncedSearch]);

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
                <DateInputButton
                    label="Ngày xuất"
                    date={date}
                    dateText={formatMaterialDate(date)}
                    onDateChange={onDateChange}
                    required
                />

                <InfiniteScrollDropdown<Zone>
                    label="Trại nuôi"
                    required
                    value={selectedZone}
                    onSelect={onZoneChange}
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

                <InfiniteScrollDropdown<PondData>
                    label="Ao nuôi"
                    required
                    value={selectedPond}
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

                {isEditMode && creatorName ? (
                    <Input label="Người tạo phiếu" value={creatorName} editable={false} />
                ) : null}

                <Input
                    label="Ghi chú"
                    placeholder="Nhập ghi chú xuất kho"
                    value={note}
                    onChangeText={onNoteChange}
                    multiline={true}
                    numberOfLines={3}
                    maxLength={2000}
                    inputContainerStyle={styles.noteInputContainer}
                    inputStyle={styles.noteInput}
                />

                <FileUploader
                    ref={fileUploaderRef}
                    files={files}
                    onFilesSelected={onFilesSelected}
                    maxFiles={5}
                />
            </View>
        </View>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        cardContainer: {
            marginHorizontal: spacing.md,
            backgroundColor: theme.background,
            borderRadius: borderRadius.md,
            borderWidth: 1,
            borderColor: theme.border,
            zIndex: 10,
        },
        content: {
            paddingHorizontal: 12,
            paddingBottom: 12,
            gap: 12,
        },
        noteInputContainer: {
            height: 100,
            alignItems: 'flex-start' as const,
        },
        noteInput: {
            textAlignVertical: 'top' as const,
            paddingTop: 8,
        },
    });
