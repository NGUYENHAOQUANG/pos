import React from 'react';
import { ViewStyle } from 'react-native';
import { InfiniteScrollDropdown } from '@/shared/components/forms/InfiniteScrollDropdown';
import { useInfiniteDropdown } from '@/shared/hooks/useInfiniteDropdown';
import { useInfiniteMaterials } from '@/features/material/hooks';
import { IMaterial, GetMaterialsParams } from '@/features/material/types/material.types';

interface DropdownMaterialItemProps {
    /** Currently selected material ID */
    value?: string;
    /** Callback when a material is selected */
    onChange?: (materialId: string, material: IMaterial) => void;
    /** Label text above the dropdown */
    label?: string | React.ReactNode;
    /** Whether the field is required */
    required?: boolean;
    /** Placeholder text when no value is selected */
    placeholder?: string;
    /** Extra filters to pass to the API */
    filterParams?: Omit<GetMaterialsParams, 'Page' | 'PageSize' | 'SearchText'>;
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
 * Material-specific dropdown with infinite scroll.
 * Thin wrapper around InfiniteScrollDropdown + useInfiniteDropdown.
 */
const DropdownMaterialItemComponent: React.FC<DropdownMaterialItemProps> = ({
    value,
    onChange,
    label,
    required,
    placeholder = 'Chọn vật tư',
    filterParams,
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
        data: materials = [],
        isLoading,
        isFetchingNextPage,
        fetchNextPage,
        hasNextPage,
        refetch,
        isRefetching,
    } = useInfiniteMaterials(
        {
            ...filterParams,
            SearchText: debouncedSearch || undefined,
        },
        { enabled: isOpen }
    );

    return (
        <InfiniteScrollDropdown<IMaterial>
            value={value}
            displayValue={displayValue}
            onSelect={onChange}
            label={label}
            required={required}
            placeholder={placeholder}
            disabled={disabled}
            buttonStyle={buttonStyle}
            useAutoScroll={useAutoScroll}
            searchPlaceholder="Tìm vật tư​"
            emptyText="Không tìm thấy vật tư​"
            isOpen={isOpen}
            onOpen={handleOpen}
            onClose={handleClose}
            searchText={searchText}
            onSearchChange={handleSearchChange}
            onClearSearch={clearSearch}
            items={materials}
            isLoading={isLoading}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            fetchNextPage={fetchNextPage}
            refreshing={isRefetching}
            onRefresh={refetch}
        />
    );
};

export const DropdownMaterialItem = React.memo(DropdownMaterialItemComponent);
