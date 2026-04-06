/**
 * @file chatbotApi.ts
 * @description Mock API Service cho Chatbot AI
 *
 * File này mô phỏng việc gọi API tới server AI.
 * Khi tích hợp API thật, chỉ cần thay đổi nội dung hàm `sendMessageToAI()`
 * mà không cần sửa bất kỳ logic UI nào.
 *
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  LƯU Ý KHI TÍCH HỢP API THẬT:                             ║
 * ║  1. Thay nội dung hàm sendMessageToAI() bằng fetch/axios   ║
 * ║  2. Map response từ server về interface AIResponse          ║
 * ║  3. Xoá hàm mockDelay() và các mock data                   ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { AIResponse } from '../types';

// ── Mock Delay ──────────────────────────────────────────────────────────────────
/** Mô phỏng network latency (800ms - 1.5s) */
const mockDelay = (): Promise<void> =>
    new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));

// ── Mock Intent Detection ───────────────────────────────────────────────────────
/**
 * Phân tích intent từ tin nhắn người dùng (mock).
 * Trong thực tế, việc này do server AI (LLM) xử lý.
 */
type Intent = 'GREETING' | 'POND_STATUS' | 'DEVICE_CONTROL' | 'GENERAL';

const detectIntent = (message: string): Intent => {
    const msg = message.toLowerCase();

    // Kiểm tra intent hỏi về thông số ao
    if (
        msg.includes('thông số') ||
        msg.includes('tình trạng') ||
        msg.includes('ao') ||
        msg.includes('hồ') ||
        msg.includes('nước') ||
        msg.includes('ph') ||
        msg.includes('nhiệt độ') ||
        msg.includes('oxy') ||
        msg.includes('pond')
    ) {
        return 'POND_STATUS';
    }

    // Kiểm tra intent điều khiển thiết bị
    if (
        msg.includes('thiết bị') ||
        msg.includes('máy') ||
        msg.includes('quạt') ||
        msg.includes('bơm') ||
        msg.includes('bật') ||
        msg.includes('tắt') ||
        msg.includes('device') ||
        msg.includes('fan') ||
        msg.includes('sục khí')
    ) {
        return 'DEVICE_CONTROL';
    }

    // Kiểm tra chào hỏi
    if (
        msg.includes('xin chào') ||
        msg.includes('hello') ||
        msg.includes('hi') ||
        msg.includes('chào')
    ) {
        return 'GREETING';
    }

    return 'GENERAL';
};

// ── Main API Function ───────────────────────────────────────────────────────────
/**
 * Gửi tin nhắn tới AI server và nhận phản hồi.
 *
 * @param text - Nội dung tin nhắn của người dùng
 * @returns AIResponse - Có thể chứa text thuần hoặc text + widget
 *
 * @example
 * // Khi tích hợp API thật, thay bằng:
 * const response = await fetch('https://api.example.com/chat', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ message: text, session_id: '...' })
 * });
 * const data = await response.json();
 * return {
 *   text: data.text,
 *   widget: data.tool_call ? { type: data.tool_call.name, data: data.tool_call.args } : undefined
 * };
 */
export const sendMessageToAI = async (text: string): Promise<AIResponse> => {
    // ⏳ Mô phỏng độ trễ mạng
    await mockDelay();

    // 🧠 Phát hiện intent (trong thực tế, LLM sẽ xử lý)
    const intent = detectIntent(text);

    switch (intent) {
        // ── Greeting: Trả về text thuần ──────────────────────────────────────
        case 'GREETING':
            return {
                text: '👋 Xin chào! Tôi là Mebieco AI Assistant.\n\nTôi có thể giúp bạn:\n• Xem thông số ao nuôi\n• Điều khiển thiết bị\n• Báo cáo tổng quan\n\nHãy thử hỏi "Thông số ao 1" hoặc "Bật quạt nước"!',
            };

        // ── Pond Status: Trả về text + widget POND_STATUS ────────────────────
        case 'POND_STATUS':
            return {
                text: '📊 Đây là thông số ao nuôi #1 hiện tại:',
                widget: {
                    type: 'POND_STATUS',
                    data: {
                        pond_id: 1,
                        pond_name: 'Ao nuôi #1',
                        temperature: 29.5,
                        ph: 7.8,
                        oxygen: 5.2,
                        salinity: 18.5,
                        turbidity: 25,
                    },
                },
            };

        // ── Device Control: Trả về text + widget DEVICE_CONTROL ──────────────
        case 'DEVICE_CONTROL':
            return {
                text: '⚙️ Đã tìm thấy thiết bị quạt nước:',
                widget: {
                    type: 'DEVICE_CONTROL',
                    data: {
                        device_id: 'fan_1',
                        device_name: 'Quạt nước #1',
                        status: 'ON',
                        device_type: 'FAN',
                    },
                },
            };

        // ── General: Trả về text fallback ────────────────────────────────────
        case 'GENERAL':
        default:
            return {
                text: '🤖 Cảm ơn bạn! Tôi có thể hỗ trợ bạn:\n\n• Xem thông số ao: "Tình trạng ao nuôi"\n• Điều khiển thiết bị: "Bật quạt nước"\n• Chào hỏi: "Xin chào"\n\nVui lòng thử lại với các câu lệnh trên!',
            };
    }
};
