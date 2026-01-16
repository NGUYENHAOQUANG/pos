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

export const AddAquacultureScreens: React.FC = () => {
    const navigation = useNavigation();
    const { setTabBarVisible } = useTabBarVisibility();
    const { zones, fetchSeasons } = useFarm();
    const formRef = useRef<AquacultureFormRef>(null);

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
                // Call create API
                await seasonApi.createSeason(data.zoneId, {
                    seasonName: data.name,
                    startDate: data.startDate?.toISOString(),
                    endDate: data.endDate?.toISOString(),
                });
                Toast.show(ToastMessages.Aquaculture.CREATE_SUCCESS);
                // Refresh seasons list
                await fetchSeasons(zones);
                navigation.goBack();
            } catch (_error) {
                Toast.show({
                    type: 'error',
                    text1: 'Lỗi',
                    text2: 'Không thể tạo vụ nuôi',
                });
            }
        }
    };

    return (
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
