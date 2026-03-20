import { Dimensions } from 'react-native';
import { spacing } from '@/styles';
export const SCREEN_WIDTH = Dimensions.get('window').width;
export const CHART_WIDTH = SCREEN_WIDTH - spacing.lg * 2;
export const CHART_HEIGHT = 350;

export const PADDING_LEFT = 70;
export const PADDING_RIGHT = 20;
export const PADDING_TOP = 30;
export const PADDING_BOTTOM = 40;
