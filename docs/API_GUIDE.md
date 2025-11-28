# 📡 API Guide - Easy API Calling

## 🎯 Pattern: Feature API → Hooks → Screens

### 3-Step Process:

```
1. API Layer (api/)      → Define API calls
2. Hooks Layer (hooks/)  → Wrap API with React Query
3. Screens (screens/)     → Use hooks
```

## 📋 Step 1: Create API Functions

### File: `features/product/api/productApi.ts`

```typescript
import {apiClient} from '@/core/api/client';
import {API_ENDPOINTS} from '@/core/api/endpoints';
import {Product} from '../types/product.types';

export const productApi = {
  // GET - Simple
  getProducts: async (): Promise<Product[]> => {
    const {data} = await apiClient.get<Product[]>(API_ENDPOINTS.PRODUCTS.LIST);
    return data;
  },

  // GET - With params
  getProductsWithFilter: async (filter: ProductFilter): Promise<Product[]> => {
    const {data} = await apiClient.get<Product[]>(API_ENDPOINTS.PRODUCTS.LIST, {
      params: filter, // ?category=electronics&minPrice=100
    });
    return data;
  },

  // GET - With path params
  getProductDetail: async (id: string): Promise<Product> => {
    const {data} = await apiClient.get<Product>(API_ENDPOINTS.PRODUCTS.DETAIL(id));
    return data;
  },

  // POST - Create
  createProduct: async (productData: CreateProductData): Promise<Product> => {
    const {data} = await apiClient.post<Product>(
      API_ENDPOINTS.PRODUCTS.CREATE,
      productData,
    );
    return data;
  },

  // PUT - Update
  updateProduct: async (id: string, data: Partial<Product>): Promise<Product> => {
    const {data: response} = await apiClient.put<Product>(
      API_ENDPOINTS.PRODUCTS.UPDATE(id),
      data,
    );
    return response;
  },

  // DELETE
  deleteProduct: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.PRODUCTS.DELETE(id));
  },
};
```

## 📋 Step 2: Create Hooks with React Query

### File: `features/product/hooks/useProducts.ts`

```typescript
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {productApi} from '../api/productApi';

// ✅ GET - useQuery (for GET requests)
export function useProducts() {
  return useQuery({
    queryKey: ['products'], // Unique key
    queryFn: productApi.getProducts, // API function
  });
}

// ✅ GET - With params
export function useProductsWithFilter(filter: ProductFilter) {
  return useQuery({
    queryKey: ['products', filter], // Key includes filter
    queryFn: () => productApi.getProductsWithFilter(filter),
  });
}

// ✅ GET - With conditional fetch
export function useProductDetail(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productApi.getProductDetail(id),
    enabled: !!id, // Only fetch when id exists
  });
}

// ✅ POST/PUT/DELETE - useMutation
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productApi.createProduct,
    onSuccess: () => {
      // Invalidate to refetch list
      queryClient.invalidateQueries({queryKey: ['products']});
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({id, data}: {id: string; data: Partial<Product>}) =>
      productApi.updateProduct(id, data),
    onSuccess: (_, variables) => {
      // Invalidate both list and detail
      queryClient.invalidateQueries({queryKey: ['products']});
      queryClient.invalidateQueries({queryKey: ['product', variables.id]});
    },
  });
}
```

## 📋 Step 3: Use in Screen

### File: `features/product/screens/ProductListScreen.tsx`

```typescript
import {useProducts, useCreateProduct} from '../hooks/useProducts';

export function ProductListScreen() {
  // ✅ GET - Simple usage
  const {data: products, isLoading, error, refetch} = useProducts();

  // ✅ POST - Mutation
  const {mutate: createProduct, isPending} = useCreateProduct();

  const handleCreate = () => {
    createProduct(
      {name: 'New Product', price: 100},
      {
        onSuccess: () => {
          console.log('Created!');
        },
        onError: error => {
          console.error('Error:', error);
        },
      },
    );
  };

  if (isLoading) return <Loading />;
  if (error) return <Error />;

  return (
    <FlatList
      data={products}
      onRefresh={refetch} // Pull to refresh
      refreshing={isLoading}
      renderItem={({item}) => <ProductCard product={item} />}
    />
  );
}
```

## 🎯 Common Patterns

### 1. GET with Loading & Error

```typescript
const {data, isLoading, error, refetch} = useProducts();

if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;

return <ProductList products={data} />;
```

### 2. POST with Optimistic Update

```typescript
const queryClient = useQueryClient();

const {mutate} = useMutation({
  mutationFn: productApi.createProduct,
  onMutate: async newProduct => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({queryKey: ['products']});

    // Snapshot previous value
    const previous = queryClient.getQueryData(['products']);

    // Optimistically update
    queryClient.setQueryData(['products'], old => [...old, newProduct]);

    return {previous};
  },
  onError: (err, newProduct, context) => {
    // Rollback on error
    queryClient.setQueryData(['products'], context.previous);
  },
  onSettled: () => {
    // Refetch after error or success
    queryClient.invalidateQueries({queryKey: ['products']});
  },
});
```

### 3. Pagination

```typescript
export function useProductsPaginated(page: number) {
  return useQuery({
    queryKey: ['products', 'paginated', page],
    queryFn: () => productApi.getProducts({page, limit: 20}),
    keepPreviousData: true, // Keep old data when fetching new page
  });
}
```

### 4. Search with Debounce

```typescript
import {useDebounce} from '@/shared/hooks';

export function ProductSearchScreen() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500); // Debounce 500ms

  const {data} = useQuery({
    queryKey: ['products', 'search', debouncedSearch],
    queryFn: () => productApi.searchProducts(debouncedSearch),
    enabled: debouncedSearch.length > 2, // Only search when > 2 characters
  });

  return (
    <Input value={search} onChangeText={setSearch} />
    // ...
  );
}
```

### 5. Dependent Queries

```typescript
// Fetch category first, then fetch products of that category
export function useCategoryProducts(categoryId: string) {
  const {data: category} = useQuery({
    queryKey: ['category', categoryId],
    queryFn: () => categoryApi.getCategory(categoryId),
  });

  const {data: products} = useQuery({
    queryKey: ['products', 'category', categoryId],
    queryFn: () => productApi.getProductsByCategory(categoryId),
    enabled: !!category, // Only fetch when category exists
  });

  return {category, products};
}
```

## 🔧 API Client Configuration

### Auto-add Auth Token

File: `core/api/client.ts` is already set up:

```typescript
apiClient.interceptors.request.use(config => {
  const token = useAuthStore.getState().token;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**→ All API calls automatically include token!**

### Error Handling

```typescript
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Auto logout when unauthorized
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  },
);
```

## 📝 Checklist When Creating New API

- [ ] Add endpoint to `core/api/endpoints.ts`
- [ ] Create API function in `features/{feature}/api/`
- [ ] Create hook with `useQuery` (GET) or `useMutation` (POST/PUT/DELETE)
- [ ] Export hook in `features/{feature}/index.ts`
- [ ] Use hook in Screen
- [ ] Handle loading & error states
- [ ] Invalidate queries after mutations

## 🚀 Best Practices

### ✅ DO

1. **Always use hooks, don't call API directly in Screen**
   ```typescript
   ✅ const {data} = useProducts();
   ❌ const data = await productApi.getProducts();
   ```

2. **Set clear queryKey with structure**
   ```typescript
   ✅ ['products', filter]
   ✅ ['product', id]
   ❌ ['data']
   ```

3. **Invalidate queries after mutations**
   ```typescript
   onSuccess: () => {
     queryClient.invalidateQueries({queryKey: ['products']});
   }
   ```

4. **Use enabled for conditional fetching**
   ```typescript
   enabled: !!id && isAuthenticated
   ```

### ❌ DON'T

1. **DO NOT call API directly in Screen**
   ```typescript
   ❌ useEffect(() => {
       productApi.getProducts().then(setProducts);
     }, []);
   ```

2. **DO NOT forget to handle loading/error**
   ```typescript
   ❌ const {data} = useProducts();
     return <List data={data} />; // data might be undefined!
   ```

3. **DO NOT hardcode endpoints**
   ```typescript
   ❌ apiClient.get('/products')
   ✅ apiClient.get(API_ENDPOINTS.PRODUCTS.LIST)
   ```

## 📚 References

- [TanStack Query Docs](https://tanstack.com/query/latest)
- [React Query Patterns](https://tkdodo.eu/blog/practical-react-query)

---

**Summary:** API calls = 3 simple steps: API function → Hook → Screen. React Query automatically handles caching, refetching, and error handling!
