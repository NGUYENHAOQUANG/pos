import React, { useCallback } from 'react';
import { FlatList, StyleSheet, View, RefreshControl } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { CameraCard } from '@/features/control/components/camera/CameraCard';
import { CameraSkeleton } from '@/features/control/components/skeleton/CameraSkeleton';
import { useCameras } from '@/features/control/hooks/useCameras';
import { CameraItem } from '@/features/control/api/cameraApi';
import { colors, spacing } from '@/styles';

interface CameraListProps {
    onCameraPress: (camera: CameraItem) => void;
}

/**
 * Scrollable list of camera cards for the Camera tab.
 * Fetches data from API via useCameras hook.
 */
export const CameraList: React.FC<CameraListProps> = ({ onCameraPress }) => {
    const { data: cameras = [], isLoading, refetch, isRefetching } = useCameras();

    const handleRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

    if (isLoading) {
        return <CameraSkeleton />;
    }

    if (cameras.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Chưa có camera nào được kết nối</Text>
            </View>
        );
    }

    return (
        <FlatList
            data={cameras}
            keyExtractor={item => item.deviceSn}
            renderItem={({ item }) => <CameraCard camera={item} onPress={onCameraPress} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} />}
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
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    emptyText: {
        fontSize: 14,
        color: colors.gray[500],
    },
});
