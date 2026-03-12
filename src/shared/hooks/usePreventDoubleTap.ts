import { useCallback, useRef, useState } from 'react';

/**
 * Custom hook to prevent double tap/spam clicking on buttons.
 * Supports both sync and async callbacks:
 * - For async callbacks: blocks until the Promise resolves/rejects
 * - For sync callbacks: blocks for the specified delay
 *
 * @param callback The function to execute on press (sync or async)
 * @param delay The minimum delay in ms to ignore subsequent presses (default: 500)
 * @returns [safePressHandler, isProcessing] - handler and loading state
 */
export const usePreventDoubleTap = (
    callback?: (...args: unknown[]) => void | Promise<void>,
    delay: number = 500
): [(...args: unknown[]) => void, boolean] => {
    const isBlocked = useRef(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const handler = useCallback(
        (...args: unknown[]) => {
            if (!callback || isBlocked.current) return;

            // Block subsequent calls
            isBlocked.current = true;

            // Execute the callback immediately on the first tap
            const result = callback(...args);

            // If callback returns a Promise, wait for it to complete
            if (result && typeof (result as Promise<void>).then === 'function') {
                setIsProcessing(true);
                const unblock = () => {
                    isBlocked.current = false;
                    setIsProcessing(false);
                };
                (result as Promise<void>).then(unblock, unblock);
            } else {
                // For sync callbacks, unblock after the delay
                setTimeout(() => {
                    isBlocked.current = false;
                }, delay);
            }
        },
        [callback, delay]
    );

    return [handler, isProcessing];
};
