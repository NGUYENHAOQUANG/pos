import { SvgProps } from 'react-native-svg';
import FanIcon from '@/assets/Icon/IconDevices/fan.svg';
import FeederIcon from '@/assets/Icon/IconDevices/feeder.svg';
import OxyIcon from '@/assets/Icon/IconDevices/oxy.svg';
import SyphonIcon from '@/assets/Icon/IconDevices/syphon.svg';
import PumpIcon from '@/assets/Icon/IconDevices/Pump.svg';

export const getDeviceIcon = (type: string): React.FC<SvgProps> => {
    switch (type) {
        case 'feeder':
            return FeederIcon;
        case 'fan':
            return FanIcon;
        case 'oxy':
            return OxyIcon;
        case 'syphon':
            return SyphonIcon;
        case 'pump':
            return PumpIcon;
        default:
            return FanIcon;
    }
};
