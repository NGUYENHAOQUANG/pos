import React, { useMemo } from 'react';
import { ViewStyle } from 'react-native';
import { InfiniteScrollDropdown } from '@/shared/components/forms/InfiniteScrollDropdown';
import { useInfiniteDropdown } from '@/shared/hooks/useInfiniteDropdown';
import type { DropDownItem } from '@/features/farm/components/DropDownButtonBasic';

interface DropdownPondItemProps {
    value?: string;
    onChange?: (pondId: string) => void;
    label?: string | React.ReactNode;
    required?: boolean;
    placeholder?: string;
    disabled?: boolean;
    buttonStyle?: ViewStyle;
    useAutoScroll?: boolean;
    options: DropDownItem[];
}

const DropdownPondItemComponent: React.FC<DropdownPondItemProps> = ({
    value,
    onChange,
    label,
    required,
    placeholder = 'Chọn',
    disabled = false,
    buttonStyle,
    useAutoScroll = false,
    options,
}) => {
    const { isOpen, searchText, handleOpen, handleClose, handleSearchChange, clearSearch } =
        useInfiniteDropdown();

    const mappedOptions = useMemo(() => {
        return options.map(o => ({
            id: String(o.id),
            name: String(o.label),
        }));
    }, [options]);

    const filteredOptions = useMemo(() => {
        if (!searchText) return mappedOptions;
        const lowerSearch = searchText.toLowerCase();
        return mappedOptions.filter(o => o.name.toLowerCase().includes(lowerSearch));
    }, [mappedOptions, searchText]);

    const displayValue = useMemo(() => {
        return mappedOptions.find(o => o.id === value)?.name;
    }, [mappedOptions, value]);

    return (
        <InfiniteScrollDropdown
            value={value}
            displayValue={displayValue}
            onSelect={onChange}
            label={label}
            required={required}
            placeholder={placeholder}
            disabled={disabled}
            buttonStyle={buttonStyle}
            useAutoScroll={useAutoScroll}
            searchPlaceholder="Tìm kiếm ao"
            emptyText="Không tìm thấy ao"
            isOpen={isOpen}
            onOpen={handleOpen}
            onClose={handleClose}
            searchText={searchText}
            onSearchChange={handleSearchChange}
            onClearSearch={clearSearch}
            items={filteredOptions}
        />
    );
};

export const DropdownPondItem = React.memo(DropdownPondItemComponent);
