/**
 * @file formatters.ts
 * @description Formatter utilities
 * @author Kindy
 * @created 2025-11-16
 */

export function formatCurrencyValue(value: number): string {
    return value.toLocaleString('en-US');
}

export function formatNumericInput(text: string): string {
    return text.replace(/[^0-9]/g, '');
}

export function formatDecimalInput(
    text: string,
    maxIntegerDigits: number = 15,
    maxDecimalDigits: number = 5
): string {
    // 1. Remove any character that is not 0-9 or .
    let cleaned = text.replace(/[^0-9.]/g, '');

    // 2. Prevent . at the beginning
    if (cleaned.startsWith('.')) {
        cleaned = cleaned.substring(1);
    }

    // 3. Ensure only one . exists
    const parts = cleaned.split('.');
    if (parts.length > 2) {
        cleaned = parts[0] + '.' + parts.slice(1).join('');
    }

    // 4. Limit integer digits
    const [intPart, decPart] = cleaned.split('.');
    const limitedInt = intPart.slice(0, maxIntegerDigits);

    // 5. Limit decimal digits
    if (decPart !== undefined) {
        const limitedDec = decPart.slice(0, maxDecimalDigits);
        return `${limitedInt}.${limitedDec}`;
    }

    return limitedInt;
}

export interface AbbreviatedNumber {
    abbreviated: string;
    full: string;
    detail: string;
    isAbbreviated: boolean;
}

// Convert number to plain string without scientific notation
function toFullNumberString(value: number): string {
    const absValue = Math.abs(value);
    if (absValue < 1e15) {
        return value.toLocaleString('en-US').replace(/,/g, ' ');
    }
    // Parse scientific notation manually (e.g. "9.34e+29")
    const str = Math.round(absValue).toString();
    let plainStr: string;
    if (str.includes('e+') || str.includes('e')) {
        const [base, exp] = str.split(/[eE]\+?/);
        const e = parseInt(exp, 10);
        const [intPart, decPart = ''] = base.split('.');
        const digits = intPart + decPart;
        const zerosNeeded = e - decPart.length;
        plainStr = digits + '0'.repeat(Math.max(0, zerosNeeded));
    } else {
        plainStr = str;
    }
    const sign = value < 0 ? '-' : '';
    return sign + plainStr.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function toVietnameseDetail(value: number): string {
    const absValue = Math.abs(value);
    const sign = value < 0 ? 'âm ' : '';
    const parts: string[] = [];

    const tyTy = Math.floor(absValue / 1e18);
    const trieuTy = Math.floor((absValue % 1e18) / 1e15);
    const nghinTy = Math.floor((absValue % 1e15) / 1e12);
    const ty = Math.floor((absValue % 1e12) / 1e9);
    const trieu = Math.floor((absValue % 1e9) / 1e6);
    const nghin = Math.floor((absValue % 1e6) / 1e3);
    const donVi = Math.floor(absValue % 1e3);

    if (tyTy > 0) parts.push(`${tyTy} tỷ tỷ`);
    if (trieuTy > 0) parts.push(`${trieuTy} triệu tỷ`);
    if (nghinTy > 0) parts.push(`${nghinTy} nghìn tỷ`);
    if (ty > 0) parts.push(`${ty} tỷ`);
    if (trieu > 0) parts.push(`${trieu} triệu`);
    if (nghin > 0) parts.push(`${nghin} nghìn`);
    if (donVi > 0 && parts.length > 0) parts.push(`${donVi}`);
    else if (parts.length === 0) parts.push(`${absValue}`);

    return `${sign}${parts.join(' ')}`;
}

export function abbreviateNumber(value: number): AbbreviatedNumber {
    const full = toFullNumberString(value);
    const absValue = Math.abs(value);
    const sign = value < 0 ? '-' : '';
    const detail = toVietnameseDetail(value);

    // Tỷ Tỷ (1e18)
    if (absValue >= 1e18) {
        const num = absValue / 1e18;
        const formatted = num % 1 === 0 ? num.toString() : num.toFixed(1).replace(/\.0$/, '');
        return { abbreviated: `${sign}${formatted} Tỷ Tỷ`, full, detail, isAbbreviated: true };
    }

    // Triệu Tỷ (1e15)
    if (absValue >= 1e15) {
        const num = absValue / 1e15;
        const formatted = num % 1 === 0 ? num.toString() : num.toFixed(1).replace(/\.0$/, '');
        return { abbreviated: `${sign}${formatted} Triệu Tỷ`, full, detail, isAbbreviated: true };
    }

    // Nghìn Tỷ (1e12)
    if (absValue >= 1e12) {
        const num = absValue / 1e12;
        const formatted = num % 1 === 0 ? num.toString() : num.toFixed(1).replace(/\.0$/, '');
        return { abbreviated: `${sign}${formatted} Nghìn Tỷ`, full, detail, isAbbreviated: true };
    }

    // Tỷ (1e9)
    if (absValue >= 1e9) {
        const num = absValue / 1e9;
        const formatted = num % 1 === 0 ? num.toString() : num.toFixed(1).replace(/\.0$/, '');
        return { abbreviated: `${sign}${formatted} Tỷ`, full, detail, isAbbreviated: true };
    }

    // Triệu (1e6)
    if (absValue >= 1e6) {
        const num = absValue / 1e6;
        const formatted = num % 1 === 0 ? num.toString() : num.toFixed(1).replace(/\.0$/, '');
        return { abbreviated: `${sign}${formatted} Triệu`, full, detail, isAbbreviated: true };
    }

    // Nghìn (1e4+)
    if (absValue >= 10_000) {
        const num = absValue / 1_000;
        const formatted = num % 1 === 0 ? num.toString() : num.toFixed(1).replace(/\.0$/, '');
        return { abbreviated: `${sign}${formatted} Nghìn`, full, detail, isAbbreviated: true };
    }

    return { abbreviated: full, full, detail, isAbbreviated: false };
}
