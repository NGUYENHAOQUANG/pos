import { ImageSourcePropType } from 'react-native';

// Use PNG images instead of SVG for performance optimization
// PNG files are ~300x smaller than the embedded-raster SVG originals
const FanIcon = require('@/assets/Icon/IconDevices/Fan.png');
const FeederIcon = require('@/assets/Icon/IconDevices/Feeder.png');
const OxyIcon = require('@/assets/Icon/IconDevices/Oxy.png');
const SyphonIcon = require('@/assets/Icon/IconDevices/Syphon.png');
const PumpIcon = require('@/assets/Icon/IconDevices/Pump.png');
const WrapperIcon = require('@/assets/Icon/IconDevices/wrapper.png');

export const getDeviceIcon = (type: string): ImageSourcePropType => {
    switch (type) {
        case 'feeder':
            return FeederIcon as ImageSourcePropType;
        case 'fan':
            return FanIcon as ImageSourcePropType;
        case 'oxy':
            return OxyIcon as ImageSourcePropType;
        case 'syphon':
            return SyphonIcon as ImageSourcePropType;
        case 'pump':
            return PumpIcon as ImageSourcePropType;
        case 'wrapper':
            return WrapperIcon as ImageSourcePropType;
        default:
            return FanIcon as ImageSourcePropType;
    }
};
