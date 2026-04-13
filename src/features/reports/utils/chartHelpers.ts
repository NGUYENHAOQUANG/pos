/**
 * Helper utilities for chart components
 */

/**
 * @param yTicks
 * @param formatter
 * @param fontSize
 * @param basePadding
 */
export const calculateDynamicYAxisWidth = <T extends number | string>(
    yTicks: T[],
    formatter: (val: T) => string = val => String(val),
    fontSize: number = 12,
    basePadding: number = 24
): number => {
    if (!yTicks || yTicks.length === 0) return 35;

    // Find the length of the largest formatted string
    const maxLength = yTicks.reduce((max, val) => {
        const length = formatter(val).length;
        return Math.max(max, length);
    }, 0);

    // Approximation: width of char ~ fontSize * 0.55. Add padding.
    const calculatedWidth = maxLength * fontSize * 0.55 + basePadding;

    // Clamp maximum width
    return Math.min(calculatedWidth, 150);
};
