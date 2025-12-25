import { DeviceData } from '@/features/menu/types/menu.types';

export const DEVICES_DATA: DeviceData[] = [
    {
        id: '1',
        name: 'Cảm biến Oxi',
        type: 'Cảm biến',
        status: 'installed',
        importDate: '20/12/2024',
        totalRunTime: '120 giờ',
        maintenance: {
            operatingTime: {
                current: 100,
                limit: 200,
            },
            usageTime: {
                current: 25,
                limit: 30,
            },
        },
    },
    {
        id: '2',
        name: 'Quạt nước',
        type: 'Thiết bị cơ khí',
        status: 'warehouse',
        importDate: '22/12/2024',
        totalRunTime: '0 giờ',
        maintenance: {
            operatingTime: {
                current: 0,
                limit: 500,
            },
            usageTime: {
                current: 0,
                limit: 180,
            },
        },
    },
    {
        id: '3',
        name: 'Máy cho ăn tự động',
        type: 'Thiết bị cho ăn',
        status: 'maintenance',
        importDate: '15/10/2024',
        totalRunTime: '450 giờ',
        maintenance: {
            operatingTime: {
                current: 480, // Close to limit
                limit: 500,
            },
            usageTime: {
                current: 175, // Close to limit or over
                limit: 180,
            },
        },
    },
];
