/**
 * @file dropdownOptions.ts
 * @description Utilities for converting data to dropdown options
 */
import { IMaterialGroup, IMaterialType, IUnit } from '@/features/material/types/material.types';
import { DropdownOption } from '@/features/material/components/material/DropdownMaterialGroup';

/**
 * Convert material groups to dropdown options
 */
export const getMaterialGroupOptions = (groups: IMaterialGroup[]): string[] => {
    return ['Tất cả nhóm vật tư', ...groups.map(g => g.name || '').filter(n => n)];
};

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
            value: t.name || '',
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

/**
 * Convert units to dropdown options
 */
export const getUnitOptions = (units: IUnit[]): DropdownOption[] => {
    return units.map(u => ({
        label: u.name,
        value: u.id,
    }));
};

/**
 * Convert materials to dropdown options for selection
 */
export const getMaterialOptions = (
    materials: Array<{ name: string; unit?: string | number; unitName?: string }>
): DropdownOption[] => {
    return materials.map(m => ({
        label: m.name,
        value: m.name,
        unit: typeof m.unit === 'number' ? String(m.unit) : m.unitName || String(m.unit || ''),
    }));
};
