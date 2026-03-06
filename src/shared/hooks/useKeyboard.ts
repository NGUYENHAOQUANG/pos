import { useEffect, useState } from 'react';
import { Keyboard, KeyboardEvent, Platform, AppState, AppStateStatus } from 'react-native';

export function useKeyboard() {
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    useEffect(() => {
        const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

        const onKeyboardShow = (e: KeyboardEvent) => {
            setKeyboardVisible(true);
            setKeyboardHeight(e.endCoordinates.height);
        };

        const onKeyboardHide = () => {
            setKeyboardVisible(false);
            setKeyboardHeight(0);
        };

        const showSubscription = Keyboard.addListener(showEvent, onKeyboardShow);
        const hideSubscription = Keyboard.addListener(hideEvent, onKeyboardHide);

        // Reset keyboard state when app goes to background to prevent "jump" issues on return
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            if (nextAppState !== 'active') {
                setKeyboardVisible(false);
                setKeyboardHeight(0);
            }
        };

        const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
            appStateSubscription.remove();
        };
    }, []);

    return { keyboardVisible, keyboardHeight };
}
