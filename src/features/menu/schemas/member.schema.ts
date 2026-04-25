import { z } from 'zod';

export const memberSchema = z.object({
    name: z.string().trim().min(1, 'Vui lòng nhập tên'),
    contact: z.string().trim().min(1, 'Vui lòng nhập số điện thoại hoặc email'),
    roles: z.array(z.string()).min(1, 'Vui lòng chọn ít nhất 1 chức vụ'),
    zoneId: z.string().optional(),
    permissions: z.array(z.string()).min(1, 'Vui lòng chọn quyền thao tác'),
});

export type MemberFormValues = z.infer<typeof memberSchema>;
