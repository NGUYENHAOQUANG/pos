/**
 * Configuration for a single onboarding step.
 */
export interface OnboardingStepConfig {
    /** Module this step belongs to */
    module: 'farm' | 'material';
    /** Numeric index used by the store to track progress */
    stepIndex: number;
    /** Tooltip title */
    title: string;
    /** Tooltip description */
    description: string;
    /** Tooltip placement relative to the target */
    placement: 'top' | 'bottom' | 'left' | 'right';
    /** Whether this is the final step (shows "Hoàn thành" instead of "Tiếp tục") */
    isLastStep?: boolean;
}

/**
 * All Application onboarding steps.
 * This is the ONLY file you need to edit when adding, removing, or reordering steps.
 */
export const APP_STEPS = {
    // ======================================
    // FARM MODULE
    // ======================================
    FARM_SELECTOR: {
        module: 'farm',
        stepIndex: 0,
        title: 'Quản lý Trại Nuôi',
        description: 'Bấm vào đây để chọn Trại có sẵn hoặc Thêm Trại mới.',
        placement: 'bottom',
    },
    STATUS_TABS: {
        module: 'farm',
        stepIndex: 1,
        title: 'Lọc trạng thái Ao',
        description:
            'Bạn có thể chuyển đổi giữa các tab để xem tất cả Ao, hoặc lọc theo Ao đang hoạt động, Ao đang chuẩn bị.',
        placement: 'bottom',
    },
    POND_CARD: {
        module: 'farm',
        stepIndex: 2,
        title: 'Thông tin chi tiết Ao',
        description: "Danh sách các ao của bạn. Bấm 'Tiếp tục' để tìm hiểu cách xem chi tiết Ao.",
        placement: 'bottom',
    },
    VIEW_DETAIL: {
        module: 'farm',
        stepIndex: 3,
        title: 'Xem chi tiết Ao',
        description: 'Bấm tiếp tục để đi vào màn hình quản lý chi tiết bên trong ao này.',
        placement: 'top',
    },
    CYCLE_INFO: {
        module: 'farm',
        stepIndex: 4,
        title: 'Chi tiết chu kỳ nuôi',
        description:
            "Theo dõi ngày thu hoạch, lượng giống và DOC ở đây. Bấm 'Tiếp tục' để xem cách cho ăn và thêm công việc.",
        placement: 'bottom',
    },
    FEEDING_JOB: {
        module: 'farm',
        stepIndex: 5,
        title: 'Ghi nhật ký Cho ăn',
        description: "Bấm 'Tiếp tục' để màn hình tự động mở bảng Thêm mới thức ăn.",
        placement: 'bottom',
    },
    MATERIAL_SELECTION: {
        module: 'farm',
        stepIndex: 6,
        title: 'Quản lý Gói vật tư',
        description:
            "Bấm '+ Thêm vật tư' để chọn loại thức ăn. Bạn có thể thay đổi số lượng, hoặc nhấn nút Xóa bên cạnh vật tư để gỡ bỏ.",
        placement: 'bottom',
    },
    SAVE_BUTTON: {
        module: 'farm',
        stepIndex: 7,
        title: 'Thêm - Xoá - Sửa',
        description:
            "Sau khi điền đủ thông tin, bạn bấm 'Lưu thông tin' để thêm lịch sử. Lưu ý: Nếu bạn chọn Sửa một bản ghi có sẵn, nút hình Thùng Rác (Xóa) sẽ xuất hiện ở góc trên phải màn hình! Chúc mừng bạn đã hoàn tất hướng dẫn.",
        placement: 'top',
        isLastStep: true,
    },

    // ======================================
    // MATERIAL MODULE
    // ======================================
    MATERIAL_SELECTOR: {
        module: 'material',
        stepIndex: 0,
        title: 'Kho Của Trại',
        description: 'Bấm vào đây để xem kho vật tư đang được áp dụng cho Trại nào.',
        placement: 'bottom',
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
    },
} as const satisfies Record<string, OnboardingStepConfig>;

/** Type-safe step key */
export type AppStepKey = keyof typeof APP_STEPS;
