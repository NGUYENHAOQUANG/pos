import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '@/styles';

export interface DetectionDot {
    id: number;
    center: {
        x: number;
        y: number;
    };
}

interface DotingOverlayProps {
    detections: DetectionDot[];
    displayWidth: number;
    displayHeight: number;
    originalWidth: number;
    originalHeight: number;
}

export const DotingOverlay: React.FC<DotingOverlayProps> = ({
    detections,
    displayWidth,
    displayHeight,
    originalWidth,
    originalHeight,
}) => {
    if (!originalWidth || !originalHeight || !displayWidth || !displayHeight) {
        return null;
    }

    const scaleX = displayWidth / originalWidth;
    const scaleY = displayHeight / originalHeight;

    return (
        <View style={[styles.container, { width: displayWidth, height: displayHeight }]}>
            <Svg height="100%" width="100%" viewBox={`0 0 ${displayWidth} ${displayHeight}`}>
                {detections.map(detection => {
                    const cx = detection.center.x * scaleX;
                    const cy = detection.center.y * scaleY;

                    return (
                        <Circle
                            key={detection.id}
                            cx={cx}
                            cy={cy}
                            r="2" // Radius of the dot
                            fill={colors.red ? colors.red[600] : 'red'}
                        />
                    );
                })}
            </Svg>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 10,
    },
});
