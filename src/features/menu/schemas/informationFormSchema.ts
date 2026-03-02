import { z } from 'zod';

export const informationFormSchema = z.object({
    name: z.string().min(1, 'Vui lòng nhập họ tên'),
    email: z.string().min(1, 'Vui lòng nhập email').email('Email không đúng định dạng'),
    address: z.string().optional(),

    // Readonly fields
    phone: z.string().optional(),
    role: z.string().optional(),
    level: z.string().optional(),
});

export type InformationFormValues = z.infer<typeof informationFormSchema>;
