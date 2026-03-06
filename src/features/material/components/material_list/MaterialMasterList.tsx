import React from 'react';
import { View, FlatList, ActivityIndicator } from 'react-native';
import { MaterialMasterItem } from '@/features/material/components/material_list/MaterialMasterItem';
import { MaterialItemSkeleton } from '@/features/material/components/material_list/MaterialListSkeleton';
import { EmptyStateCard } from '@/shared/components/ui/EmptyStateCard';
import { colors } from '@/styles';
import { IMaterial } from '@/features/material/types/material.types';
import { materialListStyles } from '@/features/material/styles/materialListStyles';

interface MaterialMasterListProps {
    materials: IMaterial[];
    isLoading?: boolean;
    refreshing?: boolean;
    onRefresh?: () => void;
    onLoadMore?: () => void;
    isFetchingNextPage?: boolean;
    hasNextPage?: boolean;
    onPressCreate?: () => void;
}

export const MaterialMasterList: React.FC<MaterialMasterListProps> = ({
    materials,
    isLoading,
    refreshing,
    onRefresh,
    onLoadMore,
    isFetchingNextPage,
    hasNextPage,
    onPressCreate,
}) => {
    const handleLoadMore = () => {
        if (hasNextPage && !isFetchingNextPage && onLoadMore) {
            onLoadMore();
        }
    };

    if (isLoading) {
        return (
            <View style={materialListStyles.container}>
                <FlatList
                    data={[1, 2, 3, 4, 5]}
                    renderItem={() => <MaterialItemSkeleton />}
                    keyExtractor={item => item.toString()}
                    contentContainerStyle={materialListStyles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        );
    }

    return (
        <View style={materialListStyles.container}>
            <FlatList
                data={materials}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <MaterialMasterItem
                        item={item}
                        hideRemaining={true}
                        alwaysExpanded={true}
                        showStatus={true}
                    />
                )}
                contentContainerStyle={[
                    materialListStyles.listContent,
                    materials.length === 0 && materialListStyles.emptyContent,
                ]}
                showsVerticalScrollIndicator={false}
                refreshing={refreshing}
                onRefresh={onRefresh}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                    isFetchingNextPage ? (
                        <View style={materialListStyles.loaderFooter}>
                            <ActivityIndicator color={colors.primary} />
                        </View>
                    ) : null
                }
                ListEmptyComponent={
                    <EmptyStateCard
                        message="Chưa có vật tư nào trong danh mục."
                        buttonTitle="Tạo vật tư mới"
                        onPress={onPressCreate || (() => {})}
                    />
                }
            />
        </View>
    );
};
