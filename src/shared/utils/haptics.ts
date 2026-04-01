/**
 * @file haptics.ts
 * @description Centralized haptic feedback utilities for premium tactile interactions.
 * Respects user settings — can be toggled off via settingsStore.
 *
 * Usage:
 *   import { haptics } from '@/shared/utils/haptics';
 *   haptics.light();   // Tab switch, dropdown select
 *   haptics.medium();  // Toggle device, button press
 *   haptics.success(); // Save, create, login success
 *   haptics.error();   // API error, validation fail
 *   haptics.warning(); // Delete confirm, destructive action
 */
import ReactNativeHapticFeedback, { HapticFeedbackTypes } from 'react-native-haptic-feedback';
import { useSettingsStore } from '@/features/menu/store/settingsStore';

/** Default options for haptic feedback */
const DEFAULT_OPTIONS = {
    enableVibrateFallback: true,
    ignoreAndroidSystemSettings: false,
};

/** Guard — skip if user disabled haptics */
const trigger = (type: HapticFeedbackTypes) => {
    if (!useSettingsStore.getState().hapticEnabled) return;
    ReactNativeHapticFeedback.trigger(type, DEFAULT_OPTIONS);
};

/**
 * Haptic feedback helper with semantic naming
 */
export const haptics = {
    /** Light tap — tab switch, dropdown select, checkbox toggle */
    light: () => trigger(HapticFeedbackTypes.impactLight),

    /** Medium tap — device toggle, important button press */
    medium: () => trigger(HapticFeedbackTypes.impactMedium),

    /** Heavy tap — long press action, drag end */
    heavy: () => trigger(HapticFeedbackTypes.impactHeavy),

    /** Success notification — save, create, login completed */
    success: () => trigger(HapticFeedbackTypes.notificationSuccess),

    /** Error notification — API error, validation failure */
    error: () => trigger(HapticFeedbackTypes.notificationError),

    /** Warning notification — delete confirmation, destructive action */
    warning: () => trigger(HapticFeedbackTypes.notificationWarning),

    /** Selection change — picker scroll, segment control change */
    selection: () => trigger(HapticFeedbackTypes.selection),
};
