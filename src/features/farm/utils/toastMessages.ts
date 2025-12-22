import Toast from 'react-native-toast-message';
import { JobType } from '@/features/farm/components/pondwork/JobItem';

/**
 * Toast message configurations for different job types
 */
const JOB_TOAST_MESSAGES: Partial<Record<JobType, { add: string; edit: string }>> = {
  FEED: {
    add: 'Đã thêm cho ăn thành công',
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
    add: 'Đã thêm xử lý nước thành công',
    edit: 'Đã cập nhật xử lý nước thành công',
  },
  WATER_CHANGE: {
    add: 'Đã thêm cấp nước thành công',
    edit: 'Đã cập nhật cấp nước thành công',
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
    add: 'Đã thêm vệ sinh ao thành công',
    edit: 'Đã cập nhật vệ sinh ao thành công',
  },
  SUN_DRY_POND: {
    add: 'Đã thêm phơi ao thành công',
    edit: 'Đã cập nhật phơi ao thành công',
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
