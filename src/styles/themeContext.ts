import { createContext, useContext } from 'react';
import { colors, type Colors } from './colors';

export const AppThemeContext = createContext<Colors>(colors);

export const useAppTheme = () => useContext(AppThemeContext);
