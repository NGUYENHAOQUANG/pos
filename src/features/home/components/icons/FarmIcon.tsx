import React from 'react';
import Svg, { Rect, Path, Circle } from 'react-native-svg';

interface FarmIconProps {
  size?: number;
  color?: string;
  bgColor?: string;
}

export const FarmIcon: React.FC<FarmIconProps> = ({
  size = 44,
  color = '#FFA769',
  bgColor = '#FFE8DE',
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 44 44">
      {/* Background circle */}
      <Circle cx="22" cy="22" r="22" fill={bgColor} />
      
      {/* Dashed border square (crop marks style) */}
      <Rect
        x="8"
        y="8"
        width="28"
        height="28"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeDasharray="2 2"
        rx="2"
      />
      
      {/* Corner crop marks */}
      <Path d="M8 8 L10 8 M8 8 L8 10" stroke={color} strokeWidth="1.5" />
      <Path d="M36 8 L34 8 M36 8 L36 10" stroke={color} strokeWidth="1.5" />
      <Path d="M8 36 L10 36 M8 36 L8 34" stroke={color} strokeWidth="1.5" />
      <Path d="M36 36 L34 36 M36 36 L36 34" stroke={color} strokeWidth="1.5" />
      
      {/* House at top center */}
      <Path
        d="M19 14 L22 11 L25 14 L25 17 L19 17 Z"
        fill={color}
      />
      
      {/* Pond squares with waves - bottom row */}
      {/* Pond 1 */}
      <Rect x="11" y="24" width="6" height="6" rx="1" fill={color} opacity="0.4" />
      <Path
        d="M12 26.5 Q13 25.5, 14 26.5 T16 26.5"
        stroke="white"
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M12 27.5 Q13 26.5, 14 27.5 T16 27.5"
        stroke="white"
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
      />
      
      {/* Pond 2 */}
      <Rect x="19" y="24" width="6" height="6" rx="1" fill={color} opacity="0.4" />
      <Path
        d="M20 26.5 Q21 25.5, 22 26.5 T24 26.5"
        stroke="white"
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M20 27.5 Q21 26.5, 22 27.5 T24 27.5"
        stroke="white"
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
      />
      
      {/* Pond 3 */}
      <Rect x="27" y="24" width="6" height="6" rx="1" fill={color} opacity="0.4" />
      <Path
        d="M28 26.5 Q29 25.5, 30 26.5 T32 26.5"
        stroke="white"
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M28 27.5 Q29 26.5, 30 27.5 T32 27.5"
        stroke="white"
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  );
};

