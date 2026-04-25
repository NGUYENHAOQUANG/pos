export interface IUserAccount {
    userId: string;
    phoneNumber: string;
    address: string | null;
    email: string | null;
    fullName: string | null;
    avatar: string | null;
    status: string;
    isActive?: boolean;
    roleId: string | null;
    roleCode: string | null;
    roleName: string | null;
    zoneId?: string;
    zoneName?: string;
    policies: string[];
    lastLoginAt: string | null;
    phoneNumberConfirmed: boolean;
    emailConfirmed: boolean;
}

export interface GetUsersParams {
    SearchText?: string;
    ZoneId?: string;
    Page?: number;
    PageSize?: number;
}

export interface IRole {
    id: string;
    name: string;
    code: string;
    description: string;
    priority: number;
    isSystemRole: boolean;
    policies?: string[];
}

export enum RoleType {
    ADMIN = 'ADMIN',
    MANAGER = 'MANAGER',
    EMPLOYEE_MANAGER = 'EMPLOYEE_MANAGER',
    EMPLOYEE_WAREHOUSE = 'EMPLOYEE_WAREHOUSE',
    FARMER = 'FARMER',
}

export interface UpdateUserPayload {
    fullName?: string;
    roleId?: string;
    isActive?: boolean;
    zoneId?: string;
}

export interface CreateUserPayload {
    fullName: string;
    phoneNumber: string;
    roleId: string;
    zoneId?: string;
}

export interface UpdateUserAdminResponse {
    id: string;
    fullName: string;
    roleId: string;
    roleName: string;
    isActive: boolean;
    zoneId: string | null;
    zoneName: string | null;
}

export interface RolePolicy {
    codeId: string;
    codeValue: string;
    codeName: string;
    codeNo: number;
    type: string;
    hasPermission: boolean;
}

export interface RolePolicyModule {
    moduleGroup: string;
    module: string;
    moduleName: string;
    policies: RolePolicy[];
}
