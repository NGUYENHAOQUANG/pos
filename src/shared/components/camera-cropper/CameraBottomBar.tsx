/**
 * @file CameraBottomBar.tsx
 * @description Bottom control bar for the camera screen.
 *              Displays a gallery thumbnail on the left and a capture
 *              shutter button in the centre.
 */
import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '@/styles';

export interface CameraBottomBarProps {
    lastPhotoThumb: string | null;
    paddingBottom: number;
    onGalleryPress: () => void;
    onCapturePress: () => void;
}

export const CameraBottomBar: React.FC<CameraBottomBarProps> = ({
    lastPhotoThumb,
    paddingBottom,
    onGalleryPress,
    onCapturePress,
}) => (
    <View style={[styles.container, { paddingBottom }]}>
        {/* Gallery thumbnail */}
        <TouchableOpacity style={styles.sideButton} onPress={onGalleryPress} activeOpacity={0.7}>
            {lastPhotoThumb ? (
                <Image source={{ uri: lastPhotoThumb }} style={styles.thumb} />
            ) : (
                <Ionicons name="images-outline" size={28} color={colors.white} />
            )}
        </TouchableOpacity>

        {/* Shutter */}
        <TouchableOpacity style={styles.shutterOuter} onPress={onCapturePress} activeOpacity={0.7}>
            <View style={styles.shutterInner} />
        </TouchableOpacity>

        {/* Spacer – keeps shutter visually centred */}
        <View style={styles.sideButton} />
    </View>
);

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: 32,
        paddingTop: 20,
        backgroundColor: colors.cameraOverlay,
    },
    sideButton: {
        width: 48,
        height: 48,
        borderRadius: 12,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.cameraButtonBg,
    },
    thumb: {
        width: 48,
        height: 48,
        borderRadius: 12,
    },
    shutterOuter: {
        width: 72,
        height: 72,
        borderRadius: 36,
        borderWidth: 4,
        borderColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
    },
    shutterInner: {
        width: 58,
        height: 58,
        borderRadius: 29,
        backgroundColor: colors.white,
    },
});
