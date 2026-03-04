import { z } from 'zod';

// Form status values used in UI
export const AQUACULTURE_STATUS = {
    PREPARING: 'preparing',
    ACTIVE: 'active',
    ENDED: 'ended',
} as const;

export type AquacultureFormStatus = (typeof AQUACULTURE_STATUS)[keyof typeof AQUACULTURE_STATUS];

export const aquacultureFormSchema = z.object({
    zoneId: z.string().min(1, 'Vui lòng chọn trại nuôi'),
    zoneName: z.string().optional(),
    name: z.string().min(1, 'Vui lòng nhập tên vụ nuôi'),
    code: z.string().optional(),
    startDate: z.date({ required_error: 'Vui lòng chọn ngày bắt đầu' }),
    endDate: z.date().nullable().optional(),
    status: z.enum(['preparing', 'active', 'ended']).default('preparing'),
    note: z.string().optional(),
});

export type AquacultureFormValues = z.infer<typeof aquacultureFormSchema>;
