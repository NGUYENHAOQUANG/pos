import React from 'react';
import { SvgProps } from 'react-native-svg';

// Import device card SVG images
import ItemOnCard from '@/assets/Icon/IconDevices/item_on.svg';
import ItemAutoCard from '@/assets/Icon/IconDevices/item_auto.svg';
import ItemOffCard from '@/assets/Icon/IconDevices/item_off.svg';
import ItemOxiCard from '@/assets/Icon/IconDevices/item_oxi.svg';

// Type definition for manual items
export interface ManualItem {
    id: string;
    CardSvg: React.FC<SvgProps>;
    descriptions: string[];
    note?: string;
}

// Manual data with SVG card images
export const MANUAL_DATA: ManualItem[] = [
    {
        id: '1',
        CardSvg: ItemOnCard,
        descriptions: [
            'Tên thiết bị: Thiết bị 1',
            'Màu thiết bị: xanh = Thiết bị đang hoạt động',
            'Tag Lịch trình = Thiết bị đang ở chế độ điều khiển bằng lịch trình',
            'Nút điều khiển bật/tắt màu xanh: đang bật thiết bị',
        ],
    },
    {
        id: '2',
        CardSvg: ItemAutoCard,
        descriptions: [
            'Tên thiết bị: Thiết bị 1',
            'Màu thiết bị: xanh = Thiết bị đang hoạt động',
            'Tag Thủ công = Thiết bị đang ở chế độ điều khiển thủ công bằng app',
            'Nút điều khiển bật/tắt màu xanh: đang bật thiết bị',
        ],
    },
    {
        id: '3',
        CardSvg: ItemOffCard,
        descriptions: [
            'Tên thiết bị: Thiết bị 1',
            'Màu thiết bị: xám = Thiết bị đang ngừng hoạt động',
            'Tag Lịch trình = Thiết bị đang ở chế độ điều khiển bằng lịch trình',
            'Nút điều khiển bật/tắt màu xám: đang tắt thiết bị',
        ],
    },
    {
        id: '4',
        CardSvg: ItemOxiCard,
        descriptions: [
            'Tên thiết bị: Thiết bị 1',
            'Màu thiết bị: xanh = Thiết bị đang hoạt động',
            'Tag Tại chỗ = Thiết bị đang ở chế độ điều khiển tại chỗ, tức là bật tắt tại tủ',
            'Nút điều khiển bật/tắt bị mờ: không thể điều khiển thiết bị bằng app ở chế độ Tại chỗ',
        ],
        note: 'Nút điều khiển chỉ hoạt động khi thiết bị ở chế độ điều khiển thủ công/chạy theo lịch trình',
    },
];
