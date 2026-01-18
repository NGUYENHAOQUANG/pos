import React from 'react';

// Import device card SVGs
import TurnOnCard from '@/assets/Icon/IconDevices/feeder.svg';
import TurnOffCard from '@/assets/Icon/IconDevices/oxy.svg';
import HandmadeCard from '@/assets/Icon/IconDevices/fan.svg';
import OnSiteCard from '@/assets/Icon/IconDevices/syphon.svg';

// Type definition for manual items
export interface ManualItem {
    id: string;
    CardSvg: React.FC<{ width?: number; height?: number }>;
    descriptions: string[];
    note?: string;
}

// Manual data with SVG cards
export const MANUAL_DATA: ManualItem[] = [
    {
        id: '1',
        CardSvg: TurnOnCard,
        descriptions: [
            'Tên thiết bị: Máy cho ăn',
            'Chức năng: Tự động phân phối thức ăn cho vật nuôi.',
            'Điều khiển: Thiết bị được điều khiển bằng lịch trình (có thể lập trình hẹn giờ), có thể kích hoạt thủ công khi cần thiết.',
        ],
    },
    {
        id: '2',
        CardSvg: HandmadeCard,
        descriptions: [
            'Tên thiết bị: Quạt nước',
            'Chức năng : Tạo oxy hòa tan trong nước và giúp lưu thông dòng nước, cải thiện môi trường sống cho các loài thủy sản, đặc biệt quan trọng trong nuôi trồng thâm canh.',
            'Điều khiển: Thiết bị được điều khiển bằng lịch trình (sử dụng timer) hoặc liên tục trong thời gian dài, có thể bật/tắt thủ công.',
        ],
    },
    {
        id: '3',
        CardSvg: TurnOffCard,
        descriptions: [
            'Tên thiết bị: Máy thổi khí',
            'Chức năng: Cung cấp lượng lớn khí oxy vào nước thông qua các đường ống và đá sủi, duy trì nồng độ oxy cần thiết cho sự sống của động vật thủy sản',
            'Điều khiển: Thiết bị được điều khiển bằng lịch trình (sử dụng timer) hoặc liên tục trong thời gian dài, có thể bật/tắt thủ công.',
        ],
    },
    {
        id: '4',
        CardSvg: OnSiteCard,
        descriptions: [
            'Tên thiết bị: Xyphon đáy',
            'Chức năng: Hút chất thải, thức ăn thừa và các chất cặn bẩn tích tụ dưới đáy ao, giúp làm sạch môi trường nước và duy trì chất lượng nước ổn định.',
            'Điều khiển: Thiết bị được điều khiển thủ công bởi người dùng hoặc thông qua hệ thống bơm hút được điều khiển theo lịch trình.',
        ],
    },
];
