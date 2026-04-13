import { useKeyboardState } from 'react-native-keyboard-controller';

/**
 * Hook that tracks keyboard visibility and height using react-native-keyboard-controller.
 * Unlike RN core Keyboard events, this does NOT trigger falsely when
 * iOS notification center or control center is pulled down.
 */
export function useKeyboard() {
    const isVisible = useKeyboardState(state => state.isVisible);
    const height = useKeyboardState(state => state.height);

    return {
        keyboardVisible: isVisible,
        keyboardHeight: height,
    };
}
