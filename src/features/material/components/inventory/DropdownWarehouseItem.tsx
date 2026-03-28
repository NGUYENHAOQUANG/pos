import React from 'react';
import { ViewStyle } from 'react-native';
import { InfiniteScrollDropdown } from '@/shared/components/forms/InfiniteScrollDropdown';
import { useInfiniteDropdown } from '@/shared/hooks/useInfiniteDropdown';
import { useInfiniteWarehouseItems } from '@/features/material/hooks';
import { IWarehouseItem } from '@/features/material/types/warehouse.types';

/** Mapped type so warehouse items conform to InfiniteDropdownItem */
interface WarehouseDropdownItem {
    id: string;
    name: string;
    /** Original warehouse item for extra data */
    _source: IWarehouseItem;
}

interface DropdownWarehouseItemProps {
    /** Warehouse ID to fetch items for */
    warehouseId?: string;
    /** Currently selected material ID */
    value?: string;
    /** Callback when a warehouse item is selected - returns materialId and original IWarehouseItem */
    onChange?: (materialId: string, warehouseItem: IWarehouseItem) => void;
    /** Label text above the dropdown */
    label?: string | React.ReactNode;
    /** Whether the field is required */
    required?: boolean;
    /** Placeholder text when no value is selected */
    placeholder?: string;
    /** Whether dropdown is disabled */
    disabled?: boolean;
    /** Display value override (e.g. materialName from parent) */
    displayValue?: string;
    /** Material IDs that are already selected (to exclude from list) */
    excludeIds?: Set<string>;
    /** Additional style for the trigger button */
    buttonStyle?: ViewStyle;
}

/**
 * Warehouse item dropdown with infinite scroll.
 * Fetches warehouse items internally via useInfiniteWarehouseItems.
 * Maps IWarehouseItem to InfiniteDropdownItem format internally.
 */
const DropdownWarehouseItemComponent: React.FC<DropdownWarehouseItemProps> = ({
    warehouseId,
    value,
    onChange,
    label,
    required,
    placeholder = 'Chọn vật tư',
    disabled = false,
    displayValue,
    excludeIds,
    buttonStyle,
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
        data: warehouseItems = [],
        isLoading,
        isFetchingNextPage,
        fetchNextPage,
        hasNextPage,
    } = useInfiniteWarehouseItems(
        warehouseId,
        {
            SearchText: debouncedSearch || undefined,
        },
        { enabled: isOpen && !!warehouseId }
    );

    // Map & filter warehouse items to dropdown format
    const dropdownItems: WarehouseDropdownItem[] = React.useMemo(() => {
        return warehouseItems
            .filter(m => {
                // Keep current selection, exclude others that are already used
                if (excludeIds && m.materialId !== value && excludeIds.has(m.materialId)) {
                    return false;
                }
                return true;
            })
            .map(m => ({
                id: m.materialId,
                name: m.materialName || 'Unknown Material',
                _source: m,
            }));
    }, [warehouseItems, excludeIds, value]);

    const handleSelect = React.useCallback(
        (materialId: string, selected?: WarehouseDropdownItem) => {
            if (selected?._source) {
                onChange?.(materialId, selected._source);
            }
        },
        [onChange]
    );

    return (
        <InfiniteScrollDropdown<WarehouseDropdownItem>
            value={value}
            displayValue={displayValue}
            onSelect={handleSelect}
            label={label}
            required={required}
            placeholder={placeholder}
            disabled={disabled || !warehouseId}
            buttonStyle={buttonStyle}
            searchPlaceholder="Tìm vật tư​"
            emptyText="Không tìm thấy vật tư trong kho"
            isOpen={isOpen}
            onOpen={handleOpen}
            onClose={handleClose}
            searchText={searchText}
            onSearchChange={handleSearchChange}
            onClearSearch={clearSearch}
            items={dropdownItems}
            isLoading={isLoading}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            fetchNextPage={fetchNextPage}
        />
    );
};

export const DropdownWarehouseItem = React.memo(DropdownWarehouseItemComponent);
