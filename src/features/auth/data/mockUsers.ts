/**
 * @file mockUsers.ts
 * @description Mock data for unregistered phone numbers
 * @author HUYPHAM
 * @created 2026-01-14
 */

/**
 * Số điện thoại chưa được đăng ký trong hệ thống
 * Sử dụng mock data khi không có API
 */
export const UNREGISTERED_PHONE_NUMBER = '0908456789';

/**
 * Kiểm tra số điện thoại có được đăng ký hay không
 * @param phoneNumber - Số điện thoại cần kiểm tra (đã format: 0908123456)
 * @returns true nếu số điện thoại đã được đăng ký (không phải số unregistered)
 */
export const isPhoneRegistered = (phoneNumber: string): boolean => {
    const cleanedPhone = phoneNumber.replace(/\s/g, '');
    // Nếu số điện thoại trùng với số unregistered thì chưa đăng ký
    return cleanedPhone !== UNREGISTERED_PHONE_NUMBER;
};
