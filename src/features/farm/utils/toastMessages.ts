import Toast from 'react-native-toast-message';
import { JobType } from '@/features/farm/components/pondwork/JobItem';
import { APP_CONFIG } from '@/shared/constants/config';
import { FieldErrors } from 'react-hook-form';
import { FeedingFormValues } from '@/features/farm/schemas/feedingFormSchema';

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

const TOAST_MESSAGES_CONFIG = {
    JOB: JOB_TOAST_MESSAGES_CONFIG,
    IMAGE: {
        SIZE_EXCEEDED: {
            type: 'error' as const,
            text1: 'Thông báo',
            getText2: (limitMb: number) => `Tổng giới hạn các ảnh là ${limitMb}MB`,
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
        position: 'top',
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
        position: 'top',
        visibilityTime: 3000,
    });
};

export const showImageSizeExceededToast = () => {
    const config = TOAST_MESSAGES_CONFIG.IMAGE.SIZE_EXCEEDED;
    Toast.show({
        type: config.type,
        text1: config.text1,
        text2: config.getText2(APP_CONFIG.IMAGE_SIZE_LIMIT_MB),
        position: 'top',
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
