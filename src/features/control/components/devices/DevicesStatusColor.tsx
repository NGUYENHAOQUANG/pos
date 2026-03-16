import React from 'react';
import { Image, ImageSourcePropType, ImageStyle, StyleProp } from 'react-native';

interface DevicesStatusColorProps {
    icon: ImageSourcePropType;
    isOn: boolean;
    errorMessage?: string;
    size?: number;
    style?: StyleProp<ImageStyle>;
}

/**
 * Renders a device icon as a PNG Image.
 * Replaces the previous SVG-based implementation for better performance.
 */
export const DevicesStatusColor: React.FC<DevicesStatusColorProps> = React.memo(
    ({
        icon,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        isOn,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        errorMessage,
        size = 48,
        style,
    }) => {
        return (
            <Image
                source={icon}
                style={[{ width: size, height: size }, style]}
                resizeMode="contain"
            />
        );
    }
);
