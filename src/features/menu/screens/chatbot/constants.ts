/**
 * @file constants.ts
 * @description Hằng số dùng chung cho Chatbot feature
 */

// ── Colors ──────────────────────────────────────────────────────────────────────
export const COLORS = {
    white: '#FFFFFF',
    black: '#000000',
    orange: '#FD6900',
    blue: '#006AFF',
    grayLight: '#F5F5F5',
    grayMedium: '#E0E0E0',
    grayText: '#6B7280',
    inputBg: '#F3F4F6',
    inputBorder: '#E6E8EC',
};

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
    { id: '1', text: 'Xem thông số Trại/Ao', color: '#E8F5E9' },
    { id: '2', text: 'Điều khiển thiết bị', color: '#E3F2FD' },
    { id: '3', text: 'Báo cáo tổng quan', color: '#FFF3E0' },
    { id: '4', text: 'Hỗ trợ kỹ thuật', color: '#F3E5F5' },
];

// ── Quick Reply Suggestions (hiển thị khi đã có message) ────────────────────
export const QUICK_REPLIES = [
    { id: '1', text: 'Xem thông số Trại/Ao' },
    { id: '2', text: 'Điều khiển thiết bị' },
    { id: '3', text: 'Báo cáo tổng quan' },
    { id: '4', text: 'Hỗ trợ kỹ thuật' },
];
