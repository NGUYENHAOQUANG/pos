import { AppStackParamList } from '@/app/navigation/AppStack';

/**
 * @deprecated This type is kept for backward compatibility.
 * Please use AppStackParamList from '@/app/navigation/AppStack' instead.
 */
export type ControlStackParamList = AppStackParamList;

/**
 * @deprecated This navigator is no longer used.
 * The app now uses AppStack (Partner Pattern) for navigation.
 */
export const ControlNavigator = () => null;
