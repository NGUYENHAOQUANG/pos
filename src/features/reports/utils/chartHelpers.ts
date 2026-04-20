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

// ---------------------------------------------------------------------------
// Flexible X-Axis Label Visibility
// ---------------------------------------------------------------------------

interface FlexibleXLabelConfig {
    /** Total number of data points on the X axis */
    totalPoints: number;
    /** Available pixel width for the X axis area */
    availableWidth: number;
    /** Minimum pixel width each label needs to avoid overlap (default 45) */
    minLabelWidth?: number;
    /** Always include the first label (default true) */
    alwaysShowFirst?: boolean;
    /** Always include the last label (default true) */
    alwaysShowLast?: boolean;
}

interface FlexibleXLabelResult {
    /** Set of indices that should have their label rendered */
    visibleIndices: Set<number>;
    /** The calculated step between visible labels */
    step: number;
}

/**
 * Determine which X-axis labels should be visible so they never overlap.
 *
 * The algorithm:
 * 1. Calculate how many labels can fit: `maxLabels = floor(availableWidth / minLabelWidth)`.
 * 2. Derive a step: `step = ceil(totalPoints / maxLabels)`.
 * 3. Mark indices at every `step` starting from 0, plus force-include the last
 *    index (skipping it if it would collide with the previous visible label at
 *    less than half-step distance).
 */
export const calculateFlexibleXLabels = ({
    totalPoints,
    availableWidth,
    minLabelWidth = 45,
    alwaysShowFirst = true,
    alwaysShowLast = true,
}: FlexibleXLabelConfig): FlexibleXLabelResult => {
    const result: Set<number> = new Set();

    // Edge cases
    if (totalPoints <= 0) return { visibleIndices: result, step: 1 };
    if (totalPoints === 1) {
        result.add(0);
        return { visibleIndices: result, step: 1 };
    }

    // How many labels can fit without overlapping?
    const maxLabels = Math.max(1, Math.floor(availableWidth / minLabelWidth));

    // If all labels fit, show them all
    if (totalPoints <= maxLabels) {
        for (let i = 0; i < totalPoints; i++) result.add(i);
        return { visibleIndices: result, step: 1 };
    }

    // Calculate step – how many data-point intervals between visible labels
    const step = Math.ceil(totalPoints / maxLabels);

    // Place labels at regular intervals starting from 0
    for (let i = 0; i < totalPoints; i += step) {
        result.add(i);
    }

    // Force first
    if (alwaysShowFirst) result.add(0);

    // Force last — but skip if too close to the previous visible label
    if (alwaysShowLast) {
        const lastIndex = totalPoints - 1;
        // Find the highest visible index before the last
        let prevVisible = -Infinity;
        for (const idx of result) {
            if (idx < lastIndex && idx > prevVisible) prevVisible = idx;
        }
        // Only add last if it's at least half a step away from the previous
        if (lastIndex - prevVisible >= Math.ceil(step / 2)) {
            result.add(lastIndex);
        }
    }

    return { visibleIndices: result, step };
};
