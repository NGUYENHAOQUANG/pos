/**
 * @file validation.ts
 * @description Validation utilities
 * @author Kindy
 * @created 2025-11-16
 */
import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string().email('Invalid email address');
export const passwordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number');

export const phoneSchema = z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(11, 'Phone number must be at most 11 digits')
    .regex(/^[0-9]+$/, 'Phone number must contain only digits');

// Validation helpers
export function validateEmail(email: string): boolean {
    return emailSchema.safeParse(email).success;
}

// Numeric string validation (digits and optional single dot)
export const numericStringSchema = z.string().regex(/^\d*\.?\d*$/, 'Only numbers allowed');

// Integer string validation (digits only, no decimal point)
export const integerStringSchema = z.string().regex(/^\d+$/, 'Only whole numbers allowed');

export function validatePassword(password: string): boolean {
    return passwordSchema.safeParse(password).success;
}

/**
 * Validate if a string contains only integer digits (no decimal point)
 * @param value - String to validate
 * @returns true if valid integer string, false otherwise
 */
export function validateIntegerString(value: string): boolean {
    if (value === '') return true; // Allow empty for optional fields
    return integerStringSchema.safeParse(value).success;
}

/**
 * Filter input to allow only integer digits (0-9)
 * Removes any non-digit characters including decimal points
 * @param text - Input text
 * @returns Filtered text containing only digits
 */
export function handleIntegerInput(text: string): string {
    // Remove any character that is not 0-9
    return text.replace(/[^0-9]/g, '');
}
