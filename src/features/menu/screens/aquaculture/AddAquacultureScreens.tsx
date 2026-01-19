import React, { useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { ToastMessages } from '@/features/menu/utils/toastMessages';
import { colors } from '@/styles';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { HeaderMenu } from '@/features/menu/components/HeaderMenu';
import { ButtonBarMenu } from '@/features/menu/components/ButtonBarMenu';
import {
    AquacultureForm,
    AquacultureFormRef,
} from '@/features/menu/components/aquaculture/AquacultureForm';
import { useFarm } from '@/features/farm/store/farmStore';
import { seasonApi } from '@/features/farm/api/seasonApi';
import { Loading } from '@/shared/components/ui/Loading';
import { useQueryClient } from '@tanstack/react-query';
import { farmKeys } from '@/features/farm/hooks/farmKeys';

export const AddAquacultureScreens: React.FC = () => {
    const navigation = useNavigation();
    const { setTabBarVisible } = useTabBarVisibility();
    const { zones, fetchZones, seasons } = useFarm();
    const formRef = useRef<AquacultureFormRef>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const queryClient = useQueryClient();

    React.useEffect(() => {
        if (zones.length === 0) {
            fetchZones();
        }
    }, [zones.length, fetchZones]);

    useFocusEffect(
        React.useCallback(() => {
            // Use a timeout to ensure this runs after the previous screen's cleanup
            const timeout = setTimeout(() => {
                setTabBarVisible(false);
            }, 100);

            return () => {
                clearTimeout(timeout);
                setTabBarVisible(true);
            };
        }, [setTabBarVisible])
    );

    const handleCreate = async () => {
        const data = formRef.current?.submit();
        if (data && data.zoneId) {
            try {
                setIsLoading(true);

                // Frontend validation for duplicate name
                const normalizeName = (name: string) => name.trim().toLowerCase();
                const newName = normalizeName(data.name || '');

                const isDuplicate = seasons.some(
                    s =>
                        String(s.zoneId) === String(data.zoneId) &&
                        normalizeName(s.name) === newName
                );

                if (isDuplicate) {
                    throw new Error('Tên vụ nuôi đã tồn tại trong vùng nuôi này');
                }

                // Call create API
                await seasonApi.createSeason(data.zoneId, {
                    seasonName: data.name,
                    startDate: data.startDate?.toISOString(),
                    endDate: data.endDate?.toISOString(),
                });
                Toast.show(ToastMessages.Aquaculture.CREATE_SUCCESS);
                // Invalidate seasons query to trigger background refetch
                queryClient.invalidateQueries({ queryKey: farmKeys.seasons() });
                navigation.goBack();
            } catch (error: any) {
                const errorMessage =
                    error?.response?.data?.message || error?.message || 'Không thể tạo vụ nuôi';

                Toast.show({
                    type: 'error',
                    text1: 'Lỗi',
                    text2: errorMessage,
                });
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <Loading isLoading={isLoading}>
            <View style={styles.container}>
                <HeaderMenu title="Tạo vụ nuôi" onBack={() => navigation.goBack()} />

                <View style={styles.content}>
                    <AquacultureForm ref={formRef} zones={zones} />
                </View>

                <ButtonBarMenu
                    primaryTitle="Tạo vụ nuôi"
                    secondaryTitle="Huỷ"
                    onPrimaryPress={handleCreate}
                    onSecondaryPress={() => {
                        navigation.goBack();
                    }}
                    secondaryType="default"
                />
            </View>
        </Loading>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
    },
    content: {
        flex: 1,
    },
});
