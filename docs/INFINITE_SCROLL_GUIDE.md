# Infinite Scroll Implementation Guide

Hướng dẫn cách implement chức năng Infinite Scroll sử dụng React Query (`useInfiniteQuery`) và React Native FlatList.

## 1. Cấu hình Page Size

Sử dụng constant `APP_CONFIG` để quản lý size mặc định:

```typescript
// src/shared/constants/config.ts
export const APP_CONFIG = {
    // ...
    DEFAULT_PAGE_SIZE: 20,
} as const;
```

## 2. Hook (useInfiniteQuery)

Tạo hook riêng (VD: `useInfiniteMaterials`) để xử lý logic load more.

### Key Points:

-   Dùng `useInfiniteQuery` thay vì `useQuery`.
-   `queryKey`: Thêm indentifier (VD: `'infinite'`) để tránh conflict với list thường.
-   `getNextPageParam`: Logic để xác định trang tiếp theo dựa trên response API (`hasNextPage`, `pageNumber`).
-   `Flatten Data`: Gộp các trang (`pages`) thành 1 mảng duy nhất (`materials`) bằng `reduce`.
-   **Tối ưu**: Sử dụng `Map` và `useMemo` để mapping dữ liệu danh mục/loại vật tư (O(1) lookup).

```typescript
// src/features/material/hooks/useMaterials.ts

export const useInfiniteMaterials = (params, options) => {
    // ... lấy groups, types

    const query = useInfiniteQuery({
        queryKey: [...materialKeys.list(params), 'infinite'],
        queryFn: async ({ pageParam = 1 }) => {
            const pageSize = APP_CONFIG.DEFAULT_PAGE_SIZE;
            // Gọi API với Page và PageSize
            return api.getAll({ ...params, Page: pageParam, PageSize: pageSize });
        },
        initialPageParam: 1,
        getNextPageParam: lastPage => {
            // Sử dụng meta data từ API trả về
            if (!lastPage.hasNextPage) return undefined;
            return lastPage.pageNumber + 1;
        },
    });

    // Tạo Map để tối ưu lookup (tránh O(N*M))
    const groupMap = React.useMemo(() => new Map(groups.map(g => [g.id, g])), [groups]);
    // ... typeMap tương tự

    // Flatten pages thành 1 mảng items duy nhất
    const materials = React.useMemo(() => {
        if (!query.data) return [];
        return query.data.pages.reduce((acc, page) => {
            const items = page.items || [];
            // Map item sử dụng groupMap/typeMap (O(1))
            const mappedItems = items.map(item => mapMaterialResponse(item, groupMap, typeMap));
            return [...acc, ...mappedItems];
        }, []);
    }, [query.data, groupMap, typeMap]);

    return { ...query, data: materials };
};
```

## 3. UI Implementation (FlatList)

Cách sử dụng hook trong Screen Component.

### Key Points:

-   `onEndReached`: Gọi `fetchNextPage` khi cuộn xuống cuối (kiểm tra `hasNextPage` và `!isFetchingNextPage`).
-   `ListFooterComponent`: Hiển thị loading spinner khi đang fetch trang mới.
-   `MaterialMasterItem` (Item Component): Wrap bằng `React.memo` và xóa các hook dư thừa bên trong để tránh re-render list cũ.

```tsx
// src/features/material/screens/material/MaterialMasterListTab.tsx

export const MaterialMasterListTab = () => {
    const {
        data: materials,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        // ...
    } = useInfiniteMaterials(params);

    const handleLoadMore = () => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    };

    return (
        <FlatList
            data={materials}
            renderItem={({ item }) => <MaterialMasterItem item={item} />}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
                isFetchingNextPage ? (
                    <View style={styles.loaderFooter}>
                        <ActivityIndicator color={colors.primary} />
                    </View>
                ) : null
            }
        />
    );
};
```

## 4. Tối Ưu Hiệu Năng (Perfs)

Để tránh giật lag khi list dài:

1.  **React.memo cho Item**: Đảm bảo Item Component được wrap `React.memo` và có hàm so sánh props (`arePropsEqual`) nếu cần thiết.
2.  **No Hooks in Item**: Không gọi API hook bên trong từng Item (gây N+1 request và re-render). Pass đủ data từ cha xuống.
3.  **Map Lookup**: Dùng `Map` thay vì `array.find` khi transform data số lượng lớn.

## 5. Lưu Ý Quan Trọng (Notes)

-   **Params Dependencies**: Khi filter thay đổi (search text, type...), `queryKey` phải thay đổi để React Query tự động reset page về 1. Đảm bảo `queryKey` chứa đủ params.
-   **Stable References**: Các hàm `onPress`, variable `params` truyền vào hook nên được bọc trong `useCallback` hoặc `useMemo` để tránh trigger fetch không cần thiết.
-   **Empty State**: Luôn handle trường hợp `data.length === 0` sau khi load xong.
-   **Loading States**: Phân biệt `isLoading` (load trang đầu) và `isFetchingNextPage` (load trang tiếp theo) để hiển thị UI phù hợp (Skeleton vs Spinner).
-   **Clean Props**: Item Component nên nhận primitives hoặc plain objects. Tránh truyền function inline (`() => ...`) vào props của `React.memo` items nếu không cần thiết, hoặc dùng `useCallback` cho function đó.
