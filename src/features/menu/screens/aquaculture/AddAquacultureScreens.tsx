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
import { useMenuContext } from '@/features/menu/context/MenuContext';

export const AddAquacultureScreens: React.FC = () => {
    const navigation = useNavigation();
    const { setTabBarVisible } = useTabBarVisibility();
    const { addAquaculture } = useMenuContext();
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

    const handleCreate = () => {
        const data = formRef.current?.submit();
        if (data) {
            addAquaculture(data);
            Toast.show(ToastMessages.Aquaculture.CREATE_SUCCESS);
            navigation.goBack();
        }
    };

    return (
        <View style={styles.container}>
            <HeaderMenu title="Tạo vụ nuôi" onBack={() => navigation.goBack()} />

            <View style={styles.content}>
                <AquacultureForm ref={formRef} />
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
