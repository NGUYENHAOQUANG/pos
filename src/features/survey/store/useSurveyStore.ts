import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { SurveyState, SurveyQuestion } from '../types/survey.types';

const Q1: SurveyQuestion = {
    id: 'q1',
    type: 'single_choice',
    question: 'Bạn đang ở giai đoạn nào trong hành trình nuôi tôm?',
    options: [
        { label: 'Đang có ao và đang nuôi tôm', value: 'a_active' },
        { label: 'Đã từng nuôi nhưng hiện tạm ngưng', value: 'a_paused' },
        { label: 'Chưa nuôi — đang lên kế hoạch', value: 'b_planning' },
        { label: 'Chưa nuôi — đang tìm hiểu thông tin', value: 'b_learning' },
    ],
};

const BRANCH_A: SurveyQuestion[] = [
    {
        id: 'A2',
        type: 'number_slider',
        question: 'Ao nuôi của bạn có quy mô khoảng bao nhiêu ao?',
        min: 1,
        max: 20,
        unit: 'ao',
    },
    {
        id: 'A3',
        type: 'multi_select',
        question: 'Bạn đang nuôi loại tôm nào? (chọn nhiều)',
        options: [
            { label: 'Tôm thẻ chân trắng', value: 'the' },
            { label: 'Tôm sú', value: 'su' },
            { label: 'Tôm càng xanh', value: 'cang_xanh' },
            { label: 'Loại tôm khác', value: 'khac' },
        ],
    },
    {
        id: 'A4',
        type: 'single_choice',
        question: 'Bạn đã nuôi tôm được bao lâu?',
        options: [
            { label: 'Dưới 1 năm', value: '<1' },
            { label: '1 – 3 năm', value: '1-3' },
            { label: '3 – 7 năm', value: '3-7' },
            { label: 'Trên 7 năm', value: '>7' },
        ],
    },
    {
        id: 'A5',
        type: 'multi_select',
        question: 'Khó khăn lớn nhất bạn đang gặp phải? (tối đa 3)',
        maxSelections: 3,
        options: [
            { label: 'Theo dõi chất lượng nước', value: 'nuoc' },
            { label: 'Phát hiện & xử lý dịch bệnh', value: 'benh' },
            { label: 'Chi phí thức ăn & vật tư tăng cao', value: 'chi_phi' },
            { label: 'Thiếu lao động kỹ thuật', value: 'lao_dong' },
            { label: 'Tìm đầu ra, giá bán bấp bênh', value: 'gia_ban' },
            { label: 'Ghi chép nhật ký ao thủ công', value: 'ghi_chep' },
        ],
    },
    {
        id: 'A6',
        type: 'single_choice',
        question: 'Hiện bạn đang dùng công cụ gì để quản lý ao nuôi?',
        options: [
            { label: 'Ghi tay / sổ nhật ký giấy', value: 'giay' },
            { label: 'Excel / Google Sheets', value: 'excel' },
            { label: 'Ứng dụng di động khác', value: 'app_khac' },
            { label: 'Chưa dùng công cụ gì', value: 'chua_dung' },
        ],
    },
    {
        id: 'A7',
        type: 'multi_select',
        question: 'Tính năng nào trong Mebieco bạn cảm thấy hữu ích nhất?',
        options: [
            { label: 'Cảnh báo dịch bệnh sớm bằng AI', value: 'ai' },
            { label: 'Giám sát chất lượng nước tự động', value: 'giam_sat' },
            { label: 'Nhật ký ao thông minh & lịch cho ăn', value: 'nhat_ky' },
            { label: 'Báo cáo hiệu quả & chi phí vụ nuôi', value: 'bao_cao' },
            { label: 'Kết nối mua bán với thương lái', value: 'thuong_lai' },
        ],
    },
    {
        id: 'A8',
        type: 'contact_info',
        question: 'Thông tin liên hệ',
        suggestion: 'Mebieco sẽ tư vấn và hỗ trợ kỹ thuật cho bạn',
    },
];

const BRANCH_B: SurveyQuestion[] = [
    {
        id: 'B2',
        type: 'single_choice',
        question: 'Điều gì khiến bạn quan tâm đến nghề nuôi tôm?',
        options: [
            { label: 'Muốn khởi nghiệp, tạo nguồn thu nhập chính', value: 'khoi_nghiep' },
            { label: 'Tìm thêm thu nhập bên cạnh công việc hiện tại', value: 'them_thu_nhap' },
            { label: 'Kế thừa hoặc mở rộng trang trại gia đình', value: 'ke_thua' },
            { label: 'Đang nghiên cứu thị trường, chưa quyết định', value: 'nghien_cuu' },
        ],
    },
    {
        id: 'B3',
        type: 'multi_select',
        question: 'Điều gì đang khiến bạn chưa bắt đầu? (chọn nhiều)',
        options: [
            { label: 'Thiếu vốn đầu tư ban đầu', value: 'thieu_von' },
            { label: 'Thiếu kiến thức kỹ thuật nuôi tôm', value: 'thieu_kt' },
            { label: 'Chưa có đất hoặc mặt bằng ao', value: 'thieu_dat' },
            { label: 'Lo ngại rủi ro giá cả, thị trường', value: 'lo_rui_ro' },
            { label: 'Chưa tìm được người hướng dẫn kinh nghiệm', value: 'thieu_nguoi_hd' },
        ],
    },
    {
        id: 'B4',
        type: 'single_choice',
        question: 'Bạn dự kiến có thể đầu tư khoảng bao nhiêu vốn ban đầu?',
        options: [
            { label: 'Dưới 100 triệu đồng', value: '<100' },
            { label: '100 – 500 triệu đồng', value: '100-500' },
            { label: '500 triệu – 1 tỷ đồng', value: '500-1B' },
            { label: 'Trên 1 tỷ đồng', value: '>1B' },
        ],
    },
    {
        id: 'B5',
        type: 'single_choice',
        question: 'Bạn dự kiến bắt đầu nuôi tôm trong bao lâu nữa?',
        options: [
            { label: 'Trong 3 tháng tới', value: '<3m' },
            { label: '3 – 6 tháng tới', value: '3-6m' },
            { label: '6 – 12 tháng tới', value: '6-12m' },
            { label: 'Chưa xác định được', value: 'chua_ro' },
        ],
    },
    {
        id: 'B6',
        type: 'multi_select',
        question: 'Nhu cầu hỗ trợ từ Mebieco',
        options: [
            { label: 'Cung cấp tài liệu kỹ thuật', value: 'tai_lieu' },
            { label: 'Tư vấn lập kế hoạch đầu tư', value: 'tu_van' },
            { label: 'Giới thiệu mô hình nuôi', value: 'mo_hinh' },
            { label: 'Kết nối chuyên gia', value: 'chuyen_gia' },
        ],
    },
    {
        id: 'B7',
        type: 'single_choice',
        question: 'Nguồn tìm kiếm thông tin hiện tại',
        options: [
            { label: 'YouTube / mạng xã hội (Facebook, TikTok)', value: 'mxh' },
            { label: 'Báo chí chuyên ngành', value: 'bao_chi' },
            { label: 'Học từ người quen', value: 'nguoi_quen' },
            { label: 'Hội thảo nông nghiệp', value: 'hoi_thao' },
        ],
    },
    {
        id: 'B8',
        type: 'contact_info',
        question: 'Thông tin liên hệ',
        suggestion: 'Mebieco sẽ gửi cho bạn tài liệu khởi nghiệp miễn phí',
    },
];

export const useSurveyStore = create<SurveyState>()(
    immer(set => ({
        questions: [Q1],
        currentIndex: 0,
        answers: {},

        setAnswer: (questionId, answer) => {
            set(state => {
                state.answers[questionId] = answer;

                // Handle branching
                if (questionId === 'q1') {
                    // if changing Q1 mid-survey, reset progress
                    if (state.currentIndex > 0) {
                        state.currentIndex = 0;
                        state.answers = { q1: answer };
                    }
                    if (answer === 'a_active' || answer === 'a_paused') {
                        state.questions = [Q1, ...BRANCH_A];
                    } else if (answer === 'b_planning' || answer === 'b_learning') {
                        state.questions = [Q1, ...BRANCH_B];
                    }
                }
            });
        },

        nextQuestion: () => {
            set(state => {
                if (state.currentIndex < state.questions.length - 1) {
                    state.currentIndex += 1;
                }
            });
        },

        prevQuestion: () => {
            set(state => {
                if (state.currentIndex > 0) {
                    state.currentIndex -= 1;
                }
            });
        },

        resetSurvey: () => {
            set(state => {
                state.questions = [Q1];
                state.currentIndex = 0;
                state.answers = {};
            });
        },
    }))
);

// Selectors
export const selectCurrentQuestion = (state: SurveyState) => state.questions[state.currentIndex];
export const selectCurrentAnswer = (state: SurveyState) => {
    const currentQuestion = state.questions[state.currentIndex];
    if (!currentQuestion) return undefined;
    return state.answers[currentQuestion.id];
};
export const selectProgress = (state: SurveyState) => ({
    current: state.currentIndex + 1,
    total: 8, // Both branches have 8 questions exactly
});
