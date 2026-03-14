import { z } from 'zod';

/** Create an optional numeric string field — no range validation (limits are UI warnings only) */
const numericField = () => {
    return z
        .string()
        .optional()
        .default('')
        .refine(val => val === '' || !isNaN(parseFloat(val)), {
            message: 'Giá trị phải là số',
        });
};

/**
 * Creates environment form schema.
 * Range limits are handled as UI warnings only (hint prop) — NOT form validation.
 */
export const createEnvironmentFormSchema = () =>
    z
        .object({
            selectedDate: z.date({ required_error: 'Vui lòng chọn ngày' }),
            notes: z.string().optional().default(''),
            documentIds: z.array(z.string()).optional().default([]),

            // Basic parameters
            pH: numericField(),
            dissolvedOxygen: numericField(),
            temperature: numericField(),
            salinity: numericField(),
            alkalinity: numericField(),
            transparency: numericField(),

            // Advanced parameters
            kali: numericField(),
            tan: numericField(),
            magie: numericField(),
            no3: numericField(),
        })
        .refine(
            data => {
                const params = [
                    data.pH,
                    data.dissolvedOxygen,
                    data.temperature,
                    data.salinity,
                    data.alkalinity,
                    data.transparency,
                    data.kali,
                    data.tan,
                    data.magie,
                    data.no3,
                ];
                return params.some(v => v !== undefined && v.trim().length > 0);
            },
            {
                message: 'Vui lòng nhập ít nhất một chỉ số',
                path: ['pH'],
            }
        );

/** Static schema — for type inference */
export const environmentFormSchema = createEnvironmentFormSchema();

export type EnvironmentFormValues = z.infer<typeof environmentFormSchema>;

/** Default values for creating a new environment measurement */
export const defaultEnvironmentFormValues: EnvironmentFormValues = {
    selectedDate: new Date(),
    notes: '',
    documentIds: [],
    pH: '',
    dissolvedOxygen: '',
    temperature: '',
    salinity: '',
    alkalinity: '',
    transparency: '',
    kali: '',
    tan: '',
    magie: '',
    no3: '',
};
