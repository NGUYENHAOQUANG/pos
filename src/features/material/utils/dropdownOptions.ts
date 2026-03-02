/**
 * @file dropdownOptions.ts
 * @description Utilities for converting data to dropdown options
 */
import { IMaterialType } from '@/features/material/types/material.types';
import { DropdownOption } from '@/features/material/components/DropdownMaterial';

/**
 * Convert material types to dropdown options
 * @param types - Array of material types
 * @param showEmptyMessage - If true, show disabled "no options" message when empty
 * @returns Array of dropdown options
 */
export const getMaterialTypeOptions = (
    types: IMaterialType[],
    showEmptyMessage: boolean = false
): DropdownOption[] => {
    // Ensure types is an array (handle undefined/null)
    const typesArray = Array.isArray(types) ? types : [];

    // Convert types to dropdown options
    const options: DropdownOption[] = typesArray
        .filter(t => t && t.name) // Filter out types without name
        .map(t => ({
            label: t.name || '',
            value: t.id,
        }));

    // If no options available and showEmptyMessage is true, show disabled message
    if (options.length === 0 && showEmptyMessage) {
        return [
            {
                label: 'Không có loại vật tư phù hợp',
                value: '__no_options__',
                disabled: true,
            } as DropdownOption & { disabled: boolean },
        ];
    }

    return options;
};
