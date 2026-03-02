import { z } from 'zod';

export const OTHER_REASON_KEY = 'Lý do khác';

export const DELETE_REASONS = [
    'Không còn sử dụng ứng dụng nữa',
    'Ứng dụng khó sử dụng',
    'Ứng dụng hay bị lỗi / chạy không ổn định',
    'Không đáp ứng đúng nhu cầu công việc',
    OTHER_REASON_KEY,
];

export const deleteAccountSchema = z
    .object({
        phoneNumber: z
            .string()
            .min(1, 'Vui lòng nhập số điện thoại.')
            .regex(/^(03|05|07|08|09)+([0-9]{8})\b/, 'Số điện thoại không chính xác'),
        selectedReasons: z.array(z.string()).min(1, 'Vui lòng chọn một lý do.'),
        otherReasonNote: z.string().optional(),
    })
    .refine(
        data => {
            if (data.selectedReasons.includes(OTHER_REASON_KEY)) {
                return !!data.otherReasonNote && data.otherReasonNote.trim().length > 0;
            }
            return true;
        },
        {
            message: 'Vui lòng nhập chi tiết lý do khác.',
            path: ['selectedReasons'], // Attach error to selectedReasons or a generic place so it shows up
        }
    );

export type DeleteAccountFormData = z.infer<typeof deleteAccountSchema>;
