/**
 * @file useKeyboard.ts
 * @description useKeyboard hook
 * @author Kindy
 * @created 2025-11-16
 */
import { useEffect, useState } from 'react';
import { Keyboard, KeyboardEvent } from 'react-native';

export function useKeyboard() {
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    useEffect(() => {
        const showSubscription = Keyboard.addListener('keyboardDidShow', (e: KeyboardEvent) => {
            setKeyboardVisible(true);
            const raw = e.endCoordinates.height;
            setKeyboardHeight(Math.max(0, raw - 24));
        });

        const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardVisible(false);
            setKeyboardHeight(0);
        });

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);
    return { keyboardVisible, keyboardHeight };
}
