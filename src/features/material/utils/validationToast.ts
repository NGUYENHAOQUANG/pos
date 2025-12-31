import Toast from 'react-native-toast-message';

/**
 * Show a standardized error toast for validation failures.
 * @param message The error message to display
 */
export const showValidationError = (message: string) => {
    Toast.show({
        type: 'error',
        text1: message,
        position: 'top',
        visibilityTime: 3000,
    });
};
