/**
 * Helper utilities for chart components
 */

/**
 * Calculates a dynamic Y-axis width based on the tick values ensuring no overlaps or cut-offs
 *
 * @param yTicks Array of numerical tick values generated for the Y axis
 * @param formatter Optional formatting function to convert ticks to display strings
 * @param fontSize Font size used for rendering labels (default: 12)
 * @param basePadding Additional padding for axis lines/spacing (default: 24 to allow 16px left margin + 8px right gap)
 * @returns The calculated appropriate width for the Y axis (clamped between 35 and 100)
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
