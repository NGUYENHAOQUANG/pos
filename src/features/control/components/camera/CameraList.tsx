import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { CameraCard } from '@/features/control/components/camera/CameraCard';
import { CameraData, MOCK_CAMERAS } from '@/features/control/data/camerasData';
import { spacing } from '@/styles';

interface CameraListProps {
    onCameraPress: (camera: CameraData) => void;
}

/**
 * Scrollable list of camera cards for the Camera tab.
 * Uses mock data for now — will be replaced with API data later.
 */
export const CameraList: React.FC<CameraListProps> = ({ onCameraPress }) => {
    return (
        <FlatList
            data={MOCK_CAMERAS}
            keyExtractor={item => item.id}
            renderItem={({ item }) => <CameraCard camera={item} onPress={onCameraPress} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
    );
};

const styles = StyleSheet.create({
    listContent: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.sm,
        paddingBottom: 100,
    },
    separator: {
        height: 4,
    },
});
