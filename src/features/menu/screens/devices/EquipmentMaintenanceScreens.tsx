import React, { useState } from 'react';
import Toast from 'react-native-toast-message';
import { ToastMessages } from '@/features/menu/utils/toastMessages';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { spacing } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { HeaderMenu } from '@/features/menu/components/HeaderMenu';
import { EquipmentMaintenance } from '@/features/menu/components/devices/EquipmentMaintenance';
import { ButtonBarMenu } from '@/features/menu/components/ButtonBarMenu';
import { MenuStackParamList } from '@/features/menu/navigation/MenuNavigator';

type EquipmentMaintenanceScreenRouteProp = RouteProp<MenuStackParamList, 'EquipmentMaintenance'>;

export const EquipmentMaintenanceScreens = () => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    const navigation = useNavigation();
    const route = useRoute<EquipmentMaintenanceScreenRouteProp>();
    const { deviceId } = route.params || {};

    const [date, setDate] = useState(new Date());
    const [description, setDescription] = useState('');
    const [resetTime, setResetTime] = useState(false);

    const handleSave = () => {
        if (!description.trim()) {
            Toast.show(ToastMessages.Device.MAINTENANCE_DESC_REQUIRED);
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
                    secondaryTitle="Hủy"
                    primaryTitle="Lưu thông tin"
                    onSecondaryPress={handleCancel}
                    onPrimaryPress={handleSave}
                />
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
            paddingTop: spacing.sm,
            paddingBottom: spacing.md,
            paddingHorizontal: spacing.md,
        },
        footer: {
            backgroundColor: theme.background,
            borderTopWidth: 1,
            borderTopColor: theme.defaultBorder,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
        },
    });
