import React from 'react';
import { View, FlatList } from 'react-native';
import { MaterialMasterItem } from '@/features/material/components/material_list/MaterialMasterItem';
import { MaterialItemSkeleton } from '@/features/material/components/material_list/MaterialListSkeleton';
import { EmptyStateCard } from '@/shared/components/ui/EmptyStateCard';
import { ListFooterLoader } from '@/shared/components/ui/ListFooterLoader';
import { IMaterial } from '@/features/material/types/material.types';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles';
import { StyleSheet } from 'react-native';

interface MaterialListContentProps {
    materials: IMaterial[];
    isLoading?: boolean;
    refreshing?: boolean;
    onRefresh?: () => void;
    onLoadMore?: () => void;
    isFetchingNextPage?: boolean;
    hasNextPage?: boolean;
    onPressCreate?: () => void;
}

export const MaterialListContent: React.FC<MaterialListContentProps> = React.memo(
    ({
        materials,
        isLoading,
        refreshing,
        onRefresh,
        onLoadMore,
        isFetchingNextPage,
        hasNextPage,
        onPressCreate,
    }) => {
        const theme = useAppTheme();
        const styles = getStyles(theme);

        const handleLoadMore = React.useCallback(() => {
            if (hasNextPage && !isFetchingNextPage && onLoadMore) {
                onLoadMore();
            }
        }, [hasNextPage, isFetchingNextPage, onLoadMore]);

        const renderItem = React.useCallback(({ item }: { item: IMaterial }) => {
            return (
                <MaterialMasterItem
                    item={item}
                    hideRemaining={true}
                    alwaysExpanded={true}
                    showStatus={true}
                />
            );
        }, []);

        const keyExtractor = React.useCallback((item: IMaterial) => item.id, []);

        const renderSkeleton = React.useCallback(() => <MaterialItemSkeleton />, []);
        const skeletonKeyExtractor = React.useCallback((item: number) => item.toString(), []);

        if (isLoading) {
            return (
                <View style={styles.container}>
                    <FlatList
                        data={[1, 2, 3, 4, 5]}
                        renderItem={renderSkeleton}
                        keyExtractor={skeletonKeyExtractor}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                    />
                </View>
            );
        }

        return (
            <View style={styles.container}>
                <FlatList
                    data={materials}
                    keyExtractor={keyExtractor}
                    renderItem={renderItem}
                    contentContainerStyle={[
                        styles.listContent,
                        materials.length === 0 && styles.emptyContent,
                    ]}
                    showsVerticalScrollIndicator={false}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={isFetchingNextPage ? <ListFooterLoader /> : null}
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
    }
);

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.backgroundPrimary,
        },
        listContent: {
            paddingBottom: 100,
            flexGrow: 1,
        },
        emptyContent: {
            flex: 1,
        },
        loaderFooter: {
            paddingVertical: 16,
            alignItems: 'center',
        },
    });
