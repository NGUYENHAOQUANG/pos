import React from 'react';

import TurnOnCard from '@/assets/Icon/IconDevices/TurnOnCard.svg';
import TurnOffCard from '@/assets/Icon/IconDevices/TurnOffCard.svg';
import HandmadeCard from '@/assets/Icon/IconDevices/HandmadeCard.svg';
import OnSiteCard from '@/assets/Icon/IconDevices/OnSiteCard.svg';
import ErrorCard from '@/assets/Icon/IconDevices/ErrorCard.svg';

// Type definition for manual items
interface ManualItem {
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
            'Tên thiết bị: Thiết bị 1',
            'Màu thiết bị: xanh = Thiết bị đang hoạt động',
            'Tag Lịch trình = Thiết bị đang ở chế độ điều khiển bằng lịch trình',
            'Nút điều khiển bật/tắt màu xanh: đang bật thiết bị',
        ],
    },
    {
        id: '2',
        CardSvg: HandmadeCard,
        descriptions: [
            'Tên thiết bị: Thiết bị 1',
            'Màu thiết bị: xanh = Thiết bị đang hoạt động',
            'Tag Thủ công = Thiết bị đang ở chế độ điều khiển thủ công bằng app',
            'Nút điều khiển bật/tắt màu xanh: đang bật thiết bị',
        ],
    },
    {
        id: '3',
        CardSvg: TurnOffCard,
        descriptions: [
            'Tên thiết bị: Thiết bị 1',
            'Màu thiết bị: xám = Thiết bị đang ngừng hoạt động',
            'Tag Lịch trình = Thiết bị đang ở chế độ điều khiển bằng lịch trình',
            'Nút điều khiển bật/tắt màu xám: đang tắt thiết bị',
        ],
    },
    {
        id: '4',
        CardSvg: OnSiteCard,
        descriptions: [
            'Tên thiết bị: Thiết bị 1',
            'Màu thiết bị: xanh = Thiết bị đang hoạt động',
            'Tag Tại chỗ = Thiết bị đang ở chế độ điều khiển tại chỗ, tức là bật tắt tại tủ',
            'Nút điều khiển bật/tắt bị mờ: không thể điều khiển thiết bị bằng app ở chế độ Tại chỗ',
        ],
        note: 'Nút điều khiển chỉ hoạt động khi thiết bị ở chế độ điều khiển thủ công/chạy theo lịch trình',
    },
    {
        id: '5',
        CardSvg: ErrorCard,
        descriptions: [
            'Tên thiết bị: Thiết bị 1',
            'Màu thiết bị: đỏ = Thiết bị đang gặp sự cố',
            'Tag Lịch trình = Thiết bị đang ở chế độ điều khiển bằng lịch trình',
            'Thông báo lỗi hiển thị bên dưới icon thiết bị',
        ],
    },
];
