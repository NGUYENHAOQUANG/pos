import React, { useCallback, useMemo, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '@/styles';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { HeaderMenu } from '@/features/menu/components/HeaderMenu';
import { ButtonBarMenu } from '@/features/menu/components/ButtonBarMenu';
import {
    AquacultureForm,
    AquacultureFormRef,
} from '@/features/menu/components/aquaculture/AquacultureForm';
import { Loading } from '@/shared/components/ui/Loading';
import { useZones } from '@/features/farm/hooks/useZones';
import { useCreateSeason } from '@/features/menu/hooks/useAquacultureMutations';
import { AquacultureFormValues } from '@/features/menu/schemas/aquacultureFormSchema';
import { AppStackParamList } from '@/app/navigation/AppStack';

export const AddAquacultureScreens: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
    const { setTabBarVisible } = useTabBarVisibility();
    const formRef = useRef<AquacultureFormRef>(null);

    // Data fetching via TanStack Query
    const { data: zones = [] } = useZones();

    // Mutation hook
    const createSeasonMutation = useCreateSeason();

    // Map zones to dropdown options
    const zoneOptions = useMemo(() => {
        return zones.map(z => ({
            id: z.id.toString(),
            label: z.name,
        }));
    }, [zones]);

    // Tab bar visibility
    useFocusEffect(
        React.useCallback(() => {
            const timeout = setTimeout(() => {
                setTabBarVisible(false);
            }, 100);

            return () => {
                clearTimeout(timeout);
                setTabBarVisible(true);
            };
        }, [setTabBarVisible])
    );

    // Submit handler - uses mutation hook
    const handleSubmit = useCallback(
        (formData: AquacultureFormValues) => {
            createSeasonMutation.mutate(
                {
                    zoneId: formData.zoneId,
                    formData,
                },
                {
                    onSuccess: () => {
                        navigation.goBack();
                    },
                }
            );
        },
        [createSeasonMutation, navigation]
    );

    const handleGoBack = useCallback(() => navigation.goBack(), [navigation]);
    const handlePrimaryPress = useCallback(() => formRef.current?.submit(), []);

    return (
        <Loading isLoading={createSeasonMutation.isPending}>
            <View style={styles.container}>
                <HeaderMenu title="Tạo vụ nuôi" onBack={handleGoBack} />

                <View style={styles.content}>
                    <AquacultureForm
                        ref={formRef}
                        isEditMode={false}
                        isLoadingDetail={false}
                        isSubmitting={createSeasonMutation.isPending}
                        initialData={undefined}
                        zoneOptions={zoneOptions}
                        onSubmit={handleSubmit}
                    />
                </View>

                <ButtonBarMenu
                    primaryTitle="Tạo vụ nuôi"
                    secondaryTitle="Huỷ"
                    onPrimaryPress={handlePrimaryPress}
                    onSecondaryPress={handleGoBack}
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
