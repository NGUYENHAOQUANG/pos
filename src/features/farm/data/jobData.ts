import {
    JobExecution,
    ShrimpInspectionMeta,
    MeasureSizeMeta,
    SiphonMeta,
    WaterSupplyMeta,
    TransferMeta,
    HarvestMeta,
} from '@/features/farm/types/farm.types';

/**
 * Mock data for JobExecution (FEED jobs)
 * Based on real-world feeding records
 */
export const mockFeedJobExecutions: JobExecution[] = [
    {
        id: 'FE-20251201-01',
        label: 'Lần 1',
        time: '08:00',
        date: '12/1/2025',
        pondId: 'N01',
        note: 'Lần 1 sáng, tôm ăn đều',
        materials: [
            {
                material: { name: 'Grobest – 9122' },
                quantity: 20,
                unit: 'kg',
            },
            {
                material: { name: 'UP Starter 0.8mm' },
                quantity: 5,
                unit: 'kg',
            },
        ],
    },
    {
        id: 'FE-20251201-02',
        label: 'Lần 2',
        time: '14:00',
        date: '12/1/2025',
        pondId: 'N01',
        note: 'Lần 2 chiều, tăng khẩu phần',
        materials: [
            {
                material: { name: 'CP10' },
                quantity: 30,
                unit: 'kg',
            },
        ],
    },
    {
        id: 'FE-20251202-01',
        label: 'Lần 1',
        time: '08:30',
        date: '12/2/2025',
        pondId: 'N02',
        note: 'Lần 1 sáng, ăn đều',
        materials: [
            {
                material: { name: 'CP09' },
                quantity: 26,
                unit: 'kg',
            },
        ],
    },
    {
        id: 'FE-20251202-02',
        label: 'Lần 2',
        time: '16:00',
        date: '12/2/2025',
        pondId: 'N02',
        note: 'Lần 2 chiều, ăn tốt',
        materials: [
            {
                material: { name: 'CP10' },
                quantity: 34,
                unit: 'kg',
            },
        ],
    },
    {
        id: 'FE-20251203-01',
        label: 'Lần 1',
        time: '09:00',
        date: '12/3/2025',
        pondId: 'N05',
        note: 'Growth-out, khẩu phần cao',
        materials: [
            {
                material: { name: 'CP10' },
                quantity: 40,
                unit: 'kg',
            },
        ],
    },
    {
        id: 'FE-20251203-02',
        label: 'Lần 2',
        time: '15:30',
        date: '12/3/2025',
        pondId: 'N06',
        note: 'Mưa nhẹ, giảm chút',
        materials: [
            {
                material: { name: 'CP10' },
                quantity: 32,
                unit: 'kg',
            },
        ],
    },
    {
        id: 'FE-20251201-V1',
        label: 'Lần 1',
        time: '08:00',
        date: '12/1/2025',
        pondId: 'V01',
        note: 'Ươm nhẹ, tôm nhỏ',
        materials: [
            {
                material: { name: 'UP Starter 0.8mm' },
                quantity: 0.5,
                unit: 'kg',
            },
        ],
    },
    {
        id: 'FE-20251201-V2',
        label: 'Lần 2',
        time: '14:00',
        date: '12/1/2025',
        pondId: 'V02',
        note: 'Ươm nhẹ, tôm nhỏ',
        materials: [
            {
                material: { name: 'Grobest – 9122' },
                quantity: 0.8,
                unit: 'kg',
            },
        ],
    },
];

/**
 * Mock data for JobExecution (SHRIMP_INSPECTION jobs)
 * Based on real-world shrimp inspection records
 */
export const mockShrimpInspectionJobExecutions: JobExecution[] = [
    {
        id: 'KT-20251201-01',
        label: 'Lần 1',
        time: '08:30',
        date: '1/12/2025',
        pondId: 'N01',
        note: 'Tôm ăn yếu buổi sáng',
        meta: {
            foodAmount: '10',
            leftoverFood: '5–10%',
            liver: 'Bình thường',
            intestine: 'Rỗng',
            stoolColor: 'Màu thức ăn',
            intestineColor: 'Màu thức ăn',
        } as ShrimpInspectionMeta,
    },
    {
        id: 'KT-20251202-02',
        label: 'Lần 2',
        time: '09:00',
        date: '2/12/2025',
        pondId: 'N02',
        note: 'Tôm ăn tốt, gan hơi cam',
        meta: {
            foodAmount: '12',
            leftoverFood: 'Hết',
            liver: 'Bình thường',
            intestine: 'Đầy',
            stoolColor: 'Màu thức ăn',
            intestineColor: 'Màu thức ăn',
        } as ShrimpInspectionMeta,
    },
    {
        id: 'KT-20251203-03',
        label: 'Lần 3',
        time: '09:15',
        date: '3/12/2025',
        pondId: 'N05',
        note: 'Tôm ăn kém do trời mưa',
        meta: {
            foodAmount: '8',
            leftoverFood: '10–15%',
            liver: 'Bình thường',
            intestine: 'Đầy',
            stoolColor: 'Bất thường',
            intestineColor: 'Bất thường',
        } as ShrimpInspectionMeta,
    },
    {
        id: 'KT-20251204-04',
        label: 'Lần 4',
        time: '08:45',
        date: '12/4/2025',
        pondId: 'N06',
        note: 'Tôm ăn khỏe, gan sáng',
        meta: {
            foodAmount: '9',
            leftoverFood: 'Hết',
            liver: 'Bình thường',
            intestine: 'Đầy',
            stoolColor: 'Màu thức ăn',
            intestineColor: 'Màu thức ăn',
        } as ShrimpInspectionMeta,
    },
    {
        id: 'KT-20251205-05',
        label: 'Lần 5',
        time: '09:10',
        date: '12/5/2025',
        pondId: 'V01',
        note: 'Tôm vèo ăn yếu buổi sáng',
        meta: {
            foodAmount: '4',
            leftoverFood: '5–10%',
            liver: 'Bất thường',
            intestine: 'Rỗng',
            stoolColor: 'Bất thường',
            intestineColor: 'Bất thường',
        } as ShrimpInspectionMeta,
    },
];

/**
 * Mock data for JobExecution (MEASURE_SIZE jobs)
 * Based on real-world shrimp size measurement records
 */
export const mockMeasureSizeJobExecutions: JobExecution[] = [
    {
        id: 'SK-20251201-01',
        label: 'Lần 1',
        time: '09:00',
        date: '12/1/2025',
        pondId: 'N01',
        note: 'Tôm phát triển đều',
        meta: {
            shrimpSize: '85',
            remainingWeight: '2200',
            totalShrimpCount: 187000,
            survivalRate: 87,
        } as MeasureSizeMeta,
    },
    {
        id: 'SK-20251202-02',
        label: 'Lần 2',
        time: '09:30',
        date: '12/2/2025',
        pondId: 'N02',
        note: 'Tôm khỏe, phân rõ màu',
        meta: {
            shrimpSize: '90',
            remainingWeight: '2500',
            totalShrimpCount: 225000,
            survivalRate: 89,
        } as MeasureSizeMeta,
    },
    {
        id: 'SK-20251203-03',
        label: 'Lần 3',
        time: '10:00',
        date: '12/3/2025',
        pondId: 'N05',
        note: 'Tôm đều, gan sáng',
        meta: {
            shrimpSize: '80',
            remainingWeight: '1800',
            totalShrimpCount: 144000,
            survivalRate: 86,
        } as MeasureSizeMeta,
    },
    {
        id: 'SK-20251204-04',
        label: 'Lần 4',
        time: '09:20',
        date: '12/4/2025',
        pondId: 'N06',
        note: 'Tôm khỏe, phát triển tốt',
        meta: {
            shrimpSize: '75',
            remainingWeight: '2100',
            totalShrimpCount: 157500, // 75 con/kg * 2100 kg = 157500 con
            survivalRate: 88,
        } as MeasureSizeMeta,
    },
    {
        id: 'SK-20251205-05',
        label: 'Lần 5',
        time: '10:00',
        date: '12/5/2025',
        pondId: 'V01',
        note: 'Biomass thấp, ươm ổn định',
        meta: {
            shrimpSize: '600',
            remainingWeight: '90',
            totalShrimpCount: 54000,
            survivalRate: 92,
        } as MeasureSizeMeta,
    },
    {
        id: 'SK-20251206-06',
        label: 'Lần 6',
        time: '10:15',
        date: '12/6/2025',
        pondId: 'V02',
        note: 'Ăn tốt, chuẩn bị sang ao',
        meta: {
            shrimpSize: '550',
            remainingWeight: '120',
            totalShrimpCount: 66000,
            survivalRate: 91,
        } as MeasureSizeMeta,
    },
];

/**
 * Mock data for JobExecution (SIPHON jobs)
 * Based on real-world siphon/pond cleaning records
 */
export const mockSiphonJobExecutions: JobExecution[] = [
    {
        id: 'XP-20251201-01',
        label: 'Lần 1',
        time: '07:45',
        date: '1/12/2025',
        pondId: 'N01',
        note: 'Xi phông nhặt thức ăn thừa ở khu vực dàn quạt. Mô tả đáy ao: Thức ăn thừa nhiều',
        materials: [
            {
                material: { name: 'Zeolite' },
                quantity: 10,
                unit: 'kg',
            },
        ],
        meta: {
            lossAmount: '5',
            images: [],
        } as SiphonMeta,
    },
    {
        id: 'XP-20251203-01',
        label: 'Lần 1',
        time: '07:19',
        date: '3/12/2025',
        pondId: 'N03',
        note: 'Xi phông cải tạo đáy trước sang ao. Mô tả đáy ao: Bùn nhiều',
        materials: [
            {
                material: { name: 'HC01' },
                quantity: 5,
                unit: 'lít',
            },
        ],
        meta: {
            lossAmount: '3',
            images: [],
        } as SiphonMeta,
    },
    {
        id: 'XP-20251204-01',
        label: 'Lần 1',
        time: '07:30',
        date: '4/12/2025',
        pondId: 'N02',
        note: 'Xi phông xử lý mùi đáy ao. Mô tả đáy ao: Mùi nhẹ',
        materials: [
            {
                material: { name: 'Probiotics' },
                quantity: 3,
                unit: 'lít',
            },
        ],
        meta: {
            lossAmount: '2.5',
            images: [],
        } as SiphonMeta,
    },
    {
        id: 'XP-20251205-01',
        label: 'Lần 1',
        time: '07:40',
        date: '5/12/2025',
        pondId: 'N05',
        note: 'Xi phông kết hợp khoáng. Mô tả đáy ao: Đáy ao đen nhẹ',
        materials: [
            {
                material: { name: 'MineralMix' },
                quantity: 8,
                unit: 'kg',
            },
            {
                material: { name: 'Zeolite' },
                quantity: 5,
                unit: 'kg',
            },
        ],
        meta: {
            lossAmount: '4',
            images: [],
        } as SiphonMeta,
    },
    {
        id: 'XP-20251206-01',
        label: 'Lần 1',
        time: '07:50',
        date: '6/12/2025',
        pondId: 'V01',
        note: 'Xi phông định kỳ, không dùng vật tư',
        meta: {
            lossAmount: '1.2',
            images: [],
        } as SiphonMeta,
    },
    {
        id: 'XP-20251207-01',
        label: 'Lần 1',
        time: '07:35',
        date: '7/12/2025',
        pondId: 'V02',
        note: 'Xi phông nhẹ, kiểm tra lại quạt',
        meta: {
            lossAmount: '1.5',
            images: [],
        } as SiphonMeta,
    },
];

/**
 * Mock data for JobExecution (HANDLE_PROBLEM jobs)
 * Based on real-world problem/incident records
 */
export const mockHandleProblemJobExecutions: JobExecution[] = [
    {
        id: 'SC-20251201-01',
        label: 'Quạt nước hỏng',
        time: '08:00',
        date: '12/1/2025',
        pondId: 'N01',
        note: 'Quá 5/3 trong hoạt động lúc 19:00. Đã báo kỹ thuật sửa chữa',
        images: [],
    },
    {
        id: 'SC-20251202-02',
        label: 'pH giảm sau mưa',
        time: '11:00',
        date: '12/2/2025',
        pondId: 'N02',
        note: 'Đã xử lý bằng Zeolite 10kg',
        materials: [
            {
                material: { name: 'Zeolite' },
                quantity: 10,
                unit: 'kg',
            },
        ],
        images: [],
    },
    {
        id: 'SC-20251203-03',
        label: 'DO thấp buổi chiều',
        time: '16:30',
        date: '12/3/2025',
        pondId: 'N05',
        note: "Tăng quạt 60' sau khi đo DO 3.8 mg/l",
        images: [],
    },
    {
        id: 'SC-20251204-04',
        label: 'Tôm nổi đầu nhẹ',
        time: '09:15',
        date: '12/4/2025',
        pondId: 'V01',
        note: 'Kiểm tra lại oxy, bổ sung khoáng',
        materials: [
            {
                material: { name: 'MineralMix' },
                quantity: 5,
                unit: 'kg',
            },
        ],
        images: [],
    },
    {
        id: 'SC-20251205-05',
        label: 'Đáy ao có mùi',
        time: '07:50',
        date: '12/5/2025',
        pondId: 'N06',
        note: 'Xi phông kết hợp xử lý đáy bằng Probiotics',
        materials: [
            {
                material: { name: 'Probiotics' },
                quantity: 3,
                unit: 'lít',
            },
        ],
        images: [],
    },
];

/**
 * Mock data for JobExecution (WATER_SUPPLY jobs)
 * Based on real-world water supply/drain records
 */
export const mockWaterSupplyJobExecutions: JobExecution[] = [
    {
        id: 'WC-20251201-001',
        label: 'Lần 1',
        time: '09:45',
        date: '12/1/2025',
        pondId: 'N01',
        note: 'Bù nước sau thay định kỳ',
        materials: [
            {
                material: { name: 'Zeolite' },
                quantity: 15,
                unit: 'kg',
            },
            {
                material: { name: 'Chlorine 70% Granules' },
                quantity: 1.0,
                unit: 'kg',
            },
        ],
        meta: {
            targetLevel: '120',
            supplyLevel: '20',
            drainLevel: '100',
            volumeSupply: 480.0,
            volumeAfterSupply: 2880.0,
            volumeAfterDrain: 2400.0,
        } as WaterSupplyMeta,
    },
    {
        id: 'WC-20251202-002',
        label: 'Lần 1',
        time: '10:00',
        date: '12/2/2025',
        pondId: 'N02',
        note: 'Rút bùn đáy ao',
        meta: {
            targetLevel: '100',
            drainLevel: '85',
            volumeAfterDrain: 2040.0,
        } as WaterSupplyMeta,
    },
    {
        id: 'WC-20251203-003',
        label: 'Lần 1',
        time: '08:30',
        date: '12/3/2025',
        pondId: 'N05',
        note: 'Cấp nước sau xử lý đáy',
        materials: [
            {
                material: { name: 'Probiotics' },
                quantity: 5,
                unit: 'lít',
            },
        ],
        meta: {
            targetLevel: '130',
            supplyLevel: '25',
            drainLevel: '105',
            volumeSupply: 600.0,
            volumeAfterSupply: 3120.0,
            volumeAfterDrain: 2520.0,
        } as WaterSupplyMeta,
    },
    {
        id: 'WC-20251204-004',
        label: 'Lần 1',
        time: '09:00',
        date: '12/4/2025',
        pondId: 'V01',
        note: 'Cấp nhẹ sau xi-phông',
        materials: [
            {
                material: { name: 'MineralMix' },
                quantity: 4,
                unit: 'kg',
            },
        ],
        meta: {
            targetLevel: '110',
            supplyLevel: '10',
            drainLevel: '100',
            volumeSupply: 78.4,
            volumeAfterSupply: 862.4,
            volumeAfterDrain: 784.0,
        } as WaterSupplyMeta,
    },
    {
        id: 'WC-20251205-005',
        label: 'Lần 1',
        time: '09:15',
        date: '12/5/2025',
        pondId: 'N06',
        note: 'Thải nước sau mưa',
        meta: {
            targetLevel: '115',
            drainLevel: '97',
            volumeAfterDrain: 2328.0,
        } as WaterSupplyMeta,
    },
];

/**
 * Mock data for JobExecution (WATER_TREATMENT jobs)
 * Based on real-world water treatment records
 */
export const mockWaterTreatmentJobExecutions: JobExecution[] = [
    {
        id: 'XL-20251201-01',
        label: 'Lần 1',
        time: '10:30',
        date: '12/1/2025',
        pondId: 'N01',
        note: 'Bổ sung khoáng sau cấp nước',
        waterTreatmentType: 'Đánh khoáng',
        materials: [
            {
                material: { name: 'BIKAP CP' },
                quantity: 30,
                unit: 'kg',
            },
            {
                material: { name: 'Super Mineral – Mebifood' },
                quantity: 15,
                unit: 'kg',
            },
        ],
    },
    {
        id: 'XL-20251202-02',
        label: 'Lần 1',
        time: '11:45',
        date: '12/2/2025',
        pondId: 'N02',
        note: 'Ổn định vi sinh sau mưa',
        waterTreatmentType: 'Đánh vi sinh',
        materials: [
            {
                material: { name: 'Probiotics' },
                quantity: 3,
                unit: 'lít',
            },
        ],
    },
    {
        id: 'XL-20251203-03',
        label: 'Lần 1',
        time: '15:10',
        date: '12/3/2025',
        pondId: 'N05',
        note: 'Khử trùng nhẹ sau xi-phông',
        waterTreatmentType: 'Kiểm khuẩn',
        materials: [
            {
                material: { name: 'HC01' },
                quantity: 20,
                unit: 'lít',
            },
        ],
    },
    {
        id: 'XL-20251204-04',
        label: 'Lần 1',
        time: '09:20',
        date: '12/4/2025',
        pondId: 'V01',
        note: 'Tăng khoáng nhẹ cho ao vèo',
        waterTreatmentType: 'Đánh khoáng',
        materials: [
            {
                material: { name: 'MineralMix' },
                quantity: 8,
                unit: 'kg',
            },
        ],
    },
    {
        id: 'XL-20251205-05',
        label: 'Lần 1',
        time: '17:30',
        date: '12/5/2025',
        pondId: 'N06',
        note: 'Tăng cường vi sinh buổi chiều',
        waterTreatmentType: 'Đánh vi sinh',
        materials: [
            {
                material: { name: 'Probiotics' },
                quantity: 2,
                unit: 'lít',
            },
            {
                material: { name: 'Zeolite' },
                quantity: 10,
                unit: 'kg',
            },
        ],
    },
    {
        id: 'XL-20251206-06',
        label: 'Lần 2',
        time: '07:00',
        date: '12/6/2025',
        pondId: 'N01',
        note: "Không dùng vật tư, chạy quạt + sục khí 90'",
        waterTreatmentType: 'Tăng sục khí',
    },
];

/**
 * Mock data for JobExecution (TRANSFER jobs)
 * Based on real-world transfer/pond transfer records
 */
export const mockTransferJobExecutions: JobExecution[] = [
    {
        id: 'SA-2025-010',
        label: 'Lần 1',
        time: '08:00', // Default time since not provided
        date: '12/22/2025',
        pondId: 'V01', // Primary source pond
        note: 'Sang hết - Vụ nuôi VH2025-A',
        meta: {
            shrimpSize: '60',
            transferMethod: 'Sang hết',
            receivingPonds: [
                {
                    id: '1',
                    receivingPond: 'N01',
                    quantity: '360000',
                },
                {
                    id: '2',
                    receivingPond: 'N02',
                    quantity: '360000',
                },
            ],
        } as TransferMeta,
    },
    {
        id: 'SA-2025-011',
        label: 'Lần 1',
        time: '08:00',
        date: '12/28/2025',
        pondId: 'V01',
        note: 'Sang hết - Vụ nuôi VH2025-A',
        meta: {
            shrimpSize: '70',
            transferMethod: 'Sang hết',
            receivingPonds: [
                {
                    id: '1',
                    receivingPond: 'N03',
                    quantity: '150000',
                },
                {
                    id: '2',
                    receivingPond: 'N04',
                    quantity: '150000',
                },
            ],
        } as TransferMeta,
    },
    {
        id: 'SA-2025-012',
        label: 'Lần 1',
        time: '08:00',
        date: '1/5/2026',
        pondId: 'V02', // Primary source pond (V02,V03)
        note: 'Sang hết - Vụ nuôi VH2025-B',
        meta: {
            shrimpSize: '80',
            transferMethod: 'Sang hết',
            receivingPonds: [
                {
                    id: '1',
                    receivingPond: 'N05',
                    quantity: '250000',
                },
                {
                    id: '2',
                    receivingPond: 'N06',
                    quantity: '250000',
                },
            ],
        } as TransferMeta,
    },
];

/**
 * Mock data for JobExecution (HARVEST jobs)
 * Based on real-world harvest records
 * Includes both full harvest (Thu hết) and partial harvest (Thu tỉa)
 */
export const mockHarvestJobExecutions: JobExecution[] = [
    // Thu hết (Full harvest)
    {
        id: 'TH-2025-001',
        label: 'Lần 1',
        time: '08:00', // Default time since not provided
        date: '3/10/2025',
        pondId: 'N07',
        note: 'Tôm đều, gan sáng',
        meta: {
            harvestType: 'Thu hết',
            shrimpSize: '65',
            yieldAmount: '18000',
            referencePrice: '120000',
            revenue: 2160000000,
        } as HarvestMeta,
    },
    {
        id: 'TH-2025-002',
        label: 'Lần 1',
        time: '08:00',
        date: '3/20/2025',
        pondId: 'N08',
        note: 'Tôm khỏe, màu đẹp',
        meta: {
            harvestType: 'Thu hết',
            shrimpSize: '70',
            yieldAmount: '20000',
            referencePrice: '115000',
            revenue: 2300000000,
        } as HarvestMeta,
    },
    // Thu tỉa (Partial harvest)
    {
        id: 'TT-2025-001',
        label: 'Lần 1',
        time: '08:00',
        date: '2/15/2026',
        pondId: 'N01',
        note: 'Thu tỉa để giảm mật độ',
        meta: {
            harvestType: 'Thu tỉa',
            shrimpSize: '90',
            yieldAmount: '5000',
            referencePrice: '110000',
            revenue: 550000000,
        } as HarvestMeta,
    },
    {
        id: 'TT-2025-002',
        label: 'Lần 1',
        time: '08:00',
        date: '2/25/2026',
        pondId: 'N05',
        note: 'Thu tỉa do giá thị trường',
        meta: {
            harvestType: 'Thu tỉa',
            shrimpSize: '85',
            yieldAmount: '4500',
            referencePrice: '108000',
            revenue: 486000000,
        } as HarvestMeta,
    },
];
