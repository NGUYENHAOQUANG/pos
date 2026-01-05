import {
    JobExecution,
    ShrimpInspectionMeta,
    MeasureSizeMeta,
    SiphonMeta,
    WaterSupplyMeta,
    TransferMeta,
    HarvestMeta,
} from '@/features/farm/types/farm.types';
import { formatDate } from '@/features/farm/utils/dateUtils';

const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);

// Helper to get formatted date string
const getTodayStr = () => formatDate(today);
const getYesterdayStr = () => formatDate(yesterday);

/**
 * Mock data for JobExecution (FEED jobs)
 * Based on real-world feeding records
 */
export const mockFeedJobExecutions: JobExecution[] = [
    // N01
    {
        id: 'FE-TODAY-01',
        label: 'Lần 1',
        time: '08:00',
        date: getTodayStr(),
        pondId: 'N01',
        note: 'Lần 1 sáng, tôm ăn đều',
        materials: [{ material: { name: 'Grobest – 9122' }, quantity: 20, unit: 'kg' }],
    },
    // N02
    {
        id: 'FE-TODAY-N02',
        label: 'Lần 1',
        time: '08:00',
        date: getTodayStr(),
        pondId: 'N02',
        note: 'Tôm ăn tốt',
        materials: [{ material: { name: 'CP10' }, quantity: 25, unit: 'kg' }],
    },
    // N03
    {
        id: 'FE-TODAY-N03',
        label: 'Lần 1',
        time: '08:15',
        date: getTodayStr(),
        pondId: 'N03',
        note: 'Tôm mới thả, ăn ít',
        materials: [{ material: { name: 'UP Starter 0.8mm' }, quantity: 5, unit: 'kg' }],
    },
    // N04
    {
        id: 'FE-TODAY-N04',
        label: 'Lần 1',
        time: '08:20',
        date: getTodayStr(),
        pondId: 'N04',
        note: 'Tăng trọng',
        materials: [{ material: { name: 'CP10' }, quantity: 15, unit: 'kg' }],
    },
    // N05
    {
        id: 'FE-TODAY-N05',
        label: 'Lần 1',
        time: '08:00',
        date: getTodayStr(),
        pondId: 'N05',
        note: 'Ăn mạnh',
        materials: [{ material: { name: 'CP10' }, quantity: 40, unit: 'kg' }],
    },
    // N06
    {
        id: 'FE-TODAY-N06',
        label: 'Lần 1',
        time: '08:30',
        date: getTodayStr(),
        pondId: 'N06',
        note: 'Ăn bình thường',
        materials: [{ material: { name: 'CP10' }, quantity: 30, unit: 'kg' }],
    },
    // N07
    {
        id: 'FE-TODAY-N07',
        label: 'Lần 1',
        time: '08:00',
        date: getTodayStr(),
        pondId: 'N07',
        note: 'Giảm ăn do mưa',
        materials: [{ material: { name: 'CP09' }, quantity: 20, unit: 'kg' }],
    },
    // N08
    {
        id: 'FE-TODAY-N08',
        label: 'Lần 1',
        time: '08:10',
        date: getTodayStr(),
        pondId: 'N08',
        note: 'Chuẩn bị thu',
        materials: [{ material: { name: 'CP10' }, quantity: 35, unit: 'kg' }],
    },
    // V01
    {
        id: 'FE-TODAY-V01',
        label: 'Lần 1',
        time: '07:30',
        date: getTodayStr(),
        pondId: 'V01',
        note: 'Ươm giống',
        materials: [{ material: { name: 'UP Starter 0.8mm' }, quantity: 1, unit: 'kg' }],
    },
    // V02
    {
        id: 'FE-TODAY-V02',
        label: 'Lần 1',
        time: '07:30',
        date: getTodayStr(),
        pondId: 'V02',
        note: 'Ươm giống',
        materials: [{ material: { name: 'UP Starter 0.8mm' }, quantity: 1.2, unit: 'kg' }],
    },
    // V03
    {
        id: 'FE-TODAY-V03',
        label: 'Lần 1',
        time: '07:45',
        date: getTodayStr(),
        pondId: 'V03',
        note: 'Ươm ngày 3',
        materials: [{ material: { name: 'UP Starter 0.8mm' }, quantity: 0.5, unit: 'kg' }],
    },
];

/**
 * Mock data for JobExecution (SHRIMP_INSPECTION jobs)
 */
export const mockShrimpInspectionJobExecutions: JobExecution[] = [
    // N01
    {
        id: 'KT-TODAY-N01',
        label: 'Kiểm tra sáng',
        time: '09:00',
        date: getTodayStr(),
        pondId: 'N01',
        note: 'Tôm khỏe',
        meta: {
            foodAmount: '10',
            leftoverFood: 'Hết',
            liver: 'Tốt',
            intestine: 'Đầy',
            stoolColor: 'Nâu',
            intestineColor: 'Nâu',
        } as ShrimpInspectionMeta,
    },
    // N03
    {
        id: 'KT-TODAY-N03',
        label: 'Kiểm tra vó',
        time: '09:30',
        date: getTodayStr(),
        pondId: 'N03',
        note: 'Gan đẹp',
        meta: { foodAmount: '5', leftoverFood: 'Hết', liver: 'Tốt' } as ShrimpInspectionMeta,
    },
    // N05
    {
        id: 'KT-TODAY-N05',
        label: 'Kiểm tra trưa',
        time: '11:00',
        date: getTodayStr(),
        pondId: 'N05',
        note: 'Đường ruột to',
        meta: { foodAmount: '40', leftoverFood: 'Còn ít' } as ShrimpInspectionMeta,
    },
    // V01
    {
        id: 'KT-TODAY-V01',
        label: 'Soi kính',
        time: '10:00',
        date: getTodayStr(),
        pondId: 'V01',
        note: 'Không ký sinh trùng',
        meta: { foodAmount: '1', liver: 'Vàng nhạt' } as ShrimpInspectionMeta,
    },
];

/**
 * Mock data for JobExecution (MEASURE_SIZE jobs)
 */
export const mockMeasureSizeJobExecutions: JobExecution[] = [
    // N01 - Today
    {
        id: 'SK-TODAY-N01',
        label: 'Cân mẫu',
        time: '14:00',
        date: getTodayStr(),
        pondId: 'N01',
        note: 'Size 85 về',
        meta: { shrimpSize: '85', remainingWeight: '2200' } as MeasureSizeMeta,
    },
    // N04 - Yesterday
    {
        id: 'SK-YESTERDAY-N04',
        label: 'Cân mẫu',
        time: '14:00',
        date: getYesterdayStr(),
        pondId: 'N04',
        note: 'Tôm lớn nhanh',
        meta: { shrimpSize: '120', remainingWeight: '1000' } as MeasureSizeMeta,
    },
];

/**
 * Mock data for JobExecution (SIPHON jobs)
 */
export const mockSiphonJobExecutions: JobExecution[] = [
    {
        id: 'XP-TODAY-N01',
        label: 'Xi phông',
        time: '07:00',
        date: getTodayStr(),
        pondId: 'N01',
        note: 'Sạch đáy',
        meta: { lossAmount: '2', images: [] } as SiphonMeta,
    },
    {
        id: 'XP-TODAY-N06',
        label: 'Xi phông',
        time: '07:15',
        date: getTodayStr(),
        pondId: 'N06',
        note: 'Nhiều vỏ',
        meta: { lossAmount: '5', images: [] } as SiphonMeta,
    },
];

/**
 * Mock data for JobExecution (HANDLE_PROBLEM jobs)
 */
export const mockHandleProblemJobExecutions: JobExecution[] = [
    {
        id: 'SC-TODAY-N02',
        label: 'Rớt cục thịt',
        time: '06:00',
        date: getTodayStr(),
        pondId: 'N02',
        note: 'Vớt xác, kiểm tra khí độc',
        images: [],
    },
];

/**
 * Mock data for JobExecution (WATER_SUPPLY jobs)
 */
export const mockWaterSupplyJobExecutions: JobExecution[] = [
    {
        id: 'WC-TODAY-SS01',
        label: 'Cấp nước',
        time: '08:00',
        date: getTodayStr(),
        pondId: 'SS01',
        note: 'Cấp đầy ao',
        meta: { targetLevel: '140', supplyLevel: '20' } as WaterSupplyMeta,
    },
];

/**
 * Mock data for JobExecution (WATER_TREATMENT jobs)
 */
export const mockWaterTreatmentJobExecutions: JobExecution[] = [
    {
        id: 'XL-TODAY-N01',
        label: 'Đánh khoáng',
        time: '20:00',
        date: getTodayStr(),
        pondId: 'N01',
        note: 'Định kỳ',
        waterTreatmentType: 'Đánh khoáng',
        materials: [{ material: { name: 'MineralMix' }, quantity: 10, unit: 'kg' }],
    },
    {
        id: 'XL-TODAY-N08',
        label: 'Diệt khuẩn',
        time: '09:00',
        date: getTodayStr(),
        pondId: 'N08',
        note: 'Trước khi thu tôm',
        waterTreatmentType: 'Diệt khuẩn',
        materials: [{ material: { name: 'BKC' }, quantity: 5, unit: 'lít' }],
    },
];

export const mockTransferJobExecutions: JobExecution[] = [
    {
        id: 'SA-TODAY-V01',
        label: 'Sang tôm',
        time: '07:00',
        date: getTodayStr(),
        pondId: 'V01',
        note: 'Sang qua N01',
        meta: { transferMethod: 'Sang hết' } as TransferMeta,
    },
];

export const mockHarvestJobExecutions: JobExecution[] = [
    {
        id: 'TH-TODAY-N07',
        label: 'Thu tỉa',
        time: '05:00',
        date: getTodayStr(),
        pondId: 'N07',
        note: 'Thu bớt',
        meta: { harvestType: 'Thu tỉa', shrimpSize: '60', revenue: 100000000 } as HarvestMeta,
    },
];
