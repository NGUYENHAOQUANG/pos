import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import Toast from 'react-native-toast-message';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { colors } from '@/styles';
import { HeaderMenu } from '@/features/menu/components/HeaderMenu';
import { ButtonBarMenu } from '@/features/menu/components/ButtonBarMenu';
import { GeneralInformation } from '@/features/menu/components/information/GeneralInformation';
import { FarmConnecter } from '@/features/menu/components/information/FarmConnecter';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';

import { launchImageLibrary } from 'react-native-image-picker';
import { useFarmStore } from '@/features/farm/store/farmStore';
import { Zone } from '@/features/farm/types/farm.types';

export const PersonalInformationScreens: React.FC = () => {
    const navigation = useNavigation();
    const { setTabBarVisible } = useTabBarVisibility();
    const [avatarUri, setAvatarUri] = React.useState<string | null>(null);

    useFocusEffect(
        React.useCallback(() => {
            setTabBarVisible(false);
            return () => {
                setTabBarVisible(true);
            };
        }, [setTabBarVisible])
    );

    // Mock Data
    const userInfo = {
        name: 'Nguyễn Văn A',
        phone: '0123456789',
        email: 'nguyenvana@gmail.com',
        role: 'Quản lý',
        level: 'Trưởng phòng',
    };

    const { zones, ponds, fetchZones } = useFarmStore();

    React.useEffect(() => {
        fetchZones();
    }, [fetchZones]);

    // Calculate connected farms from real data
    const connectedFarms = React.useMemo(() => {
        return zones.map((zone: Zone) => {
            // Count ponds in this zone
            // Match by zone.code or zone.name (depending on what pond.zone stores)
            // pond.zone stores string like "KV-A", zone.code might be "KV-A"
            const pondCount = ponds.filter(
                p => (zone.code && p.zone === zone.code) || (zone.name && p.zone === zone.name)
            ).length;

            return {
                id: zone.id,
                name: zone.name,
                count: pondCount.toString(),
            };
        });
    }, [zones, ponds]);

    const totalFarms = zones.length.toString();

    const handleChangePhoto = async () => {
        const result = await launchImageLibrary({
            mediaType: 'photo',
            quality: 1,
        });

        if (result.assets && result.assets.length > 0) {
            setAvatarUri(result.assets[0].uri || null);
        }
    };

    const handleSave = () => {
        Toast.show({
            type: 'success',
            text1: 'Cập nhật thông tin thành công',
            position: 'top',
        });
    };

    return (
        <View style={styles.container}>
            <HeaderMenu title="Thông tin cá nhân" onBack={() => navigation.goBack()} />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* General Info Section */}
                <GeneralInformation
                    data={userInfo}
                    avatarUri={avatarUri}
                    onChangePhoto={handleChangePhoto}
                />

                {/* Connected Farms Section */}
                <FarmConnecter
                    totalFarms={totalFarms}
                    farms={connectedFarms}
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    onFarmPress={() => (navigation.navigate as any)('FarmStack')}
                />

                {/* Bottom Spacer */}
                <View style={styles.bottomSpacer} />
            </ScrollView>

            <ButtonBarMenu
                primaryTitle="Lưu thông tin"
                secondaryTitle="Huỷ"
                onPrimaryPress={handleSave}
                onSecondaryPress={() => {
                    navigation.goBack();
                }}
                // Using secondaryType="default" (gray border) as per design implicit
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
    },
    scrollContent: {
        paddingBottom: 16,
    },
    bottomSpacer: {
        height: 20,
    },
});
