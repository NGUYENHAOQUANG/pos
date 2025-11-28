import React from 'react';
import { View } from 'react-native';
import FanActiveSvg from '@/assets/images/fan-active.svg';
import FanDeactiveSvg from '@/assets/images/fan-deactive.svg';
import XyphonSvg from '@/assets/images/xyphon.svg';

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
