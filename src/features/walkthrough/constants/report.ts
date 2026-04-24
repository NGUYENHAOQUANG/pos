import { OnboardingStepConfig } from '../types/walkthrough.types';

export const REPORT_STEPS = {
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
