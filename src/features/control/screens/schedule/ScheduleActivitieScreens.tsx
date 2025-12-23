import React from 'react';
import { View, StyleSheet } from 'react-native';
import { HeaderDevices } from '../../components/HeaderDevices';
import { ScheduleActivitie } from '../../components/schedule/ScheduleActivitie';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { colors } from '@/styles';

import { Loading } from '@/shared/components/ui/Loading';

interface ScheduleActivitieScreensProps {
    pondName?: string;
    onBack?: () => void;
}

export const ScheduleActivitieScreens: React.FC<ScheduleActivitieScreensProps> = ({
    pondName = 'Ao 1',
    onBack,
}) => {
    const { setTabBarVisible } = useTabBarVisibility();
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        // Hide custom tab bar
        setTabBarVisible(false);

        // Mock loading delay
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
            <HeaderDevices title={`Lịch Trình - ${pondName}`} onBackPress={onBack} />
            <View style={styles.content}>{isLoading ? <Loading /> : <ScheduleActivitie />}</View>
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
