import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { HeaderSection } from '@/shared/components/layout/HeaderSection';

import { colors } from '@/styles';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { FarmInfoCard } from '@/features/farm/components/info/FarmInfoCard';

type ScreenRouteProp = RouteProp<FarmStackParamList, 'FarmInfo'>;

export const FarmInfoScreen: React.FC = () => {
    const route = useRoute<ScreenRouteProp>();
    const { farm } = route.params || {};
    const { setTabBarVisible } = useTabBarVisibility();
    useEffect(() => {
        setTabBarVisible(false);
        return () => {
            setTabBarVisible(true);
        };
    }, [setTabBarVisible]);

    return (
        <View style={styles.container}>
            {/* Header */}
            <HeaderSection title="Thông tin trại nuôi" />

            {/* Content */}
            <FarmInfoCard farm={farm} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
        paddingHorizontal: 16,
    },
});
