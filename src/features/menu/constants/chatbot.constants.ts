/**
 * @file chatbot.constants.ts
 * @description Hằng số dùng chung cho Chatbot feature
 */

// ── Bot & User ──────────────────────────────────────────────────────────────────
/** Thông tin user của bot (dùng cho GiftedChat) */
export const BOT_USER = {
    _id: 2,
    name: 'Mebieco AI',
    avatar: undefined,
};

/** ID user hiện tại */
export const CURRENT_USER_ID = 1;

// ── Suggestion Chips cho Welcome (hiển thị khi chưa có message) ─────────────
export const WELCOME_SUGGESTIONS = [
    { id: '1', text: 'Làm sao để nuôi tôm hiệu quả?' },
    { id: '2', text: 'Quản lý kho như thế nào?' },
    { id: '3', text: 'Mebieco có những thiết bị gì?' },
    { id: '4', text: 'Hiện có cảnh báo nào không?' },
];

// ── Quick Reply Suggestions (hiển thị khi đã có message) ────────────────────
export const QUICK_REPLIES = [
    { id: '1', text: 'Làm sao để nuôi tôm hiệu quả?' },
    { id: '2', text: 'Quản lý kho như thế nào?' },
    { id: '3', text: 'Mebieco có những thiết bị gì?' },
    { id: '4', text: 'Hiện có cảnh báo nào không?' },
];
