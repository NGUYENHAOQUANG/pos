import { MaterialItem } from '@/features/material/components/AddWarehouseMaterial';
import { numericStringSchema } from '@/shared/utils/validation';

export const warehouseFormUtils = {
    handleFormError: (errors: any, showValidationError: (msg: string) => void) => {
        const firstKey = Object.keys(errors)[0];
        if (!firstKey) return;

        const error = errors[firstKey];
        if (error?.message) {
            showValidationError(error.message);
        } else if (Array.isArray(error)) {
            const itemError = error.find((e: any) => e !== undefined);
            if (itemError) {
                const mapKey = Object.keys(itemError)[0];
                showValidationError(
                    itemError[mapKey]?.message || 'Vui lòng kiểm tra lại thông tin vật tư'
                );
            }
        }
    },

    calculateItemTotal: (quantity: string | number, price: string | number) => {
        return (parseFloat(quantity as string) || 0) * (parseFloat(price as string) || 0);
    },

    calculateTotal: (items: MaterialItem[]) => {
        return items.reduce((sum, item) => {
            const qty = parseFloat(item.quantity) || 0;
            const price = parseFloat(item.price) || 0;
            return sum + qty * price;
        }, 0);
    },

    isQuantityOverStock: (quantity: string, availableQuantity?: number) => {
        if (availableQuantity === undefined) return false;
        const quantityNum = parseFloat(quantity) || 0;
        return quantityNum > availableQuantity;
    },

    sanitizeNumericInput: (val: string, type: 'quantity' | 'price'): string | null => {
        if (type === 'quantity') {
            if (/^\d*\.?\d*$/.test(val)) {
                return val;
            }
        }
        if (type === 'price') {
            const cleanVal = val.replace(/,/g, '');
            if (numericStringSchema.safeParse(cleanVal).success) {
                return cleanVal;
            }
        }
        return null;
    },

    formatPriceInput: (val: string) => {
        return val.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },
};
