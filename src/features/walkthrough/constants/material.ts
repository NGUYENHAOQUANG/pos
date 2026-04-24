import { OnboardingStepConfig } from '../types/walkthrough.types';

export const MATERIAL_STEPS = {
    MATERIAL_SELECTOR: {
        module: 'material',
        stepIndex: 0,
        title: 'Kho Của Trại',
        description: 'Bấm vào đây để xem kho vật tư đang được áp dụng cho Trại nào.',
        placement: 'bottom',
        allowInteraction: true,
    },
    MATERIAL_MAIN_TABS: {
        module: 'material',
        stepIndex: 1,
        title: 'Thanh Điều Hướng',
        description:
            'Chuyển đổi linh hoạt giữa Danh mục tổng, Lượng Tồn Kho thực tế, và Lịch sử Giao dịch (Nhập/Xuất/Kiểm kê).',
        placement: 'bottom',
    },
    MATERIAL_SEARCH: {
        module: 'material',
        stepIndex: 2,
        title: 'Tìm Kiếm & Bộ Lọc',
        description:
            'Bạn có thể tìm nhanh tên vật tư hoặc dùng các nút Lọc để xem theo nhóm hoặc trạng thái giao dịch.',
        placement: 'bottom',
    },
    MATERIAL_ADD_BTN: {
        module: 'material',
        stepIndex: 3,
        title: 'Thao Tác Nhanh',
        description:
            'Bấm biểu tượng dấu + để mở menu: Tạo vật tư mới, Nhập/Xuất kho hoặc Kiểm kê. Chúc mừng bạn đã hoàn tất hướng dẫn kho!',
        placement: 'bottom',
        isLastStep: true,
        allowInteraction: true,
    },
} as const satisfies Record<string, OnboardingStepConfig>;
