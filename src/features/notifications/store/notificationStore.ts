/**
 * @file notificationStore.ts
 * @description Zustand store for notification state management (FCM token, permission status)
 */
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Storage } from '@/core/services/storage.service';

interface NotificationState {
    /** Current FCM device token */
    fcmToken: string | null;
    /** Whether the user has granted notification permission */
    hasPermission: boolean;
    /** Whether FCM token has been successfully sent to backend */
    isTokenRegistered: boolean;
}

interface NotificationActions {
    /** Store FCM token */
    setFcmToken: (token: string | null) => void;
    /** Store permission status */
    setHasPermission: (granted: boolean) => void;
    /** Mark token as registered with backend */
    setTokenRegistered: (registered: boolean) => void;
    /** Reset notification state (on logout) */
    resetNotificationState: () => void;
}

type NotificationStore = NotificationState & NotificationActions;

const initialState: NotificationState = {
    fcmToken: null,
    hasPermission: false,
    isTokenRegistered: false,
};

export const useNotificationStore = create<NotificationStore>()(
    persist(
        immer(set => ({
            ...initialState,

            setFcmToken: (token: string | null) => {
                set(state => {
                    state.fcmToken = token;
                    // If token changes, mark as not yet registered with backend
                    state.isTokenRegistered = false;
                });
            },

            setHasPermission: (granted: boolean) => {
                set(state => {
                    state.hasPermission = granted;
                });
            },

            setTokenRegistered: (registered: boolean) => {
                set(state => {
                    state.isTokenRegistered = registered;
                });
            },

            resetNotificationState: () => {
                set(state => {
                    state.fcmToken = null;
                    state.hasPermission = false;
                    state.isTokenRegistered = false;
                });
            },
        })),
        {
            name: 'notification-storage',
            storage: createJSONStorage(() => Storage),
            partialize: state => ({
                fcmToken: state.fcmToken,
                hasPermission: state.hasPermission,
                isTokenRegistered: state.isTokenRegistered,
            }),
        }
    )
);

// ─── Selectors ───────────────────────────────────────────────
export const selectFcmToken = (state: NotificationStore) => state.fcmToken;
export const selectHasPermission = (state: NotificationStore) => state.hasPermission;
export const selectIsTokenRegistered = (state: NotificationStore) => state.isTokenRegistered;
