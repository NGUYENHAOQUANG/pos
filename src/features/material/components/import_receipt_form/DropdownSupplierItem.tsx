import React from 'react';
import { ViewStyle } from 'react-native';
import { InfiniteScrollDropdown } from '@/shared/components/forms/InfiniteScrollDropdown';
import { useInfiniteDropdown } from '@/shared/hooks/useInfiniteDropdown';
import { useInfiniteSuppliers } from '@/features/material/hooks';
import { ISupplier } from '@/features/material/types/supplier.types';

interface DropdownSupplierItemProps {
    /** Currently selected supplier ID */
    value?: string;
    /** Callback when a supplier is selected */
    onChange?: (supplierId: string, supplier: ISupplier) => void;
    /** Label text above the dropdown */
    label?: string | React.ReactNode;
    /** Whether the field is required */
    required?: boolean;
    /** Placeholder text when no value is selected */
    placeholder?: string;
    /** Zone ID to filter suppliers */
    zoneId?: string;
    /** Whether dropdown is disabled */
    disabled?: boolean;
    /** Display value override (e.g. from parent) */
    displayValue?: string;
    /** Additional style for the trigger button */
    buttonStyle?: ViewStyle;
    /** Use auto-scroll text for long names */
    useAutoScroll?: boolean;
}

/**
 * Supplier-specific dropdown with infinite scroll.
 * Thin wrapper around InfiniteScrollDropdown + useInfiniteDropdown.
 */
const DropdownSupplierItemComponent: React.FC<DropdownSupplierItemProps> = ({
    value,
    onChange,
    label,
    required,
    placeholder = 'Chọn nhà cung cấp',
    zoneId,
    disabled = false,
    displayValue,
    buttonStyle,
    useAutoScroll = false,
}) => {
    const {
        isOpen,
        searchText,
        debouncedSearch,
        handleOpen,
        handleClose,
        handleSearchChange,
        clearSearch,
    } = useInfiniteDropdown();

    const {
        data: suppliers = [],
        isLoading,
        isFetchingNextPage,
        fetchNextPage,
        hasNextPage,
    } = useInfiniteSuppliers(
        {
            ZoneId: zoneId,
            SearchText: debouncedSearch || undefined,
        },
        { enabled: isOpen }
    );

    return (
        <InfiniteScrollDropdown<ISupplier>
            value={value}
            displayValue={displayValue}
            onSelect={onChange}
            label={label}
            required={required}
            placeholder={placeholder}
            disabled={disabled}
            buttonStyle={buttonStyle}
            useAutoScroll={useAutoScroll}
            searchPlaceholder="Tìm nhà cung cấp"
            emptyText="Không tìm thấy nhà cung cấp"
            isOpen={isOpen}
            onOpen={handleOpen}
            onClose={handleClose}
            searchText={searchText}
            onSearchChange={handleSearchChange}
            onClearSearch={clearSearch}
            items={suppliers}
            isLoading={isLoading}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            fetchNextPage={fetchNextPage}
        />
    );
};

export const DropdownSupplierItem = React.memo(DropdownSupplierItemComponent);
