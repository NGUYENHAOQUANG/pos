import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import AnimatedSun from './AnimatedSun';
import type { SvgProps } from 'react-native-svg';

interface AnimatedPartlyCloudyProps extends SvgProps {
    readonly size?: number;
}

const AnimatedPartlyCloudy: React.FC<AnimatedPartlyCloudyProps> = ({
    size = 64,
    color = 'white',
    ...props
}) => {
    // The pristine standalone cloud path explicitly extracted from Snow.svg (perfectly intact variant)
    // viewBox: 0 0 28 28
    const cloudPath =
        'M25.3609 9.57534C25.2367 7.45144 24.3029 5.45601 22.7517 3.99991C21.2005 2.54381 19.1501 1.73791 17.0226 1.74814C14.8951 1.75838 12.8525 2.58397 11.3154 4.05491C9.77828 5.52586 8.86369 7.53019 8.75994 9.65519C8.74718 9.88195 8.64865 10.0954 8.48433 10.2522C8.32002 10.409 8.10221 10.4974 7.8751 10.4996H7.80947C7.57849 10.4789 7.36467 10.369 7.21351 10.1931C7.06236 10.0172 6.98579 9.78931 7.0001 9.55784C7.0305 8.94947 7.11579 8.34509 7.25494 7.75206C7.27289 7.6776 7.27098 7.59973 7.2494 7.52624C7.22782 7.45275 7.18732 7.38621 7.13195 7.33328C7.07659 7.28035 7.0083 7.24289 6.93391 7.22463C6.85952 7.20637 6.78165 7.20797 6.70807 7.22925C5.52363 7.57918 4.48499 8.30452 3.74857 9.296C3.01216 10.2875 2.61787 11.4914 2.6251 12.7264C2.64697 15.8666 5.26322 18.3746 8.40447 18.3746H17.0626C18.1948 18.3733 19.3149 18.141 20.3543 17.6919C21.3936 17.2427 22.3304 16.5862 23.1072 15.7625C23.884 14.9388 24.4845 13.9652 24.8721 12.9013C25.2596 11.8375 25.4259 10.7057 25.3609 9.57534Z';

    return (
        <View style={{ width: size, height: size }}>
            {/* The Sun layer explicitly pushed up and left so it peeks out prominently */}
            <View style={{ position: 'absolute', top: -size * 0.125, left: -size * 0.15 }}>
                <AnimatedSun size={size * 0.9} color={color} />
            </View>

            {/* The Cloud layer proudly sitting in front and standing still */}
            <View style={{ position: 'absolute', top: size * 0.125, left: 0 }}>
                <Svg width={size} height={size} viewBox="0 0 28 28" {...props}>
                    <Path d={cloudPath} fill={color} />
                </Svg>
            </View>
        </View>
    );
};

export default AnimatedPartlyCloudy;
