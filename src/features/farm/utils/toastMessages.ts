import Toast from 'react-native-toast-message';
import { JobType } from '@/features/farm/components/pondwork/JobItem';
import { APP_CONFIG } from '@/shared/constants/config';
import { FieldErrors } from 'react-hook-form';
import { FeedingFormValues } from '@/features/farm/schemas/feedingFormSchema';
import { HarvestFormData } from '@/features/farm/schemas/harvestFormSchema';

/**
 * Toast message configurations for different job types
 */
const JOB_TOAST_MESSAGES_CONFIG: Partial<
    Record<JobType, { add: string; edit: string; delete: string }>
> = {
    FEED: {
        add: 'Đã cho ăn thành công',
        edit: 'Đã cập nhật cho ăn thành công',
        delete: 'Tác vụ đã được xóa',
    },
    SHRIMP_INSPECTION: {
        add: 'Đã kiểm tra tôm thành công',
        edit: 'Đã cập nhật kiểm tra tôm thành công',
        delete: 'Tác vụ đã được xóa',
    },
    ENVIRONMENT: {
        add: 'Đã đo thông số thành công',
        edit: 'Đã cập nhật đo thông số thành công',
        delete: 'Tác vụ đã được xóa',
    },
    WATER_TREATMENT: {
        add: 'Đã xử lý nước thành công',
        edit: 'Đã cập nhật xử lý nước thành công',
        delete: 'Tác vụ đã được xóa',
    },
    WATER_CHANGE: {
        add: 'Đã thay/cấp nước thành công',
        edit: 'Đã cập nhật thay/cấp nước thành công',
        delete: 'Tác vụ đã được xóa',
    },
    SIPHON: {
        add: 'Đã xi-phông thành công',
        edit: 'Đã cập nhật xi-phông thành công',
        delete: 'Tác vụ đã được xóa',
    },
    TRANSFER_POND: {
        add: 'Đã sang ao thành công',
        edit: 'Đã cập nhật sang ao thành công',
        delete: 'Tác vụ đã được xóa',
    },
    CLEAN_POND: {
        add: 'Đã thêm rửa ao thành công',
        edit: 'Đã cập nhật rửa ao thành công',
        delete: 'Tác vụ đã được xóa',
    },
    SUN_DRY_POND: {
        add: 'Đã thêm phơi ao thành công',
        edit: 'Đã cập nhật phơi ao thành công',
        delete: 'Tác vụ đã được xóa',
    },
    TROUBLESHOOTING: {
        add: 'Đã ghi sự cố thành công',
        edit: 'Đã cập nhật sự cố thành công',
        delete: 'Tác vụ đã được xóa',
    },
    HARVEST: {
        add: 'Đã thêm thu hoạch thành công',
        edit: 'Đã cập nhật thu hoạch thành công',
        delete: 'Tác vụ đã được xóa',
    },
    MEASURE_SIZE: {
        add: 'Đã đo kích thước tôm thành công',
        edit: 'Đã cập nhật thành công',
        delete: 'Tác vụ đã được xóa',
    },
};

export const TOAST_MESSAGES_CONFIG = {
    JOB: JOB_TOAST_MESSAGES_CONFIG,
    IMAGE: {
        SIZE_EXCEEDED: {
            type: 'error',
            text1: 'Thông báo',
            getText2: (limitMb: number) => `Tổng giới hạn các ảnh là ${limitMb}MB`,
        },
    },
    AI_COMMON: {
        UPLOAD_FAILED: {
            type: 'error',
            text1: 'Lỗi',
            text2: 'Không thể tải ảnh lên.',
        },
        PROCESS_FAILED: {
            type: 'error',
            text1: 'Lỗi',
            text2: 'Không thể xử lý ảnh này',
        },
    },
    AI_COUNTING: {
        SUCCESS: {
            type: 'success',
            text1: 'Đã có kết quả phân tích từ AI!',
            position: 'bottom',
        },
    },
    AI_MEASURE: {
        SUCCESS: {
            type: 'success',
            text1: 'Đã có kết quả đo từ AI!',
            position: 'bottom',
        },
    },
    SHRIMP_HEALTH_AI: {
        HEALTHY: {
            type: 'success',
            text1: 'Tôm khỏe mạnh',
        },
        SICK: {
            type: 'error',
            text1: 'Phát hiện tôm bệnh',
        },
        SUCCESS: {
            type: 'success',
            text1: 'Đã có kết quả phân tích từ AI!',
            position: 'bottom',
        },
        NO_IMAGE: {
            type: 'error',
            text1: 'Chưa có hình ảnh',
            text2: 'Vui lòng chọn hoặc chụp ảnh để kiểm tra.',
        },
        NO_DATA: {
            type: 'error',
            text1: 'Chưa có dữ liệu',
            text2: 'Vui lòng lấy kết quả kiểm tra trước khi xem chi tiết.',
        },
    },
    SCHEDULE: {
        MISSING_RUN_TIME: {
            type: 'error',
            text1: 'Thiếu thông tin',
            text2: 'Vui lòng nhập thời gian chạy (giây)',
        },
        MISSING_STOP_TIME: {
            type: 'error',
            text1: 'Thiếu thông tin',
            text2: 'Vui lòng nhập thời gian dừng (phút)',
        },
        PAST_START_TIME: {
            type: 'error',
            text1: 'Lưu không thành công',
            text2: 'Thời gian bắt đầu phải sau thời gian hiện tại',
        },
        OVERLAP: {
            type: 'error',
            text1: 'Lịch trình bị chồng chéo',
        },
        UPDATE_SUCCESS: {
            type: 'success',
            text1: 'Cập nhật lịch trình thành công',
        },
        CONFIG_SUCCESS: {
            type: 'success',
            text1: 'Cập nhật cấu hình thành công',
        },
        PARTIAL_FAIL: {
            type: 'success',
            text1: 'Lưu lịch trình một phần',
        },
        SAVE_FAILED: {
            type: 'error',
            text1: 'Lỗi',
        },
        DELETE_SUCCESS: {
            type: 'success',
            text1: 'Đã xóa lịch trình',
        },
        CANNOT_EDIT: {
            type: 'error',
            text1: 'Không thể thay đổi lịch trình đã hoạt động',
        },
    },
    SCALE: {
        ADD_SUCCESS: {
            type: 'success',
            text1: 'Thêm cân thành công',
        },
    },
} as const;

/**
 * Get harvest success message based on harvest type
 */
export const getHarvestSuccessMessage = (harvestType?: string): string => {
    switch (harvestType) {
        case 'Thu hết':
            return 'Đã thu hết thành công';
        case 'Thu tỉa':
            return 'Đã thu tỉa thành công';
        case 'Đóng chu kỳ':
            return 'Đã đóng chu kỳ thành công';
        default:
            return 'Đã thêm thu hoạch thành công';
    }
};

export const showAddJobSuccessToast = (jobType: JobType) => {
    const message = TOAST_MESSAGES_CONFIG.JOB[jobType]?.add || 'Đã thêm thành công';
    Toast.show({
        type: 'success',
        text1: message,
        visibilityTime: 3000,
    });
};

/**
 * Show success toast message for editing a job
 */
export const showEditJobSuccessToast = (jobType: JobType) => {
    const message = TOAST_MESSAGES_CONFIG.JOB[jobType]?.edit || 'Đã cập nhật thành công';
    Toast.show({
        type: 'success',
        text1: message,
        visibilityTime: 3000,
    });
};

export const showImageSizeExceededToast = () => {
    const config = TOAST_MESSAGES_CONFIG.IMAGE.SIZE_EXCEEDED;
    Toast.show({
        type: config.type,
        text1: config.text1,
        text2: config.getText2(APP_CONFIG.IMAGE_SIZE_LIMIT_MB),
        visibilityTime: 3000,
    });
};

/**
 * Show success toast message for deleting a job
 */
export const showDeleteJobSuccessToast = (jobType: JobType) => {
    const message = TOAST_MESSAGES_CONFIG.JOB[jobType]?.delete || 'Đã xóa thành công';
    Toast.show({
        type: 'success',
        text1: message,
        visibilityTime: 3000,
    });
};
type BasicToastConfig = {
    type: string;
    text1: string;
    text2?: string;
    position?: 'top' | 'bottom';
    visibilityTime?: number;
};

export const AppToast = (config: BasicToastConfig) => {
    Toast.show({
        visibilityTime: 3000,
        ...config,
    });
};
//feeding
export const handleFeedingFormError = (errors: FieldErrors<FeedingFormValues>) => {
    if (errors.materials?.root?.message || errors.materials?.message) {
        Toast.show({
            type: 'error',
            text1: 'Vui lòng chọn vật tư',
            visibilityTime: 3000,
        });
    } else if (errors.executionDate) {
        Toast.show({
            type: 'error',
            text1: 'Vui lòng chọn thời gian',
            visibilityTime: 3000,
        });
    } else {
        Toast.show({
            type: 'error',
            text1: 'Số lượng vật tư phải lớn hơn 0',
            visibilityTime: 3000,
        });
    }
};

//harvest
export const handleHarvestFormError = (errors: FieldErrors<HarvestFormData>) => {
    const firstError =
        errors.totalWeightKg?.message ||
        errors.shrimpSize?.message ||
        errors.referencePrice?.message;

    if (firstError) {
        Toast.show({
            type: 'error',
            text1: firstError,
            visibilityTime: 3000,
        });
    }
};

/**
 * Show error toast message when text length exceeds the limit
 */
export const showLimitCharacterToast = () => {
    Toast.show({
        type: 'error',
        text1: 'Không được vượt quá 2000 kí tự',
    });
};

/**
 * Show error toast when material quantity is zero or negative
 */
export const showMaterialQuantityZeroToast = () => {
    Toast.show({
        type: 'error',
        text1: 'Số lượng vật tư phải lớn hơn 0',
        visibilityTime: 3000,
    });
};

/**
 * Show error toast when no material is selected
 */
export const showSelectMaterialToast = () => {
    Toast.show({
        type: 'error',
        text1: 'Vui lòng chọn vật tư',
        visibilityTime: 3000,
    });
};

/**
 * Show error toast when activity type is invalid
 */
export const showInvalidActivityTypeToast = () => {
    Toast.show({
        type: 'error',
        text1: 'Loại hoạt động không hợp lệ',
        visibilityTime: 3000,
    });
};

/**
 * Show error toast when pond info is not found
 */
export const showPondNotFoundToast = () => {
    Toast.show({
        type: 'error',
        text1: 'Không tìm thấy thông tin Ao',
        visibilityTime: 3000,
    });
};

/**
 * Show error toast for cycle form validation errors
 */
export const showCycleFormValidationToast = (message: string) => {
    Toast.show({
        type: 'error',
        text1: message || 'Dữ liệu không hợp lệ',
        visibilityTime: 3000,
    });
};

/**
 * Show error toast when shrimp size input is invalid
 */
export const showShrimpSizeErrorToast = () => {
    Toast.show({
        type: 'error',
        text1: 'Vui lòng nhập cỡ tôm (con/kg)',
        visibilityTime: 3000,
    });
};

/**
 * Show error toast when remaining weight input is invalid
 */
export const showRemainingWeightErrorToast = () => {
    Toast.show({
        type: 'error',
        text1: 'Vui lòng nhập sản lượng còn lại (kg)',
        visibilityTime: 3000,
    });
};

// ── Schedule toasts ──

export const showScheduleMissingRunTimeToast = () => {
    AppToast(TOAST_MESSAGES_CONFIG.SCHEDULE.MISSING_RUN_TIME);
};

export const showScheduleMissingStopTimeToast = () => {
    AppToast(TOAST_MESSAGES_CONFIG.SCHEDULE.MISSING_STOP_TIME);
};

export const showSchedulePastStartTimeToast = () => {
    AppToast(TOAST_MESSAGES_CONFIG.SCHEDULE.PAST_START_TIME);
};

export const showScheduleOverlapToast = (text2: string) => {
    AppToast({ ...TOAST_MESSAGES_CONFIG.SCHEDULE.OVERLAP, text2 });
};

export const showScheduleUpdateSuccessToast = () => {
    AppToast(TOAST_MESSAGES_CONFIG.SCHEDULE.UPDATE_SUCCESS);
};

export const showScheduleConfigSuccessToast = () => {
    AppToast(TOAST_MESSAGES_CONFIG.SCHEDULE.CONFIG_SUCCESS);
};

export const showSchedulePartialFailToast = (text2: string) => {
    AppToast({ ...TOAST_MESSAGES_CONFIG.SCHEDULE.PARTIAL_FAIL, text2 });
};

export const showScheduleSaveFailedToast = (text2?: string) => {
    AppToast({
        ...TOAST_MESSAGES_CONFIG.SCHEDULE.SAVE_FAILED,
        text2: text2 || 'Không thể lưu lịch trình',
    });
};

export const showScheduleDeleteSuccessToast = () => {
    AppToast(TOAST_MESSAGES_CONFIG.SCHEDULE.DELETE_SUCCESS);
};

export const showScheduleDeleteFailedToast = (message?: string) => {
    AppToast({ type: 'error', text1: message || 'Không thể xóa lịch trình' });
};

export const showScheduleCannotEditToast = () => {
    AppToast(TOAST_MESSAGES_CONFIG.SCHEDULE.CANNOT_EDIT);
};
