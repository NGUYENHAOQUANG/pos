import React, { useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
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
import { useMenuContext } from '@/features/menu/store/menuStore';
import { Aquaculture } from '@/features/menu/types/menu.types';

type EditAquacultureRouteProp = RouteProp<
    { EditAquaculture: { aquaculture: Aquaculture } },
    'EditAquaculture'
>;

export const EditAquacultureScreens: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute<EditAquacultureRouteProp>();
    const { aquaculture } = route.params;
    const { setTabBarVisible } = useTabBarVisibility();
    const { updateAquaculture } = useMenuContext();
    const formRef = useRef<AquacultureFormRef>(null);

    // useFocusEffect to manage tab bar visibility
    // If useTabBarVisibility logic is global or handled elsewhere, verify if this is needed.
    // AddAquacultureScreens uses it, so likely needed here too.
    // Although simpler is to rely on stack navigator hiding tab bar if it was pushed?
    // But our MenuScreens architecture seems to require explicit hiding.

    // NOTE: Assuming verified pattern from AddAquacultureScreens
    /*
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
  */
    // Actually, usually screens deep in stack cover tabs naturally if stack is above tab.
    // But if tab navigator is parent, we might need this. Let's include it to be safe and consistent.

    React.useEffect(() => {
        // Force hide tab bar when entering this screen
        const unsubscribe = navigation.addListener('focus', () => {
            setTabBarVisible(false);
        });

        // Be careful about restoring it, usually handled by "blur" or parent screen "focus"
        // But let's use the exact pattern from AddAquacultureScreens for consistency
        return unsubscribe;
    }, [navigation, setTabBarVisible]);

    // Actually, let's copy the useFocusEffect pattern exactly from AddAquacultureScreens
    const { useFocusEffect } = require('@react-navigation/native');
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

    const handleUpdate = () => {
        const data = formRef.current?.submit();
        if (data) {
            updateAquaculture(aquaculture.id, data);
            Toast.show(ToastMessages.Aquaculture.UPDATE_SUCCESS);
            navigation.goBack();
        }
    };

    return (
        <View style={styles.container}>
            <HeaderMenu title="Chỉnh sửa vụ nuôi" onBack={() => navigation.goBack()} />

            <View style={styles.content}>
                <AquacultureForm ref={formRef} initialValues={aquaculture} />
            </View>

            <ButtonBarMenu
                primaryTitle="Cập nhật thông tin"
                secondaryTitle="Huỷ"
                onPrimaryPress={handleUpdate}
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
