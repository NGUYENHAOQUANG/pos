import React, { createContext, useContext } from 'react';

/**
 * @deprecated This context is no longer needed with the Partner Pattern.
 * Tab bar visibility is now handled automatically by the navigation structure (AppStack vs MainNavigator).
 */
export const TabBarVisibilityContext = createContext({
    isTabBarVisible: true,
    setTabBarVisible: (_visible: boolean) => {},
});

/**
 * @deprecated No-op hook. Tab bar visibility is managed automatically.
 */
export const useTabBarVisibility = () => useContext(TabBarVisibilityContext);

/**
 * @deprecated No-op provider.
 */
export const TabBarVisibilityProvider = ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>;
};

// Deprecated constants/hooks if still used implicitly
export const TAB_BAR_HEIGHT = 70;
export const useTabBarHeight = () => TAB_BAR_HEIGHT;
