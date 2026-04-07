import React from 'react';
import { View, StyleSheet } from 'react-native';
import { HeaderDevices } from '@/features/control/components/HeaderDevices';
import { ScheduleActivitie } from '@/features/control/components/schedule/ScheduleActivitie';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { AppStackParamList } from '@/app/navigation/AppStack';
import { Loading } from '@/shared/components/ui/Loading';

export const ScheduleActivitieScreens: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute<RouteProp<AppStackParamList, 'Schedule'>>();
    const pondName = route.params?.pondName || 'Ao 1';
    const theme = useAppTheme();
    const styles = getStyles(theme);

    const { setTabBarVisible } = useTabBarVisibility();
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        // Hide custom tab bar
        setTabBarVisible(false);

        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);

        return () => {
            // Restore custom tab bar
            setTabBarVisible(true);
            clearTimeout(timer);
        };
    }, [setTabBarVisible]);

    return (
        <View style={styles.container}>
            <HeaderDevices
                title={`Lịch Trình - ${pondName}`}
                onBackPress={() => navigation.goBack()}
            />
            <View style={styles.content}>
                {isLoading ? <Loading /> : <ScheduleActivitie pondName={pondName} />}
            </View>
        </View>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.backgroundPrimary,
        },
        content: {
            flex: 1,
            paddingBottom: 0,
        },
    });
