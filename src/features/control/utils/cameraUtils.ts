import { Colors } from '@/styles/colors';

/**
 * Lấy tên hiển thị tiếng Việt cho vị trí camera
 */
export const getLocationCategoryName = (cat: string): string => {
    switch (cat) {
        case 'GrowOutPond':
            return 'Ao Nuôi';
        case 'NurseryPond':
            return 'Ao Vèo';
        case 'Infrastructure':
            return 'Hạ Tầng';
        case 'None':
            return 'Khác';
        default:
            return cat || 'Khác';
    }
};

/**
 * Lấy nhãn hiển thị tiếng Việt cho trạng thái camera
 */
export const getCameraStatusText = (status: string): string => {
    switch (status) {
        case 'On':
            return 'Online';
        case 'Off':
            return 'Offline';
        case 'Fault':
            return 'Kết nối thất bại';
        case 'Connecting':
            return 'Đang kết nối';
        default:
            return status || 'Offline';
    }
};

/**
 * Lấy mã màu tương ứng cho trạng thái camera
 */
export const getCameraStatusColor = (status: string, theme: Colors): string => {
    switch (status) {
        case 'On':
            return theme.green[600];
        case 'Off':
            return theme.red[600];
        case 'Fault':
            return theme.orange[600];
        case 'Connecting':
            return theme.blue[400];
        default:
            return theme.red[600];
    }
};
