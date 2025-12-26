import { SeasonData } from '@/features/farm/types/farm.types';

export const DUMMY_SEASON_DATA: SeasonData[] = [
    {
        id: 'VH2025-A',
        name: 'Vụ Hè 2025 – Khu A',
        farmCode: 'KG-01',
        startDate: '1/12/2025',
        endDate: '04/30/2025',
        status: 'Đang hoạt động',
    },
    {
        id: 'VH2025-B',
        name: 'Vụ Hè 2025 – Khu B',
        farmCode: 'KG-01',
        startDate: '3/12/2025',
        endDate: '05/15/2025',
        status: 'Đang hoạt động',
    },
    {
        id: 'VD2025-A',
        name: 'Vụ Đông 2025 – Khu A',
        farmCode: 'KG-01',
        startDate: '1/6/2025',
        endDate: '5/6/2025',
        status: 'Đã kết thúc',
    },
    {
        id: 'VD2025-B',
        name: 'Vụ Đông 2025 – Khu B',
        farmCode: 'KG-01',
        startDate: '06/15/2025',
        endDate: '10/6/2025',
        status: 'Đã kết thúc',
    },
];
