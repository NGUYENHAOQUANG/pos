import React from 'react';
import { View, StyleSheet } from 'react-native';
import { DocumentPickerResponse } from '@react-native-documents/picker';

import { CollapseHead } from '@/shared/components/layout/CollapseHead';
import { FileUploader, FileUploaderRef } from '@/shared/components/forms/FileUploader';

import { borderRadius, colors, spacing } from '@/styles';
import { DateInputButton } from '@/features/farm/components/pondwork/DateInputButton';
import { DropdownSupplierItem } from '@/features/material/components/import_receipt_form/DropdownSupplierItem';

interface WarehouseInformationProps {
    date: Date;
    onDateChange: (date: Date) => void;
    supplier: string;
    onSupplierChange: (supplierId: string) => void;
    supplierDisplayValue?: string;
    selectedZoneId?: string | null;
    files: DocumentPickerResponse[];
    onFilesSelected: (files: DocumentPickerResponse[]) => void;
    fileUploaderRef: React.RefObject<FileUploaderRef | null>;
}

export const WarehouseInformation: React.FC<WarehouseInformationProps> = React.memo(
    ({
        date,
        onDateChange,
        supplier,
        onSupplierChange,
        supplierDisplayValue,
        selectedZoneId,
        files,
        onFilesSelected,
        fileUploaderRef,
    }) => {
        const handleSupplierChange = React.useCallback(
            (supplierId: string) => onSupplierChange(supplierId),
            [onSupplierChange]
        );

        return (
            <View style={styles.cardContainer}>
                <CollapseHead title="Thông tin nhập kho" />

                <View style={styles.content}>
                    <DateInputButton
                        label="Ngày nhập"
                        required
                        date={date}
                        onDateChange={onDateChange}
                        dateOnly
                        formatOptions={{ showCurrentLabel: false }}
                    />

                    <DropdownSupplierItem
                        label="Nhà cung cấp"
                        required
                        value={supplier}
                        onChange={handleSupplierChange}
                        placeholder="Nhập nhà cung cấp"
                        displayValue={supplierDisplayValue}
                        useAutoScroll={true}
                        zoneId={selectedZoneId || undefined}
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
    }
);

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
        gap: spacing.md,
        paddingHorizontal: 12,
        paddingBottom: 12,
    },
});
