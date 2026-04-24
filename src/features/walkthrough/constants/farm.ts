import { OnboardingStepConfig } from '../types/walkthrough.types';

export const FARM_STEPS = {
    FARM_SELECTOR: {
        module: 'farm',
        stepIndex: 0,
        title: 'Quản lý Trại Nuôi',
        description: 'Bấm vào đây để chọn Trại có sẵn hoặc Thêm Trại mới.',
        placement: 'bottom',
        allowInteraction: true,
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
        allowInteraction: true,
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
        allowInteraction: true,
    },
    MATERIAL_SELECTION: {
        module: 'farm',
        stepIndex: 6,
        title: 'Quản lý Gói vật tư',
        description:
            "Bấm '+ Thêm vật tư' để chọn loại thức ăn. Bạn có thể thay đổi số lượng, hoặc nhấn nút Xóa bên cạnh vật tư để gỡ bỏ.",
        placement: 'bottom',
        allowInteraction: true,
    },
    SAVE_BUTTON: {
        module: 'farm',
        stepIndex: 7,
        title: 'Thêm - Xoá - Sửa',
        description:
            "Sau khi điền đủ thông tin, bạn bấm 'Lưu thông tin' để thêm lịch sử. Lưu ý: Nếu bạn chọn Sửa một bản ghi có sẵn, nút hình Thùng Rác (Xóa) sẽ xuất hiện ở góc trên phải màn hình!",
        placement: 'top',
    },
    TRANSFER_POND_JOB: {
        module: 'farm',
        stepIndex: 8,
        title: 'Sang ao',
        description:
            "Tính năng Sang ao cho phép bạn chuyển tôm từ ao này sang ao khác. Bấm 'Tiếp tục' để xem cách ghi nhận phiếu sang ao.",
        placement: 'top',
        allowInteraction: true,
    },
    TRANSFER_CURRENT_POND_INFO: {
        module: 'farm',
        stepIndex: 9,
        title: 'Thông tin ao hiện tại',
        description:
            'Cỡ tôm và Tổng tôm dự kiến được tự động lấy từ Lần đo kích thước tôm gần nhất. Bạn có thể sửa lại nếu thấy chưa chính xác.',
        placement: 'bottom',
    },
    TRANSFER_FORM_INFO: {
        module: 'farm',
        stepIndex: 10,
        title: 'Thông tin Sang ao',
        description: 'Tại đây bạn có thể chọn ao đích và chỉ định lượng tôm chuyển sang.',
        placement: 'top',
    },
    TRANSFER_FORM_SAVE: {
        module: 'farm',
        stepIndex: 11,
        title: 'Lưu thông tin Sang ao',
        description: 'Sau khi điền xong, bấm "Lưu thông tin". Chúc mừng bạn đã hoàn tất hướng dẫn!',
        placement: 'top',
        isLastStep: true,
    },
} as const satisfies Record<string, OnboardingStepConfig>;
