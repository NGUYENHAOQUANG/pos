import React, { createContext, useContext, useState, ReactNode } from 'react';

interface TabBarVisibilityContextType {
  isTabBarVisible: boolean;
  setTabBarVisible: (visible: boolean) => void;
}

export const TabBarVisibilityContext = createContext<TabBarVisibilityContextType>({
  isTabBarVisible: true,
  setTabBarVisible: () => { },
});

export const useTabBarVisibility = () => useContext(TabBarVisibilityContext);

interface TabBarVisibilityProviderProps {
  children: ReactNode;
}

export const TabBarVisibilityProvider: React.FC<TabBarVisibilityProviderProps> = ({ children }) => {
  const [isTabBarVisible, setTabBarVisible] = useState(true);

  return (
    <TabBarVisibilityContext.Provider value={{ isTabBarVisible, setTabBarVisible }}>
      {children}
    </TabBarVisibilityContext.Provider>
  );
};
