import React from 'react';
import { View, StyleSheet } from 'react-native';
import { HeaderDevices } from '@/features/control/components/HeaderDevices';
import { ScheduleActivitie } from '@/features/control/components/schedule/ScheduleActivitie';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { colors } from '@/styles';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { AppStackParamList } from '@/app/navigation/AppStack';

export const ScheduleActivitieScreens: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute<RouteProp<AppStackParamList, 'Schedule'>>();
    const pondName = route.params?.pondName || 'Ao 1';

    const { setTabBarVisible } = useTabBarVisibility();

    React.useEffect(() => {
        // Hide custom tab bar
        setTabBarVisible(false);

        return () => {
            // Restore custom tab bar
            setTabBarVisible(true);
        };
    }, [setTabBarVisible]);

    return (
        <View style={styles.container}>
            <HeaderDevices
                title={`Lịch Trình - ${pondName}`}
                onBackPress={() => navigation.goBack()}
            />
            <View style={styles.content}>
                <ScheduleActivitie pondName={pondName} />
            </View>
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
        paddingBottom: 0,
    },
});
