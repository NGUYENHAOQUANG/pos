/**
 * @file BottomBarContext.tsx
 * @description Context to provide the bottom tab bar height to child screens,
 * allowing them to add padding to avoid content being clipped by the absolute-positioned bar.
 */
import React, { createContext, useContext, useState, useCallback } from 'react';
import { LayoutChangeEvent } from 'react-native';

interface BottomBarContextValue {
    /** Total height of the bottom bar including margins and safe area */
    bottomBarHeight: number;
    /** Callback to measure the bar height via onLayout */
    onBarLayout: (event: LayoutChangeEvent) => void;
}

const BottomBarContext = createContext<BottomBarContextValue>({
    bottomBarHeight: 0,
    onBarLayout: () => {},
});

export const BottomBarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [bottomBarHeight, setBottomBarHeight] = useState(0);

    const onBarLayout = useCallback((event: LayoutChangeEvent) => {
        const { height } = event.nativeEvent.layout;
        // Total offset from bottom = bar height + bar's bottom position
        setBottomBarHeight(height + 48); // 16px extra buffer for margin/spacing
    }, []);

    return (
        <BottomBarContext.Provider value={{ bottomBarHeight, onBarLayout }}>
            {children}
        </BottomBarContext.Provider>
    );
};

/**
 * Hook to get the bottom tab bar height.
 * Use this to add paddingBottom to scrollable content in tab screens.
 *
 * @example
 * const bottomBarHeight = useBottomTabBarHeight();
 * <ScrollView contentContainerStyle={{ paddingBottom: bottomBarHeight }}>
 */
export const useBottomTabBarHeight = (): number => {
    const { bottomBarHeight } = useContext(BottomBarContext);
    return bottomBarHeight;
};

export default BottomBarContext;
