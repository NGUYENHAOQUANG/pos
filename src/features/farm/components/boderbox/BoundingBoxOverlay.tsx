import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';
import { colors } from '@/styles';

export interface Detection {
    id: number;
    corners: number[][];
}

interface BoundingBoxOverlayProps {
    detections: Detection[];
    displayWidth: number;
    displayHeight: number;
    originalWidth: number;
    originalHeight: number;
}

export const BoundingBoxOverlay: React.FC<BoundingBoxOverlayProps> = ({
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
                    const points = detection.corners
                        .map(corner => `${corner[0] * scaleX},${corner[1] * scaleY}`)
                        .join(' ');

                    return (
                        <Polygon
                            key={detection.id}
                            points={points}
                            stroke={colors.green ? colors.green[500] : 'green'}
                            strokeWidth="0.5"
                            fill="transparent"
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
