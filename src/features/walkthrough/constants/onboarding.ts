/**
 * Configuration for a single onboarding step.
 */
export interface OnboardingStepConfig {
    /** Module this step belongs to */
    module: 'farm' | 'material' | 'account' | 'report';
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

    // ======================================
    // ACCOUNT MODULE
    // ======================================
    ACCOUNT_MENU_CYCLE: {
        module: 'account',
        stepIndex: 0,
        title: 'Quản lý Vụ nuôi',
        description:
            'Đây là nơi tạo và quản lý báo cáo tổng thể của các Mùa Vụ. Bấm Tiếp tục để đi vào màn hình này.',
        placement: 'bottom',
    },
    ACCOUNT_CYCLE_TABS: {
        module: 'account',
        stepIndex: 1,
        title: 'Lọc theo trạng thái vụ nuôi',
        description:
            'Bạn có thể theo dõi nhanh các vụ nuôi đang chuẩn bị, đang nuôi, hoặc đã kết thúc tại thanh Tabs này.',
        placement: 'bottom',
    },
    ACCOUNT_CYCLE_ADD: {
        module: 'account',
        stepIndex: 2,
        title: 'Thêm Vụ Nuôi',
        description:
            'Bấm vào dấu + này để tạo thêm Vụ Nuôi mới cho trại của bạn. Bấm Tiếp tục để quay lại Menu Tài Khoản.',
        placement: 'bottom',
    },
    ACCOUNT_MENU_ENV: {
        module: 'account',
        stepIndex: 3,
        title: 'Thiết lập thông số môi trường',
        description:
            'Mỗi trại cần một quy chuẩn môi trường khác nhau. Bấm Tiếp tục để vào cấu hình cảnh báo và lịch đo.',
        placement: 'bottom',
    },
    ACCOUNT_ENV_SETTING_TOGGLE: {
        module: 'account',
        stepIndex: 4,
        title: 'Bật/Tắt thông số',
        description:
            'Tích chọn vào ô này để kích hoạt hộp kiểm. Khi kích hoạt, thông số này sẽ xuất hiện trong màn hình đo môi trường hàng ngày.',
        placement: 'bottom',
    },
    ACCOUNT_ENV_SETTING_EDIT: {
        module: 'account',
        stepIndex: 5,
        title: 'Điều chỉnh giới hạn an toàn',
        description:
            'Bấm vào nút hình cây bút để thay đổi các thông số ngưỡng an toàn của chỉ số này. Bấm tiếp tục để về trang Menu.',
        placement: 'left',
    },
    ACCOUNT_MENU_MEMBER: {
        module: 'account',
        stepIndex: 6,
        title: 'Quản lý thành viên',
        description:
            'Nơi cấp quyền và quản lý danh sách các thành viên cùng tham gia vận hành và theo dõi trại nuôi của bạn.',
        placement: 'top',
    },
    ACCOUNT_MEMBER_FILTER: {
        module: 'account',
        stepIndex: 7,
        title: 'Công cụ tra cứu',
        description:
            'Bạn có thể tìm kiếm thành viên theo tên/số điện thoại hoặc lọc danh sách theo chức vụ một cách nhanh chóng.',
        placement: 'bottom',
    },
    ACCOUNT_MEMBER_ACTION: {
        module: 'account',
        stepIndex: 8,
        title: 'Tùy chỉnh thành viên',
        description:
            'Bấm vào biểu tượng 3 chấm ở mỗi thành viên để tiến hành chỉnh sửa vai trò hoặc xóa/xóa tạm thời khỏi hệ thống.',
        placement: 'left',
    },
    ACCOUNT_MEMBER_ADD: {
        module: 'account',
        stepIndex: 9,
        title: 'Thêm thành viên mới',
        description:
            'Bấm dấu + góc phải màn hình để mời thêm nhân viên hoặc người quản lý khác. Xin chúc mừng bạn đã hoàn tất hướng dẫn!',
        placement: 'bottom',
        isLastStep: true,
    },

    // ======================================
    // REPORT MODULE
    // ======================================
    REPORT_NOTIFICATION: {
        module: 'report',
        stepIndex: 0,
        title: 'Trung tâm thông báo',
        description:
            'Nơi cập nhật các cảnh báo môi trường, nhắc nhở công việc và tin tức quan trọng từ hệ thống.',
        placement: 'bottom',
    },
    REPORT_FARM_SELECT: {
        module: 'report',
        stepIndex: 1,
        title: 'Chọn trại nuôi',
        description: 'Chạm vào đây để chuyển đổi qua lại giữa các trại nuôi khác nhau của bạn.',
        placement: 'bottom',
    },
    REPORT_FILTER: {
        module: 'report',
        stepIndex: 2,
        title: 'Bộ lọc Báo cáo',
        description:
            'Nơi này cho phép bạn thay đổi góc nhìn báo cáo theo từng ao cụ thể và theo từng mùa vụ khác nhau.',
        placement: 'bottom',
    },
    REPORT_CHART_ENV: {
        module: 'report',
        stepIndex: 3,
        title: 'Biểu đồ Môi trường',
        description:
            'Theo dõi sự biến động của các chỉ số thiết yếu trong nước (pH, Oxy, Độ mặn...) giúp phát hiện sớm rủi ro.',
        placement: 'bottom',
    },
    REPORT_CHART_PROD: {
        module: 'report',
        stepIndex: 4,
        title: 'Thống kê Sản lượng',
        description:
            'Biểu đồ này ước tính sản lượng tôm và tỉ lệ sống sót qua các giai đoạn, giúp bạn bao quát toàn bộ tài sản. Chúc mừng bạn đã hoàn tất phần Báo cáo!',
        placement: 'top',
        isLastStep: true,
    },
} as const satisfies Record<string, OnboardingStepConfig>;

/** Type-safe step key */
export type AppStepKey = keyof typeof APP_STEPS;
