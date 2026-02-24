import { useCallback, useRef } from 'react';

/**
 * Custom hook to prevent double tap/spam clicking on buttons.
 * It immediately executes the callback on the first click and ignores subsequent clicks within the specified delay.
 *
 * @param callback The function to execute on press
 * @param delay The delay in milliseconds to ignore subsequent presses
 * @returns A safe version of the callback that prevents double taps
 */
export const usePreventDoubleTap = (
    callback?: (...args: unknown[]) => void,
    delay: number = 500
) => {
    const isBlocked = useRef(false);

    return useCallback(
        (...args: unknown[]) => {
            if (!callback || isBlocked.current) return;

            // Block subsequent calls
            isBlocked.current = true;

            // Execute the callback immediately on the first tap
            callback(...args);

            // Unblock after the delay
            setTimeout(() => {
                isBlocked.current = false;
            }, delay);
        },
        [callback, delay]
    );
};
