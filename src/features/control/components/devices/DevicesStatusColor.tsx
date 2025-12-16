import React from 'react';
import { SvgProps } from 'react-native-svg';
import { colors } from '@/styles/colors';
import { StyleProp, ViewStyle } from 'react-native';

interface DevicesStatusColorProps {
  icon: React.FC<SvgProps>;
  isOn: boolean;
  errorMessage?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export const DevicesStatusColor: React.FC<DevicesStatusColorProps> = ({
  icon: Icon,
  isOn,
  errorMessage,
  size = 48,
  style,
}) => {
  let iconColor: string | undefined;

  if (errorMessage) {
    iconColor = colors.error;
  } else if (isOn) {
    iconColor = colors.primary;
  } else {
    iconColor = colors.text; // Default text color (usually black/dark gray) for inactive state
  }

  // We pass both 'color' and 'fill' ensuring maximum compatibility depending on how the SVG deals with props.
  // Ideally, if the SVG has hardcoded colors, this might not work without 'currentColor',
  // but we are strictly following "Do not edit SVG" instruction.
  return <Icon width={size} height={size} color={iconColor} fill={iconColor} style={style} />;
};
