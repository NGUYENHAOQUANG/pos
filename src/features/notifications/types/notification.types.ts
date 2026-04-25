/**
 * @file notification.types.ts
 * @description Types for notifications API and models
 */
import { ICreatorEditor } from '@/shared/types/common.types';
import {
    NotificationScreen,
    NotificationType,
    NotificationMode,
    NotificationActionType,
} from '../constants/notification.constants';

export enum DevicePlatform {
    iOS = 'iOS',
    Android = 'Android',
}

export interface GetNotificationsParams {
    IsRead?: boolean;
    Id?: string;
    CreatedAt?: string;
    CreateAtFrom?: string;
    CreateAtTo?: string;
    Page?: number;
    PageSize?: number;
    OrderBy?: string;
}

export interface INotificationPayload {
    notificationType?: NotificationType | string;
    targetUrl?: string;
    createdAt?: string;
    screen?: NotificationScreen | string;
    mode?: NotificationMode | string;
    id?: string;
    type?: NotificationActionType | string;
    [key: string]: any;
}

export interface INotification {
    id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    targetUrl?: string | null;
    payload?: INotificationPayload | null;
    no?: number;
    creatorId?: string | null;
    editorId?: string | null;
    createdAt: string;
    editedAt?: string;
    creator?: ICreatorEditor | null;
    editor?: ICreatorEditor | null;
}
