import { MemberFormValues } from '../schemas/member.schema';
import { IRole } from '../types/member.types';

export const memberService = {
    createDefaultFormValues: (): MemberFormValues => ({
        name: '',
        contact: '',
        roles: [],
        permissions: [],
    }),

    mapDetailToForm: (member: any, rolesResponse: IRole[]): MemberFormValues => {
        const roleStr = member.role;
        let mappedRoleId: string | null = null;
        if (roleStr && rolesResponse) {
            let matchingCode = '';
            if (roleStr === 'Admin') matchingCode = 'ADMIN';
            else if (roleStr === 'Quản lý' || roleStr === 'Manager') matchingCode = 'MANAGER';
            else if (roleStr === 'Nhân viên' || roleStr === 'Employee') matchingCode = 'EMPLOYEE';
            else if (roleStr === 'Farmer') matchingCode = 'USER';

            const found = rolesResponse.find(r => r.code === matchingCode);
            if (found) mappedRoleId = found.id;
        }

        const newRoles = member.roleIds ? member.roleIds : mappedRoleId ? [mappedRoleId] : [];

        const mappedPermissions = (member.permissions || []).map((p: string) => {
            switch (p) {
                case 'manage_member':
                    return 'member_management';
                case 'perform_task':
                    return 'task_execution';
                case 'control_iot':
                    return 'iot_control';
                case 'manage_material':
                    return 'material_management';
                default:
                    return p;
            }
        });

        return {
            name: member.name || '',
            contact: member.email || member.phone || '',
            roles: newRoles,
            permissions: mappedPermissions,
        };
    },

    mapFormToPayload: (data: MemberFormValues) => {
        return {
            name: data.name,
            contact: data.contact,
            roleIds: data.roles,
            permissions: data.permissions,
        };
    },
};
