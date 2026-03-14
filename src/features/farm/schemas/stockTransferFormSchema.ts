import { z } from 'zod';

const receivingPondSchema = z.object({
    id: z.string(),
    receivingPond: z.string().optional(),
    quantity: z.string(),
});

export const stockTransferFormSchema = z
    .object({
        selectedDate: z.date({ required_error: 'Vui lòng chọn ngày' }),
        shrimpSize: z
            .string({ required_error: 'Vui lòng nhập cỡ tôm hiện tại' })
            .min(1, { message: 'Vui lòng nhập cỡ tôm hiện tại' }),
        transferMethod: z.string().default('Sang hết'),
        receivingPonds: z
            .array(receivingPondSchema)
            .min(1, { message: 'Vui lòng thêm ít nhất một ao nhận' }),
        notes: z.string().optional(),
    })
    .refine(
        data => {
            const valid = data.receivingPonds.filter(p => p.quantity.trim() !== '');
            return valid.length > 0;
        },
        {
            message: 'Vui lòng nhập số lượng cho ít nhất một ao nhận',
            path: ['receivingPonds'],
        }
    )
    .refine(
        data => {
            const withQuantity = data.receivingPonds.filter(p => p.quantity.trim() !== '');
            return withQuantity.every(p => !!p.receivingPond);
        },
        {
            message: 'Vui lòng chọn ao nhận cho tất cả các dòng có số lượng',
            path: ['receivingPonds'],
        }
    );

export type StockTransferFormValues = z.infer<typeof stockTransferFormSchema>;
