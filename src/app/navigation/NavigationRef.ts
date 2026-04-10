/**
 * @file navigationRef.ts
 * @description Global navigation ref for navigating from outside screen components
 * (e.g., floating buttons, services, etc.)
 */
import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

/**
 * Navigate to a screen from anywhere in the app.
 * Safe to call even before the NavigationContainer is ready.
 */
export function navigate(name: string, params?: object) {
    if (navigationRef.isReady()) {
        // @ts-ignore - dynamic route name
        navigationRef.navigate(name, params);
    }
}
