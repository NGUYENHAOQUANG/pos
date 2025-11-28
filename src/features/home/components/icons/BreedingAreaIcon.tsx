import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

interface BreedingAreaIconProps {
  size?: number;
  color?: string;
  bgColor?: string;
}

export const BreedingAreaIcon: React.FC<BreedingAreaIconProps> = ({
  size = 44,
  color = '#11B3B8',
  bgColor = '#EBF7FF',
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 44 44">
      <Circle cx="22" cy="22" r="22" fill={bgColor} />
      <Path
        d="M10 16 Q10 12, 14 12 Q18 12, 20 14 Q22 13, 24 14 Q26 15, 28 14 Q30 13, 32 14 Q34 15, 34 18 Q34 20, 33 22 Q32 24, 31 26 Q30 28, 28 29 Q26 30, 24 30 Q22 30, 20 29 Q18 28, 16 26 Q14 24, 12 22 Q10 20, 10 18 Z"
        fill={color}
        fillOpacity="0.3"
        stroke={color}
        strokeWidth="1.2"
      />
      
      {/* House 1 - Top left area - WHITE */}
      <Path
        d="M14 18 L15.5 16.5 L17 18 L17 20 L14 20 Z"
        fill="white"
      />
      
      {/* House 2 - Top right area - WHITE */}
      <Path
        d="M26 17 L27.5 15.5 L29 17 L29 19 L26 19 Z"
        fill="white"
      />
      
      {/* House 3 - Bottom center area - WHITE */}
      <Path
        d="M20 25 L21.5 23.5 L23 25 L23 27 L20 27 Z"
        fill="white"
      />
    </Svg>
  );
};

