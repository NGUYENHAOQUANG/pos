export interface IUserAccount {
    userId: string;
    phoneNumber: string;
    address: string | null;
    email: string | null;
    fullName: string | null;
    avatar: string | null;
    status: string;
    roleId: string | null;
    roleCode: string | null;
    roleName: string | null;
    policies: string[];
    lastLoginAt: string | null;
    phoneNumberConfirmed: boolean;
    emailConfirmed: boolean;
}

export interface GetUsersParams {
    SearchText?: string;
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
}

export enum RoleType {
    ADMIN = 'Admin',
    MANAGER = 'Manager',
    EMPLOYEE = 'Employee',
    FARMER = 'Farmer',
}
