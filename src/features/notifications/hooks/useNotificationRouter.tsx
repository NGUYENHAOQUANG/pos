import { useState, useCallback } from 'react';
import { useNavigation, NavigationProp, CommonActions } from '@react-navigation/native';
import { AppStackParamList } from '@/app/navigation/AppStack';
import { INotificationPayload } from '../types/notification.types';
import { NotificationScreen } from '../constants/notification.constants';
import { TabType } from '@/features/material/screens/material/MaterialContent';

export const useNotificationRouter = (): {
    navigateFromPayload: (payload?: INotificationPayload | null) => void;
    approvePayload: INotificationPayload | null;
    clearApprovePayload: () => void;
} => {
    const navigation = useNavigation<NavigationProp<AppStackParamList>>();
    const [approvePayload, setApprovePayload] = useState<INotificationPayload | null>(null);

    const navigateFromPayload = useCallback(
        (payload?: INotificationPayload | null) => {
            if (!payload?.screen) return;

            switch (payload.screen) {
                case NotificationScreen.ImportApprove:
                case NotificationScreen.ExportApprove:
                case NotificationScreen.InventoryApprove:
                    setApprovePayload(payload);
                    break;
                case NotificationScreen.InventoryList:
                    navigation.dispatch(
                        CommonActions.reset({
                            index: 0,
                            routes: [
                                {
                                    name: 'MainTabs',
                                    params: {
                                        screen: 'Material',
                                        params: { selectedTab: TabType.Inventory },
                                    },
                                },
                            ],
                        })
                    );
                    break;
                case NotificationScreen.ExportWarehouseList:
                    navigation.dispatch(
                        CommonActions.reset({
                            index: 0,
                            routes: [
                                {
                                    name: 'MainTabs',
                                    params: {
                                        screen: 'Material',
                                        params: { selectedTab: TabType.Export },
                                    },
                                },
                            ],
                        })
                    );
                    break;
                case NotificationScreen.ImportReceiptList:
                    navigation.dispatch(
                        CommonActions.reset({
                            index: 0,
                            routes: [
                                {
                                    name: 'MainTabs',
                                    params: {
                                        screen: 'Material',
                                        params: { selectedTab: TabType.Import },
                                    },
                                },
                            ],
                        })
                    );
                    break;
                default:
                    console.log(`[NotificationRouter] Unhandled screen mapping: ${payload.screen}`);
                    break;
            }
        },
        [navigation]
    );

    const clearApprovePayload = useCallback(() => setApprovePayload(null), []);

    return { navigateFromPayload, approvePayload, clearApprovePayload };
};
