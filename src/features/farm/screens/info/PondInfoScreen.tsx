import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { HeaderSection } from '@/shared/components/layout/HeaderSection';

import { colors } from '@/styles';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { PondInfoCard } from '@/features/farm/components/info/PondInfoCard';

type ScreenRouteProp = RouteProp<FarmStackParamList, 'PondInfo'>;

export const PondInfoScreen: React.FC = () => {
    const route = useRoute<ScreenRouteProp>();
    const { pond } = route.params || {};
    const { setTabBarVisible } = useTabBarVisibility();

    // Hide tab bar when this screen is mounted
    useEffect(() => {
        setTabBarVisible(false);
        return () => {
            setTabBarVisible(true);
        };
    }, [setTabBarVisible]);

    return (
        <View style={styles.container}>
            {/* Header */}
            <HeaderSection title="Thông tin ao nuôi" />

            {/* Content */}
            <PondInfoCard pond={pond} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
    },
});
