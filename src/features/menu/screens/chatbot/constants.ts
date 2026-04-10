/**
 * @file constants.ts
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
    { id: '1', text: 'Xem thông số Trại/Ao' },
    { id: '2', text: 'Điều khiển thiết bị' },
    { id: '3', text: 'Báo cáo tổng quan' },
    { id: '4', text: 'Hỗ trợ kỹ thuật' },
];

// ── Quick Reply Suggestions (hiển thị khi đã có message) ────────────────────
export const QUICK_REPLIES = [
    { id: '1', text: 'Xem thông số Trại/Ao' },
    { id: '2', text: 'Điều khiển thiết bị' },
    { id: '3', text: 'Báo cáo tổng quan' },
    { id: '4', text: 'Hỗ trợ kỹ thuật' },
];
