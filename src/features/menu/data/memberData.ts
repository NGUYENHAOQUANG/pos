import { Member } from '../types/menu.types';

export const membersData: Member[] = [
    {
        id: 'NS-001',
        name: 'Nguyễn Văn Duy',
        contact: '912345678',
        email: 'duy@gmail.com',
        role: 'Quản lý',
        managementLevel: 'Cấp trại nuôi',
        status: 'active',
        unitName: 'Trại Kiên Giang',
        permissions: ['manage_member', 'perform_task', 'control_iot', 'manage_material'],
        createdAt: new Date('2025-12-10'),
    },
    {
        id: 'NS-002',
        name: 'Nguyễn Văn Bảo',
        contact: '934567890',
        email: 'bao@gmail.com',
        role: 'Nhân viên',
        managementLevel: 'Cấp ao nuôi',
        status: 'active',
        unitName: 'Ao N03',
        permissions: ['perform_task', 'control_iot', 'manage_material'],
        createdAt: new Date('2025-12-12'),
    },
    {
        id: 'NS-003',
        name: 'Nguyễn Văn Anh',
        contact: '987654321',
        email: 'anh@gmail.com',
        role: 'Nhân viên',
        managementLevel: 'Cấp ao nuôi',
        status: 'active',
        unitName: 'Ao N02',
        permissions: ['perform_task', 'control_iot'],
        createdAt: new Date('2025-12-11'),
    },
    {
        id: 'NS-004',
        name: 'Trần Thị Mai',
        contact: '901122334',
        email: 'mai@gmail.com',
        role: 'Quản lý',
        managementLevel: 'Cấp trại nuôi',
        status: 'pending',
        unitName: 'Trại Kiên Giang',
        permissions: ['manage_member'],
        createdAt: new Date('2025-12-10'),
    },
    {
        id: 'NS-005',
        name: 'Lê Văn Hùng',
        contact: '977888999',
        email: 'hung@gmail.com',
        role: 'Nhân viên',
        managementLevel: 'Cấp ao nuôi',
        status: 'paused',
        unitName: 'Ao N05',
        permissions: ['perform_task', 'manage_material'],
        createdAt: new Date('2025-12-09'),
    },
    {
        id: 'NS-006',
        name: 'Phạm Thị Hoa',
        contact: '966778899',
        email: 'hoa@gmail.com',
        role: 'Nhân viên',
        managementLevel: 'Cấp ao nuôi',
        status: 'ended',
        unitName: 'Ao N06',
        permissions: [],
        createdAt: new Date('2025-12-08'),
    },
    {
        id: 'NS-007',
        name: 'Võ Văn Tâm',
        contact: '955667788',
        email: 'tam@gmail.com',
        role: 'Quản lý',
        managementLevel: 'Cấp trại nuôi',
        status: 'pending',
        unitName: 'Trại Kiên Giang',
        permissions: ['manage_member', 'perform_task', 'control_iot', 'manage_material'],
        createdAt: new Date('2025-12-07'),
    },
];

export interface UnitData {
    id: string;
    code: string;
    name: string;
    type: 'Trại' | 'Ao';
}

export const unitsData: UnitData[] = [
    { id: '1', code: 'KG-01', name: 'Trại Kiên Giang', type: 'Trại' },
    { id: '6', code: 'HCM-01', name: 'Trại TP.HCM', type: 'Trại' },
    { id: '2', code: 'N03', name: 'Ao N03', type: 'Ao' },
    { id: '3', code: 'N02', name: 'Ao N02', type: 'Ao' },
    { id: '4', code: 'N05', name: 'Ao N05', type: 'Ao' },
    { id: '5', code: 'N06', name: 'Ao N06', type: 'Ao' },
];
