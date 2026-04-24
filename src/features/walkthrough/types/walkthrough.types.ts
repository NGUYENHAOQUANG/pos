export interface OnboardingStepConfig {
    module: 'farm' | 'material' | 'account' | 'report';
    /** Numeric index used by the store to track progress */
    stepIndex: number;
    /** Tooltip title */
    title: string;
    /** Tooltip description */
    description: string;
    /** Tooltip placement relative to the target */
    placement: 'top' | 'bottom' | 'left' | 'right';
    /** Whether this is the final step (shows "Hoàn thành" instead of "Tiếp tục") */
    isLastStep?: boolean;
    /** Whether to allow users to interact with the underlying UI element */
    allowInteraction?: boolean;
    /** Optional delay in ms before showing tooltip (useful for complex screen transitions, defaults to 150ms) */
    delay?: number;
}
