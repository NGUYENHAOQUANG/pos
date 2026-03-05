import { Dimensions } from 'react-native';

export interface FeedProdDataPoint {
    date: string; // Format: MM/DD/YYYY
    production: number; // Sản lượng (tấn)
    consumed: number; // Đã ăn (tấn)
    forecast?: number; // Dự báo (tấn) - optional
    fcr: number; // Feed Conversion Ratio
    note: string; // Ghi chú
}

export const SCREEN_WIDTH = Dimensions.get('window').width;
export const CHART_WIDTH = SCREEN_WIDTH;
export const CHART_HEIGHT = 280;

export const PADDING_LEFT = 12;
export const PADDING_RIGHT = 20;
export const PADDING_TOP = 30;
export const PADDING_BOTTOM = 40;

/** Dữ liệu mẫu: sản lượng & thức ăn — số tròn, biến thiên tự nhiên */
export const RAW_DATA: Omit<FeedProdDataPoint, 'forecast'>[] = [
    { date: '10/01/2025', production: 10, consumed: 7.5, fcr: 1.33, note: 'Bắt đầu theo dõi' },
    { date: '10/05/2025', production: 11, consumed: 8.2, fcr: 1.34, note: 'Tôm phát triển đều' },
    { date: '10/08/2025', production: 12, consumed: 9, fcr: 1.33, note: 'Nước ổn định' },
    { date: '10/11/2025', production: 13.5, consumed: 10, fcr: 1.35, note: 'Ăn mạnh' },
    { date: '10/15/2025', production: 15, consumed: 11.2, fcr: 1.34, note: 'Thu tỉa nhẹ' },
    { date: '10/18/2025', production: 16, consumed: 12, fcr: 1.33, note: 'Nước màu xanh' },
    { date: '10/22/2025', production: 18, consumed: 13.5, fcr: 1.33, note: 'Tăng khẩu phần' },
    { date: '10/25/2025', production: 19.5, consumed: 14.5, fcr: 1.34, note: 'Bổ sung khoáng' },
    { date: '10/28/2025', production: 21, consumed: 15.5, fcr: 1.35, note: 'Nước trong' },
    { date: '11/01/2025', production: 22.5, consumed: 16.8, fcr: 1.34, note: 'Ăn đều' },
    { date: '11/05/2025', production: 24, consumed: 18, fcr: 1.33, note: 'Thay nước' },
    { date: '11/08/2025', production: 25.5, consumed: 19, fcr: 1.34, note: 'Kiểm tra tôm' },
    { date: '11/12/2025', production: 27, consumed: 20.2, fcr: 1.34, note: 'Nước ổn định' },
    { date: '11/15/2025', production: 28.5, consumed: 21.2, fcr: 1.34, note: 'Bổ sung vi sinh' },
    { date: '11/18/2025', production: 30, consumed: 22.5, fcr: 1.33, note: 'Tăng trọng tốt' },
    { date: '11/22/2025', production: 32, consumed: 24, fcr: 1.33, note: 'Chuẩn bị thu tỉa' },
    { date: '11/25/2025', production: 33.5, consumed: 25, fcr: 1.34, note: 'Nước màu đẹp' },
    { date: '11/28/2025', production: 35, consumed: 26.2, fcr: 1.34, note: 'Ăn mạnh' },
    { date: '11/30/2025', production: 36, consumed: 27, fcr: 1.33, note: 'Cuối vụ' },
];
