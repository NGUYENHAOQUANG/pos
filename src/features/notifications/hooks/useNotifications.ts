/**
 * @file useNotifications.ts
 * @description Hook to fetch and manage notifications
 */
import { useInfiniteQuery, useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { notificationApi } from '@/features/notifications/api/notification.api';
import {
    GetNotificationsParams,
    INotification,
} from '@/features/notifications/types/notification.types';
import { useMemo } from 'react';
import { handleError } from '@/shared/utils/errorHandler';
import {
    useNotificationStore,
    selectHasPermission,
} from '@/features/notifications/store/notificationStore';

export const notificationKeys = {
    all: ['notifications'] as const,
    list: (params?: GetNotificationsParams) => ['notifications', 'list', params] as const,
    unreadCount: () => ['notifications', 'unread-count'] as const,
};

export const useNotifications = (
    params?: GetNotificationsParams,
    options?: { enabled?: boolean }
) => {
    const query = useInfiniteQuery({
        queryKey: notificationKeys.list(params),
        queryFn: ({ pageParam = 1 }) =>
            notificationApi.getNotifications({
                ...params,
                Page: pageParam,
                PageSize: params?.PageSize || 10,
            }),
        initialPageParam: 1,
        getNextPageParam: lastPage => {
            if (lastPage.data?.hasNextPage) {
                return lastPage.data.pageNumber + 1;
            }
            return undefined;
        },
        enabled: options?.enabled,
    });

    const data = useMemo(() => {
        if (!query.data) return [];
        return query.data.pages.reduce<INotification[]>((acc, page) => {
            const items = page.data?.items || [];
            return [...acc, ...items];
        }, []);
    }, [query.data]);

    return {
        ...query,
        data,
    };
};

export const useRegisterDeviceToken = () => {
    return useMutation({
        mutationFn: (fcmToken: string) => notificationApi.registerDeviceToken(fcmToken),
        onError: error => {
            handleError(error);
        },
    });
};

export const useMarkNotificationAsRead = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => notificationApi.markAsRead(id),
        onMutate: async (id: string) => {
            await queryClient.cancelQueries({ queryKey: notificationKeys.all });

            queryClient.setQueriesData({ queryKey: notificationKeys.all }, (oldData: any) => {
                if (!oldData || !oldData.pages) return oldData;

                return {
                    ...oldData,
                    pages: oldData.pages.map((page: any) => {
                        if (!page.data || !page.data.items) return page;

                        let hasChanges = false;
                        const newItems = page.data.items.map((item: INotification) => {
                            if (item.id === id && !item.isRead) {
                                hasChanges = true;
                                return { ...item, isRead: true };
                            }
                            return item;
                        });

                        if (!hasChanges) return page;

                        return {
                            ...page,
                            data: {
                                ...page.data,
                                items: newItems,
                            },
                        };
                    }),
                };
            });

            queryClient.setQueryData(notificationKeys.unreadCount(), (oldData: any) => {
                if (typeof oldData === 'number' && oldData > 0) {
                    return oldData - 1;
                }
                return oldData;
            });
        },
        onError: error => {
            handleError(error);
            queryClient.invalidateQueries({ queryKey: notificationKeys.all });
            queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
        },
    });
};

export const useUnreadNotificationCount = () => {
    const hasPermission = useNotificationStore(selectHasPermission);

    return useQuery({
        queryKey: notificationKeys.unreadCount(),
        queryFn: async () => {
            const response = await notificationApi.getUnreadCount();
            if (response.success && response.data !== undefined) {
                return response.data;
            }
            return 0;
        },
        refetchInterval: hasPermission ? false : 60000,
    });
};
