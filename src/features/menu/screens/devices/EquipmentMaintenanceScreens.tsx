import React, { useState } from 'react';
import Toast from 'react-native-toast-message';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { colors, spacing } from '@/styles';
import { HeaderMenu } from '@/features/menu/components/HeaderMenu';
import { EquipmentMaintenance } from '@/features/menu/components/devices/EquipmentMaintenance';
import { ButtonBarMenu } from '@/features/menu/components/ButtonBarMenu';
import { MenuStackParamList } from '@/features/menu/navigation/MenuNavigator';

type EquipmentMaintenanceScreenRouteProp = RouteProp<MenuStackParamList, 'EquipmentMaintenance'>;

export const EquipmentMaintenanceScreens = () => {
    const navigation = useNavigation();
    const route = useRoute<EquipmentMaintenanceScreenRouteProp>();
    const { deviceId } = route.params || {};

    const [date, setDate] = useState(new Date());
    const [description, setDescription] = useState('');
    const [resetTime, setResetTime] = useState(false);

    const handleSave = () => {
        if (!description.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Vui lòng nhập mô tả công việc',
                position: 'top',
                visibilityTime: 3000,
            });
            return;
        }

        // Implement save logic here
        console.log('Maintained device:', deviceId, { date, description, resetTime });
        // Navigate back to HistoryDevices with success param and data
        (navigation as any).navigate({
            name: 'HistoryDevices',
            params: {
                success: true,
                deviceId,
                maintenanceData: {
                    date: date.toISOString(),
                    description,
                    resetTime,
                },
            },
            merge: true,
        });
    };

    const handleCancel = () => {
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <HeaderMenu title="Bảo trì thiết bị" onBack={() => navigation.goBack()} />

            <ScrollView contentContainerStyle={styles.content}>
                <EquipmentMaintenance
                    date={date}
                    onDateChange={setDate}
                    description={description}
                    onDescriptionChange={setDescription}
                    resetTime={resetTime}
                    onResetTimeChange={setResetTime}
                />
            </ScrollView>

            <View style={styles.footer}>
                <ButtonBarMenu
                    secondaryTitle="Huỷ"
                    primaryTitle="Lưu thông tin"
                    onSecondaryPress={handleCancel}
                    onPrimaryPress={handleSave}
                />
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
        paddingTop: spacing.sm,
        paddingBottom: spacing.md,
    },
    footer: {
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
});
