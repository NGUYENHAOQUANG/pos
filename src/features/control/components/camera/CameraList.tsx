import React, { useCallback } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { RefreshControl } from '@/shared/components/layout/RefreshControl';
import { CameraCard } from '@/features/control/components/camera/CameraCard';
import { CameraSkeleton } from '@/features/control/components/skeleton/CameraSkeleton';
import { EmptyStateCard } from '@/shared/components/ui/EmptyStateCard';
import { useCameras } from '@/features/control/hooks/useCameras';
import { CameraItem } from '@/features/control/api/cameraApi';
import { spacing } from '@/styles';

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

    return (
        <FlatList
            data={cameras}
            keyExtractor={item => item.deviceSn}
            renderItem={({ item }) => <CameraCard camera={item} onPress={onCameraPress} />}
            contentContainerStyle={[
                styles.listContent,
                cameras.length === 0 && styles.emptyContent,
            ]}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} />}
            ListEmptyComponent={<EmptyStateCard message="Chưa có camera nào được kết nối" />}
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
    emptyContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
