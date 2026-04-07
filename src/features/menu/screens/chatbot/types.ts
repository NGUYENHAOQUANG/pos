/**
 * @file types.ts
 * @description Định nghĩa kiểu dữ liệu cho Chatbot Generative UI
 *
 * Mở rộng IMessage của GiftedChat để hỗ trợ thuộc tính `widget`.
 * Khi server AI trả về một tool call / function call, response sẽ chứa
 * một object `widget` với `type` và `data` tương ứng.
 * Client sẽ dùng `type` để quyết định render component UI nào.
 */
import { IMessage } from 'react-native-gifted-chat';

// ── Widget Types ────────────────────────────────────────────────────────────────
// Thêm widget type mới ở đây khi mở rộng tính năng

/** Các loại widget mà AI có thể trả về */
export type WidgetType = 'POND_STATUS' | 'DEVICE_CONTROL';

/** Dữ liệu cho widget hiển thị thông số ao nuôi */
export interface PondStatusData {
    pond_id: number;
    pond_name?: string;
    temperature: number; // °C
    ph: number;
    oxygen: number; // mg/L (DO - Dissolved Oxygen)
    salinity?: number; // ppt
    turbidity?: number; // NTU
}

/** Dữ liệu cho widget điều khiển thiết bị */
export interface DeviceControlData {
    device_id: string;
    device_name?: string;
    status: 'ON' | 'OFF';
    device_type?: 'FAN' | 'PUMP' | 'AERATOR' | 'FEEDER';
}

/** Union type cho tất cả widget data */
export type WidgetData = PondStatusData | DeviceControlData;

/** Cấu trúc widget được nhúng trong message */
export interface ChatWidget {
    type: WidgetType;
    data: WidgetData;
}

// ── Extended Message ────────────────────────────────────────────────────────────

/**
 * Mở rộng IMessage của GiftedChat với thuộc tính `widget` tuỳ chọn.
 * - Nếu `widget` tồn tại → GiftedChat sẽ render UI widget thay vì chỉ text.
 * - Nếu `widget` là undefined → GiftedChat render text bình thường.
 */
export interface IChatMessage extends IMessage {
    widget?: ChatWidget;
}

// ── API Response Types ──────────────────────────────────────────────────────────

/**
 * Format response trả về từ AI server.
 * Khi tích hợp API thật, cần map response về interface này.
 */
export interface AIResponse {
    /** Text trả lời của AI (luôn có) */
    text: string;
    /** Widget data nếu AI quyết định gọi tool/function (tuỳ chọn) */
    widget?: ChatWidget;
}
