import Toast from 'react-native-toast-message';
import { JobType } from '@/features/farm/components/pondwork/JobItem';
import { FieldErrors } from 'react-hook-form';
import { FeedingFormValues } from '@/features/farm/schemas/feedingFormSchema';

/**
 * Toast message configurations for different job types
 */
const JOB_TOAST_MESSAGES: Partial<Record<JobType, { add: string; edit: string }>> = {
    FEED: {
        add: 'Đã cho ăn thành công',
        edit: 'Đã cập nhật cho ăn thành công',
    },
    SHRIMP_INSPECTION: {
        add: 'Đã kiểm tra tôm thành công',
        edit: 'Đã cập nhật kiểm tra tôm thành công',
    },
    ENVIRONMENT: {
        add: 'Đã đo thông số thành công',
        edit: 'Đã cập nhật đo thông số thành công',
    },
    WATER_TREATMENT: {
        add: 'Đã xử lý nước thành công',
        edit: 'Đã cập nhật xử lý nước thành công',
    },
    WATER_CHANGE: {
        add: 'Đã thay/cấp nước thành công',
        edit: 'Đã cập nhật thay/cấp nước thành công',
    },
    SIPHON: {
        add: 'Đã xi-phông thành công',
        edit: 'Đã cập nhật xi-phông thành công',
    },
    TRANSFER_POND: {
        add: 'Đã sang ao thành công',
        edit: 'Đã cập nhật sang ao thành công',
    },
    CLEAN_POND: {
        add: 'Đã thêm rửa ao thành công',
        edit: 'Đã cập nhật rửa ao thành công',
    },
    SUN_DRY_POND: {
        add: 'Đã thêm phơi ao thành công',
        edit: 'Đã cập nhật phơi ao thành công',
    },
    TROUBLESHOOTING: {
        add: 'Đã ghi sự cố thành công',
        edit: 'Đã cập nhật sự cố thành công',
    },
    HARVEST: {
        add: 'Đã thêm thu hoạch thành công',
        edit: 'Đã cập nhật thu hoạch thành công',
    },
};

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
    const message = JOB_TOAST_MESSAGES[jobType]?.add || 'Đã thêm thành công';
    Toast.show({
        type: 'success',
        text1: message,
        position: 'top',
        visibilityTime: 3000,
    });
};

/**
 * Show success toast message for editing a job
 */
export const showEditJobSuccessToast = (jobType: JobType) => {
    const message = JOB_TOAST_MESSAGES[jobType]?.edit || 'Đã cập nhật thành công';
    Toast.show({
        type: 'success',
        text1: message,
        position: 'top',
        visibilityTime: 3000,
    });
};

//feeding
export const handleFeedingFormError = (errors: FieldErrors<FeedingFormValues>) => {
    if (errors.materials?.root?.message || errors.materials?.message) {
        Toast.show({
            type: 'error',
            text1: 'Vui lòng chọn vật tư',
            position: 'top',
            visibilityTime: 3000,
        });
    } else if (errors.executionDate) {
        Toast.show({
            type: 'error',
            text1: 'Vui lòng chọn thời gian',
            position: 'top',
            visibilityTime: 3000,
        });
    } else {
        Toast.show({
            type: 'error',
            text1: 'Vui lòng kiểm tra lại dữ liệu nhập',
            position: 'top',
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
