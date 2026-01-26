/**
 * @file materialValidation.ts
 * @description Material form validation schemas and helpers
 * @created 2025-01-XX
 */
import { z } from 'zod';
import { showValidationError } from '@/features/material/utils/validationToast';

/**
 * Schema for validating material form data
 */
export const materialFormSchema = z.object({
    name: z.string().min(1, 'Vui lòng nhập tên vật tư').trim(),
    group: z.string().min(1, 'Vui lòng chọn nhóm vật tư'),
    type: z.string().min(1, 'Vui lòng chọn loại vật tư'),
    unit: z.union([z.string(), z.number()]).refine(
        val => {
            if (typeof val === 'number') return val > 0;
            return val && val.toString().trim().length > 0;
        },
        { message: 'Vui lòng chọn đơn vị tính' }
    ),
    usage: z.string().min(1, 'Vui lòng nhập công dụng').trim(),
    manufacturer: z.string().min(1, 'Vui lòng nhập nhà sản xuất').trim(),
});

export type MaterialFormData = z.infer<typeof materialFormSchema>;

/**
 * Validation result type
 */
export interface ValidationResult {
    success: boolean;
    error?: string;
    data?: MaterialFormData;
}

/**
 * Validate material form data
 * @param data - Form data to validate
 * @returns Validation result with success status and error message
 */
export const validateMaterialForm = (data: {
    name: string;
    group: string;
    type: string;
    unit: string | number;
    usage: string;
    manufacturer: string;
}): ValidationResult => {
    const result = materialFormSchema.safeParse(data);

    if (!result.success) {
        const firstError = result.error.errors[0];
        return {
            success: false,
            error: firstError.message,
        };
    }

    return {
        success: true,
        data: result.data,
    };
};

/**
 * Validate and show error toast if validation fails
 * @param data - Form data to validate
 * @returns true if validation passes, false otherwise
 */
export const validateMaterialFormWithToast = (data: {
    name: string;
    group: string;
    type: string;
    unit: string | number;
    usage: string;
    manufacturer: string;
}): boolean => {
    const result = validateMaterialForm(data);

    if (!result.success && result.error) {
        showValidationError(result.error);
        return false;
    }

    return true;
};

/**
 * Validate material type exists in the provided types list
 * @param typeName - Type name to validate
 * @param materialTypes - List of material types
 * @param typesByGroup - List of types filtered by group
 * @returns true if type exists, false otherwise
 */
export const validateMaterialType = (
    typeName: string,
    materialTypes: Array<{ name: string | null; id: string | number }>,
    typesByGroup: Array<{ name: string | null; id: string | number }>
): { isValid: boolean; type?: { name: string | null; id: string | number } } => {
    const selectedType =
        materialTypes.find(t => t.name === typeName) || typesByGroup.find(t => t.name === typeName);

    if (!selectedType) {
        return { isValid: false };
    }

    return { isValid: true, type: selectedType };
};

/**
 * Validate and convert unit to unitId
 * @param unit - Unit value (string or number)
 * @returns Validation result with unitId
 */
export const validateAndConvertUnit = (
    unit: string | number
): { isValid: boolean; unitId?: string | number; error?: string } => {
    // If it's a number, check positive
    if (typeof unit === 'number') {
        if (unit <= 0) {
            return {
                isValid: false,
                error: 'Đơn vị tính không hợp lệ',
            };
        }
        return {
            isValid: true,
            unitId: unit,
        };
    }

    // If it's a string, ensure not empty
    if (!unit || unit.trim() === '') {
        return {
            isValid: false,
            error: 'Đơn vị tính không hợp lệ',
        };
    }

    return {
        isValid: true,
        unitId: unit,
    };
};
