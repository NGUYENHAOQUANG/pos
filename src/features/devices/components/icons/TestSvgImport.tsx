import React from 'react';
import { View } from 'react-native';
import FanActiveSvg from '@/assets/Icon/fan-active.svg';
import FanDeactiveSvg from '@/assets/Icon/fan-deactive.svg';
import XyphonSvg from '@/assets/Icon/xyphon.svg';

/**
 * Test component to verify SVG import setup
 * This file can be deleted after verification
 */
export function TestSvgImport() {
    return (
        <View>
            <FanActiveSvg width={40} height={40} />
            <FanDeactiveSvg width={40} height={40} />
            <XyphonSvg width={40} height={40} />
        </View>
    );
}
