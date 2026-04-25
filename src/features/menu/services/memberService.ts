import { MemberFormValues } from '../schemas/member.schema';
import { IRole } from '../types/member.types';

export const memberService = {
    createDefaultFormValues: (): MemberFormValues => ({
        name: '',
        contact: '',
        roles: [],
        zoneId: undefined,
        permissions: [],
    }),

    mapDetailToForm: (member: any, _rolesResponse: IRole[]): MemberFormValues => {
        // Use roleId directly from API response
        const roles = member.roleId ? [member.roleId] : [];

        const mappedPermissions = (member.policies || []).map((p: string) => {
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
            name: member.fullName || '',
            contact: member.phoneNumber || member.email || '',
            roles,
            zoneId: member.zoneId || undefined,
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
