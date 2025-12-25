import { Dimensions } from 'react-native';
import { spacing } from '@/styles';

export interface FeedProdDataPoint {
    date: string; // Format: MM/DD/YYYY
    production: number; // Sản lượng (tấn)
    consumed: number; // Đã ăn (tấn)
    forecast?: number; // Dự báo (tấn) - optional
    fcr: number; // Feed Conversion Ratio
    note: string; // Ghi chú
}

export const SCREEN_WIDTH = Dimensions.get('window').width;
export const CHART_WIDTH = SCREEN_WIDTH - spacing.lg * 2;
export const CHART_HEIGHT = 280;

export const PADDING_LEFT = 40;
export const PADDING_RIGHT = 20;
export const PADDING_TOP = 30;
export const PADDING_BOTTOM = 40;

export const RAW_DATA: Omit<FeedProdDataPoint, 'forecast'>[] = [
    {
        date: '10/1/2025',
        production: 12.0,
        consumed: 8.7,
        fcr: 1.38,
        note: 'Bắt đầu có sản lượng thực tế',
    },
    { date: '10/2/2025', production: 12.3, consumed: 8.9, fcr: 1.38, note: 'Tôm phát triển đều' },
    { date: '10/3/2025', production: 12.6, consumed: 9.2, fcr: 1.37, note: 'Nước ổn định' },
    { date: '10/4/2025', production: 12.9, consumed: 9.5, fcr: 1.36, note: 'Ăn mạnh hơn' },
    { date: '10/5/2025', production: 13.2, consumed: 9.8, fcr: 1.35, note: 'Bổ sung khoáng' },
    { date: '10/6/2025', production: 13.5, consumed: 10.1, fcr: 1.34, note: 'Nước màu xanh' },
    {
        date: '10/7/2025',
        production: 13.8,
        consumed: 10.4,
        fcr: 1.37,
        note: 'Tăng tần suất cho ăn',
    },
    { date: '10/8/2025', production: 14.1, consumed: 10.7, fcr: 1.37, note: 'Kiểm soát đáy ao' },
    { date: '10/9/2025', production: 14.4, consumed: 11.0, fcr: 1.36, note: 'Nước trong' },
    {
        date: '10/10/2025',
        production: 14.7,
        consumed: 11.3,
        fcr: 1.37,
        note: 'Điều chỉnh khẩu phần',
    },
    { date: '10/11/2025', production: 15.0, consumed: 11.6, fcr: 1.36, note: 'Tôm phát triển đều' },
    { date: '10/12/2025', production: 15.3, consumed: 11.9, fcr: 1.35, note: 'Sau mưa nhẹ' },
    {
        date: '10/13/2025',
        production: 15.6,
        consumed: 12.2,
        fcr: 1.35,
        note: 'Kiểm soát đáy ao tốt',
    },
    { date: '10/14/2025', production: 15.9, consumed: 12.5, fcr: 1.34, note: 'Nước ổn định' },
    { date: '10/15/2025', production: 16.2, consumed: 12.8, fcr: 1.34, note: 'Đợt thu tỉa nhỏ' },
    {
        date: '10/16/2025',
        production: 16.5,
        consumed: 13.1,
        fcr: 1.35,
        note: 'Sau thu tỉa, ăn vẫn tốt',
    },
    { date: '10/17/2025', production: 16.8, consumed: 13.4, fcr: 1.35, note: 'Nước màu xanh' },
    { date: '10/18/2025', production: 17.1, consumed: 13.7, fcr: 1.36, note: 'Tăng trọng đều' },
    {
        date: '10/19/2025',
        production: 17.4,
        consumed: 14.0,
        fcr: 1.37,
        note: 'Nước ổn định, màu đẹp',
    },
    { date: '10/20/2025', production: 17.7, consumed: 14.3, fcr: 1.37, note: 'Chuẩn bị thay nước' },
    { date: '10/21/2025', production: 18.0, consumed: 14.6, fcr: 1.36, note: 'Sau thay nước' },
    { date: '10/22/2025', production: 18.3, consumed: 14.9, fcr: 1.35, note: 'Tôm ăn mạnh' },
    { date: '10/23/2025', production: 18.6, consumed: 15.2, fcr: 1.35, note: 'Nước trong' },
    { date: '10/24/2025', production: 18.9, consumed: 15.5, fcr: 1.34, note: 'Bổ sung vi sinh' },
    { date: '10/25/2025', production: 19.2, consumed: 15.8, fcr: 1.34, note: 'Nước màu xanh' },
    { date: '10/26/2025', production: 19.5, consumed: 16.1, fcr: 1.33, note: 'Ăn đều' },
    { date: '10/27/2025', production: 19.8, consumed: 16.4, fcr: 1.33, note: 'Tăng trọng rõ rệt' },
    { date: '10/28/2025', production: 20.1, consumed: 16.7, fcr: 1.34, note: 'Nước ổn định' },
    { date: '10/29/2025', production: 20.4, consumed: 17.0, fcr: 1.35, note: 'Chuẩn bị thu tỉa' },
    { date: '10/30/2025', production: 20.7, consumed: 17.3, fcr: 1.35, note: 'Tôm phát triển đều' },
    { date: '10/31/2025', production: 21.0, consumed: 17.6, fcr: 1.36, note: 'Nước màu xanh' },
    { date: '11/1/2025', production: 21.3, consumed: 17.9, fcr: 1.36, note: 'Bổ sung khoáng' },
    { date: '11/2/2025', production: 21.6, consumed: 18.2, fcr: 1.36, note: 'Nước trong' },
    { date: '11/3/2025', production: 21.9, consumed: 18.5, fcr: 1.36, note: 'Kiểm tra tôm' },
    { date: '11/4/2025', production: 22.2, consumed: 18.8, fcr: 1.36, note: 'Ăn đều' },
    { date: '11/5/2025', production: 22.5, consumed: 19.1, fcr: 1.36, note: 'Sau mưa nhẹ' },
    { date: '11/6/2025', production: 22.8, consumed: 19.4, fcr: 1.36, note: 'Thay nước' },
    { date: '11/7/2025', production: 23.1, consumed: 19.7, fcr: 1.36, note: 'Bổ sung vi sinh' },
    { date: '11/8/2025', production: 23.4, consumed: 20.0, fcr: 1.36, note: 'Nước màu xanh' },
    { date: '11/9/2025', production: 23.7, consumed: 20.3, fcr: 1.36, note: 'Ăn mạnh' },
    { date: '11/10/2025', production: 24.0, consumed: 20.6, fcr: 1.36, note: 'Kiểm tra tôm' },
    { date: '11/11/2025', production: 24.3, consumed: 20.9, fcr: 1.36, note: 'Nước ổn định' },
    { date: '11/12/2025', production: 24.6, consumed: 21.2, fcr: 1.36, note: 'Tăng khẩu phần' },
    { date: '11/13/2025', production: 24.9, consumed: 21.5, fcr: 1.36, note: 'Sau mưa nhẹ' },
    { date: '11/14/2025', production: 25.2, consumed: 21.8, fcr: 1.36, note: 'Thay nước' },
    { date: '11/15/2025', production: 25.5, consumed: 22.1, fcr: 1.36, note: 'Bổ sung khoáng' },
    { date: '11/16/2025', production: 25.8, consumed: 22.4, fcr: 1.36, note: 'Nước trong' },
    { date: '11/17/2025', production: 26.1, consumed: 22.7, fcr: 1.36, note: 'Kiểm tra tôm' },
    { date: '11/18/2025', production: 26.4, consumed: 23.0, fcr: 1.36, note: 'Nước ổn định' },
    { date: '11/19/2025', production: 26.7, consumed: 23.3, fcr: 1.36, note: 'Kiểm tra tôm' },
    { date: '11/20/2025', production: 27.0, consumed: 23.6, fcr: 1.36, note: 'Thay nước' },
    { date: '11/21/2025', production: 27.3, consumed: 23.9, fcr: 1.36, note: 'Bổ sung khoáng' },
    { date: '11/22/2025', production: 27.6, consumed: 24.2, fcr: 1.36, note: 'Sau mưa nhẹ' },
    { date: '11/23/2025', production: 27.9, consumed: 24.5, fcr: 1.36, note: 'Nước màu xanh' },
    { date: '11/24/2025', production: 28.2, consumed: 24.8, fcr: 1.36, note: 'Ăn đều' },
    { date: '11/25/2025', production: 28.5, consumed: 25.1, fcr: 1.36, note: 'Kiểm tra tôm' },
    { date: '11/26/2025', production: 28.8, consumed: 25.4, fcr: 1.36, note: 'Nước trong' },
    { date: '11/27/2025', production: 29.1, consumed: 25.7, fcr: 1.36, note: 'Thay nước' },
    { date: '11/28/2025', production: 29.4, consumed: 26.0, fcr: 1.36, note: 'Bổ sung vi sinh' },
    { date: '11/29/2025', production: 29.7, consumed: 26.3, fcr: 1.36, note: 'Ăn mạnh' },
    { date: '11/30/2025', production: 30.0, consumed: 26.6, fcr: 1.36, note: 'Trước khi thu tỉa' },
];
