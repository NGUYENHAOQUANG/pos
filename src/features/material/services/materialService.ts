import {
    IMaterial,
    CreateMaterialV2Request,
    UpdateMaterialV2Request,
    IUnit,
} from '@/features/material/types/material.types';
import { MaterialFormValues } from '@/features/material/schemas/materialFormSchema';

export const materialService = {
    mapDetailToForm: (detail: IMaterial, units: IUnit[]): MaterialFormValues => {
        let matchedUnit = '';
        if (units.some(u => u.id === detail.unit)) {
            matchedUnit = detail.unit;
        } else if (detail.unitName) {
            const unitByName = units.find(u => u.name === detail.unitName);
            if (unitByName) matchedUnit = unitByName.id;
        }

        return {
            name: detail.name,
            group: detail.groupId ?? detail.group,
            type: detail.typeId || '',
            unit: matchedUnit,
            usage: detail.usage,
            manufacturer: detail.manufacturer,
            isActive: detail.isActive ?? true,
        };
    },

    mapFormToCreatePayload: (
        formData: MaterialFormValues,
        warehouseId: string
    ): CreateMaterialV2Request => {
        return {
            warehouseId,
            name: formData.name.trim(),
            materialTypeId: formData.type,
            description: formData.usage?.trim() || '',
            unitId: formData.unit,
            manufacturer: formData.manufacturer?.trim() || '',
            isActive: formData.isActive,
        };
    },

    mapFormToUpdatePayload: (formData: MaterialFormValues): UpdateMaterialV2Request => {
        return {
            name: formData.name.trim(),
            materialTypeId: formData.type,
            description: formData.usage?.trim() || '',
            unitId: formData.unit,
            manufacturer: formData.manufacturer?.trim() || '',
            isActive: formData.isActive,
        };
    },
};
