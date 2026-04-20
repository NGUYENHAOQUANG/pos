/**
 * Configuration for a single onboarding step.
 */
export interface OnboardingStepConfig {
    /** Module this step belongs to */
    module: 'farm' | 'material' | 'account';
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

type RawStepConfig = Omit<OnboardingStepConfig, 'stepIndex'>;

/**
 * All Application onboarding steps WITHOUT hardcoded stepIndex.
 * Just add your step in the correct visual order for its module.
 * The system will automatically compute its stepIndex based on its position.
 */
const RAW_STEPS = {
    // ======================================
    // FARM MODULE
    // ======================================
    FARM_SELECTOR: {
        module: 'farm',
        title: 'Quản lý Trại Nuôi',
        description: 'Bấm vào đây để chọn Trại có sẵn hoặc Thêm Trại mới.',
        placement: 'bottom',
    },
    STATUS_TABS: {
        module: 'farm',
        title: 'Lọc trạng thái Ao',
        description:
            'Bạn có thể chuyển đổi giữa các tab để xem tất cả Ao, hoặc lọc theo Ao đang hoạt động, Ao đang chuẩn bị.',
        placement: 'bottom',
    },
    POND_CARD: {
        module: 'farm',
        title: 'Thông tin chi tiết Ao',
        description: "Danh sách các ao của bạn. Bấm 'Tiếp tục' để tìm hiểu cách xem chi tiết Ao.",
        placement: 'bottom',
    },
    VIEW_DETAIL: {
        module: 'farm',
        title: 'Xem chi tiết Ao',
        description: 'Bấm tiếp tục để đi vào màn hình quản lý chi tiết bên trong ao này.',
        placement: 'top',
    },
    CYCLE_INFO: {
        module: 'farm',
        title: 'Chi tiết chu kỳ nuôi',
        description:
            "Theo dõi ngày thu hoạch, lượng giống và DOC ở đây. Bấm 'Tiếp tục' để xem cách cho ăn và thêm công việc.",
        placement: 'bottom',
    },
    FEEDING_JOB: {
        module: 'farm',
        title: 'Ghi nhật ký Cho ăn',
        description: "Bấm 'Tiếp tục' để màn hình tự động mở bảng Thêm mới thức ăn.",
        placement: 'bottom',
    },
    MATERIAL_SELECTION: {
        module: 'farm',
        title: 'Quản lý Gói vật tư',
        description:
            "Bấm '+ Thêm vật tư' để chọn loại thức ăn. Bạn có thể thay đổi số lượng, hoặc nhấn nút Xóa bên cạnh vật tư để gỡ bỏ.",
        placement: 'bottom',
    },
    SAVE_BUTTON: {
        module: 'farm',
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
        title: 'Kho Của Trại',
        description: 'Bấm vào đây để xem kho vật tư đang được áp dụng cho Trại nào.',
        placement: 'bottom',
    },
    MATERIAL_MAIN_TABS: {
        module: 'material',
        title: 'Thanh Điều Hướng',
        description:
            'Chuyển đổi linh hoạt giữa Danh mục tổng, Lượng Tồn Kho thực tế, và Lịch sử Giao dịch (Nhập/Xuất/Kiểm kê).',
        placement: 'bottom',
    },
    MATERIAL_SEARCH: {
        module: 'material',
        title: 'Tìm Kiếm & Bộ Lọc',
        description:
            'Bạn có thể tìm nhanh tên vật tư hoặc dùng các nút Lọc để xem theo nhóm hoặc trạng thái giao dịch.',
        placement: 'bottom',
    },
    MATERIAL_ADD_BTN: {
        module: 'material',
        title: 'Thao Tác Nhanh',
        description:
            'Bấm biểu tượng dấu + để mở menu: Tạo vật tư mới, Nhập/Xuất kho hoặc Kiểm kê. Chúc mừng bạn đã hoàn tất hướng dẫn kho!',
        placement: 'bottom',
        isLastStep: true,
    },

    // ======================================
    // ACCOUNT MODULE
    // ======================================
    ACCOUNT_PROFILE: {
        module: 'account',
        title: 'Hồ Sơ Của Bạn',
        description:
            'Bấm vào đây để xem hoặc sửa tên, ảnh đại diện và chức vụ của bạn trên ứng dụng.',
        placement: 'bottom',
    },
    ACCOUNT_CYCLE: {
        module: 'account',
        title: 'Quản Lý Vụ Nuôi',
        description:
            'Bấm vào đây để xem danh sách các vụ nuôi trong trại. Bạn có thể tạo vụ mới hoặc theo dõi vụ đang chạy.',
        placement: 'bottom',
    },
    AQUA_TABS: {
        module: 'account',
        title: 'Lọc Theo Trạng Thái',
        description:
            'Chuyển đổi giữa các tab để xem vụ nuôi theo trạng thái: Tất cả, Chuẩn bị, Đang nuôi, Đã kết thúc.',
        placement: 'bottom',
    },
    AQUA_ZONE_SELECTOR: {
        module: 'account',
        title: 'Chọn Trại',
        description: 'Chọn trại nuôi từ danh sách để xem các vụ nuôi thuộc trại đó.',
        placement: 'bottom',
    },
    AQUA_ADD_BUTTON: {
        module: 'account',
        title: 'Thêm Vụ Nuôi Mới',
        description: 'Bấm nút + để tạo vụ nuôi mới cho trại bạn đang chọn.',
        placement: 'bottom',
    },
    ACCOUNT_ENVIRONMENT: {
        module: 'account',
        title: 'Cài Đặt Môi Trường',
        description:
            'Bấm vào đây để thiết lập các ngưỡng an toàn cho pH, oxy, nhiệt độ... Bấm Tiếp tục để xem chi tiết.',
        placement: 'bottom',
    },
    ENV_DEFAULT_GROUP: {
        module: 'account',
        title: 'Nhóm Mặc Định',
        description:
            'Đây là bộ thông số chuẩn (pH, DO, Nhiệt độ...). Bấm checkbox để bật/tắt và biểu tượng bút chì để chỉnh giới hạn.',
        placement: 'bottom',
    },
    ENV_CHECKBOX_BUTTON: {
        module: 'account',
        title: 'Bật / Tắt Theo Dõi',
        description:
            'Bấm vào ô vuông này để chọn theo dõi thông số, hệ thống sẽ thêm nó vào danh sách khi bạn nhập sổ nhật ký.',
        placement: 'right',
    },
    ENV_EDIT_BUTTON: {
        module: 'account',
        title: 'Chỉnh Sửa Giới Hạn',
        description:
            'Bấm vào biểu tượng bút chì này để đặt ngưỡng an toàn cho từng thông số. Hệ thống sẽ cảnh báo nếu chỉ số đo vượt ngưỡng.',
        placement: 'left',
    },
    ENV_ADVANCED_GROUP: {
        module: 'account',
        title: 'Nhóm Nâng Cao',
        description:
            'Bộ thông số mở rộng để theo dõi chi tiết hơn. Bạn có thể bật thêm tuỳ nhu cầu.',
        placement: 'top',
    },
    ENV_SAVE_BUTTON: {
        module: 'account',
        title: 'Lưu Thiết Lập',
        description:
            'Sau khi chỉnh sửa xong, bấm "Lưu thông tin" để áp dụng. Hoặc bấm "Thiết lập lại" để huỷ thay đổi.',
        placement: 'top',
    },
    ACCOUNT_SHRIMP_PRICE: {
        module: 'account',
        title: 'Tin Tức & Giá Tôm',
        description:
            'Xem giá tôm hôm nay và đọc tin tức thị trường để quyết định thời điểm bán hàng tốt nhất.',
        placement: 'bottom',
    },
    ACCOUNT_WEATHER: {
        module: 'account',
        title: 'Dự Báo Thời Tiết',
        description:
            'Xem trước thời tiết các ngày tới để chủ động trong việc chăm sóc tôm và sử dụng thiết bị.',
        placement: 'bottom',
    },
    ACCOUNT_PERSONAL_INFO: {
        module: 'account',
        title: 'Thông Tin Cá Nhân',
        description: 'Chỉnh sửa số điện thoại, email hoặc mật khẩu đăng nhập của bạn tại đây.',
        placement: 'bottom',
    },
    ACCOUNT_MEMBERS: {
        module: 'account',
        title: 'Quản Lý Thành Viên',
        description:
            'Xem danh sách nhân viên đang làm chung trại. Bạn có thể thêm người mới hoặc phân quyền cho từng người.',
        placement: 'bottom',
    },
    ACCOUNT_SETTINGS: {
        module: 'account',
        title: 'Cài Đặt Ứng Dụng',
        description:
            'Thay đổi giao diện sáng/tối, bật/tắt thông báo, hoặc cấu hình các tuỳ chọn khác của ứng dụng.',
        placement: 'bottom',
    },
    ACCOUNT_PRIVACY: {
        module: 'account',
        title: 'Chính Sách Bảo Mật',
        description: 'Xem các cam kết bảo mật thông tin và dữ liệu của bạn trên hệ thống MebiEco.',
        placement: 'bottom',
    },
    ACCOUNT_TERMS: {
        module: 'account',
        title: 'Điều Khoản Điều Kiện',
        description: 'Đọc các điều khoản và quy định dành cho người dùng khi sử dụng phần mềm.',
        placement: 'bottom',
    },
    ACCOUNT_DELETE_ACCOUNT: {
        module: 'account',
        title: 'Xóa Tài Khoản',
        description: 'Yêu cầu xóa toàn bộ dữ liệu và tài khoản của bạn khỏi hệ thống vĩnh viễn.',
        placement: 'top',
    },
    ACCOUNT_LOGOUT: {
        module: 'account',
        title: 'Đăng Xuất',
        description:
            'Khi cần chuyển máy cho người khác hoặc nghỉ ngơi, bấm đây để đăng xuất an toàn. Chúc mừng bạn đã hoàn tất hướng dẫn!',
        placement: 'top',
        isLastStep: true,
    },
} as const satisfies Record<string, RawStepConfig>;

/** Type-safe step key */
export type AppStepKey = keyof typeof RAW_STEPS;

/**
 * Built application steps.
 * Automatically computes `stepIndex` safely based on insertion order and module.
 */
export const APP_STEPS: Record<AppStepKey, OnboardingStepConfig> = {} as any;

let farmIdx = 0;
let materialIdx = 0;
let accountIdx = 0;

for (const key of Object.keys(RAW_STEPS) as AppStepKey[]) {
    const raw = RAW_STEPS[key];
    let idx = 0;

    if (raw.module === 'farm') idx = farmIdx++;
    else if (raw.module === 'material') idx = materialIdx++;
    else if (raw.module === 'account') idx = accountIdx++;

    APP_STEPS[key] = {
        ...raw,
        stepIndex: idx,
    };
}
