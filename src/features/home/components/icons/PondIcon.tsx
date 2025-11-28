import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

interface PondIconProps {
  size?: number;
  color?: string;
  bgColor?: string;
}

export const PondIcon: React.FC<PondIconProps> = ({
  size = 44,
  color = '#0076F7',
  bgColor = '#EBF7FF',
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 44 44">
      {/* Background circle */}
      <Circle cx="22" cy="22" r="22" fill={bgColor} />

      {/* Dark blue/black square */}
      <Rect x="10" y="10" width="24" height="24" rx="2" fill={color} />

      {/* White water waves - 3 horizontal wavy lines */}
      <Path
        d="M13 18 Q14.5 16.5, 16 18 T19 18 T22 18 T25 18 T28 18 T31 18"
        stroke="white"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M13 22 Q14.5 20.5, 16 22 T19 22 T22 22 T25 22 T28 22 T31 22"
        stroke="white"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M13 26 Q14.5 24.5, 16 26 T19 26 T22 26 T25 26 T28 26 T31 26"
        stroke="white"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  );
};
