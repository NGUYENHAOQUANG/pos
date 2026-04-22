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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: notificationKeys.all });
        },
        onError: error => {
            handleError(error);
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
        // Only poll if the device doesn't have push notification permission
        refetchInterval: hasPermission ? false : 60000,
    });
};
