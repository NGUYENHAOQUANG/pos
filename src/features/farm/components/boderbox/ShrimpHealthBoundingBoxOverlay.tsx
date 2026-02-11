import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';

export interface HealthDetectionBox {
    id: number;
    bbox: number[]; // [x_min, y_min, x_max, y_max]
    label: string;
    confidence: number;
    color: string;
}

interface ShrimpHealthBoundingBoxOverlayProps {
    detections: HealthDetectionBox[];
    displayWidth: number;
    displayHeight: number;
    originalWidth: number;
    originalHeight: number;
}

export const ShrimpHealthBoundingBoxOverlay: React.FC<ShrimpHealthBoundingBoxOverlayProps> = ({
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
                    const [x_min, y_min, x_max, y_max] = detection.bbox;

                    const x = x_min * scaleX;
                    const y = y_min * scaleY;
                    const width = (x_max - x_min) * scaleX;
                    const height = (y_max - y_min) * scaleY;

                    // Text dimensions approximation (simple heuristic)
                    const fontSize = 10;
                    const textHeight = fontSize + 10;

                    // Position text above the box unless it would be clipped at top
                    let textY = y - textHeight;
                    // Only flip inside if literally off-screen at top
                    if (textY < 0) textY = y;

                    return (
                        <React.Fragment key={detection.id}>
                            {/* Bounding Box */}
                            <Rect
                                x={x}
                                y={y}
                                width={width}
                                height={height}
                                stroke={detection.color}
                                strokeWidth="2"
                                fill="transparent"
                            />

                            {/* Label Text */}
                            <SvgText
                                x={x + 4}
                                y={textY + fontSize + 2} // centered vertically in text box
                                fill={detection.color}
                                fontSize={fontSize}
                                fontWeight="bold"
                            >
                                {detection.label}
                            </SvgText>
                        </React.Fragment>
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
