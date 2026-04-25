import { OnboardingStepConfig } from '../types/walkthrough.types';

export const ACCOUNT_STEPS = {
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
        allowInteraction: true,
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
        allowInteraction: true,
    },
} as const satisfies Record<string, OnboardingStepConfig>;
