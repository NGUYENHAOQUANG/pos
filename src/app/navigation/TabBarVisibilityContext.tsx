import { createContext, useContext } from 'react';

interface TabBarVisibilityContextType {
  isTabBarVisible: boolean;
  setTabBarVisible: (visible: boolean) => void;
}

export const TabBarVisibilityContext = createContext<TabBarVisibilityContextType>({
  isTabBarVisible: true,
  setTabBarVisible: () => {},
});

export const useTabBarVisibility = () => useContext(TabBarVisibilityContext);
