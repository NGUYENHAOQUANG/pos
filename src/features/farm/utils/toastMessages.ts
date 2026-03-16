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
    SHRIMP_HEALTH_AI: {
        HEALTHY: {
            type: 'success',
            text1: 'Tôm khỏe mạnh',
        },
        SICK: {
            type: 'error',
            text1: 'Phát hiện tôm bệnh !',
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

/**
 * Show success toast message for adding a job
 */
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
 * Stock transfer error message mapping
 * Maps backend error keywords to user-friendly Vietnamese messages
 */
const STOCK_TRANSFER_ERROR_MAP: { keywords: string[]; message: string }[] = [
    {
        keywords: ['shrimpsizepcsperkg', 'kích cỡ tôm', 'shrimpsize'],
        message: 'Cỡ tôm không hợp lệ',
    },
    {
        keywords: ['totalstocking', 'tổng số lượng', 'total stocking'],
        message: 'Tổng số lượng thả không hợp lệ',
    },
    {
        keywords: ['toponds', 'topond', 'ao nhận'],
        message: 'Ao nhận không hợp lệ',
    },
    {
        keywords: ['quantity', 'số lượng'],
        message: 'Số lượng tôm không hợp lệ',
    },
    {
        keywords: ['cycle', 'chu kỳ'],
        message: 'Chu kỳ không hợp lệ hoặc chưa được tạo',
    },
];

/**
 * Map backend stock transfer error to Vietnamese message
 * @param rawMessage - Raw error message from backend
 * @param fallback - Fallback message if no mapping found
 * @returns Vietnamese error message
 */
export const mapStockTransferError = (
    rawMessage: string,
    fallback: string = 'Tạo phiếu sang ao thất bại'
): string => {
    const lowerMessage = rawMessage.toLowerCase();

    for (const entry of STOCK_TRANSFER_ERROR_MAP) {
        if (entry.keywords.some(keyword => lowerMessage.includes(keyword))) {
            return entry.message;
        }
    }

    return fallback;
};
