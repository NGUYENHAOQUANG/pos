/**
 * @file validation.ts
 * @description Validation utilities
 * @author Kindy
 * @created 2025-11-16
 */
import { z } from 'zod';

// Numeric string validation (digits and optional single dot)
export const numericStringSchema = z.string().regex(/^\d*\.?\d*$/, 'Only numbers allowed');

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
