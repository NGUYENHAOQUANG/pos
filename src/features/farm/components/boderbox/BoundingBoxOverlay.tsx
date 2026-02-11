import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Rect, Polygon, Text as SvgText } from 'react-native-svg';
import { colors } from '@/styles';

export interface DetectionBox {
    id: number;
    bbox?: number[]; // [x_min, y_min, x_max, y_max]
    corners?: number[][]; // [[x,y], [x,y], ...]
    label?: string;
    confidence?: number;
    color?: string; // Hex color string
}

interface BoundingBoxOverlayProps {
    detections: DetectionBox[];
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
                    if (detection.bbox) {
                        const [x_min, y_min, x_max, y_max] = detection.bbox;

                        const x = x_min * scaleX;
                        const y = y_min * scaleY;
                        const width = (x_max - x_min) * scaleX;
                        const height = (y_max - y_min) * scaleY;

                        return (
                            <React.Fragment key={detection.id}>
                                <Rect
                                    x={x}
                                    y={y}
                                    width={width}
                                    height={height}
                                    stroke={detection.color || colors.red?.[600] || 'red'}
                                    strokeWidth="2"
                                    fill="transparent"
                                />
                                {detection.label && (
                                    <SvgText
                                        x={x}
                                        y={y - 5}
                                        fill={detection.color || colors.red?.[600] || 'red'}
                                        fontSize="12"
                                        fontWeight="bold"
                                    >
                                        {detection.label}
                                    </SvgText>
                                )}
                            </React.Fragment>
                        );
                    } else if (detection.corners) {
                        const points = detection.corners
                            .map(corner => `${corner[0] * scaleX},${corner[1] * scaleY}`)
                            .join(' ');

                        return (
                            <Polygon
                                key={detection.id}
                                points={points}
                                stroke={detection.color || colors.green?.[500] || 'green'}
                                strokeWidth="2"
                                fill="transparent"
                            />
                        );
                    }
                    return null;
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
