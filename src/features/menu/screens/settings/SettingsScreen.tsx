import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { colors, spacing } from '@/styles';
import { HeaderSection } from '@/shared/components/layout/HeaderSection';
import { ButtonDevices } from '@/features/control/components/devices/ButtonDevices';
import { useSettingsStore } from '@/features/menu/store/settingsStore';

interface SettingRowProps {
    title: string;
    subtitle: string;
    value: boolean;
    onValueChange: (val: boolean) => void;
}

const SettingRow: React.FC<SettingRowProps> = ({ title, subtitle, value, onValueChange }) => (
    <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>{title}</Text>
            <Text style={styles.settingSubtitle}>{subtitle}</Text>
        </View>
        <ButtonDevices
            value={value}
            onValueChange={onValueChange}
            trackColor={colors.primaryOrange}
        />
    </View>
);

export const SettingsScreen: React.FC = () => {
    const soundEnabled = useSettingsStore(s => s.soundEnabled);
    const hapticEnabled = useSettingsStore(s => s.hapticEnabled);
    const alertSoundEnabled = useSettingsStore(s => s.alertSoundEnabled);
    const toggleSound = useSettingsStore(s => s.toggleSound);
    const toggleHaptic = useSettingsStore(s => s.toggleHaptic);
    const toggleAlertSound = useSettingsStore(s => s.toggleAlertSound);

    return (
        <View style={styles.container}>
            <HeaderSection title="Cài đặt" />

            <View style={styles.content}>
                {/* Feedback Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Phản hồi thao tác</Text>
                    <View style={styles.card}>
                        <SettingRow
                            title="Rung khi thao tác"
                            subtitle="Thiết bị rung nhẹ khi nhấn nút hoặc chuyển màn hình"
                            value={hapticEnabled}
                            onValueChange={toggleHaptic}
                        />
                    </View>
                    <View style={styles.card}>
                        <SettingRow
                            title="Âm thanh phản hồi"
                            subtitle="Phát âm báo khi thao tác thành công hoặc bật / tắt chức năng"
                            value={soundEnabled}
                            onValueChange={toggleSound}
                        />
                    </View>
                </View>

                {/* System Sound Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Âm thanh hệ thống</Text>
                    <View style={styles.card}>
                        <SettingRow
                            title="Âm thanh cảnh báo"
                            subtitle="Phát âm thanh khi có cảnh báo nhiệt độ, thiết bị hoặc sự cố"
                            value={alertSoundEnabled}
                            onValueChange={toggleAlertSound}
                        />
                    </View>
                </View>
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
        padding: spacing.md,
        gap: 32,
    },
    section: {
        gap: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 12,
        gap: 12,
    },
    settingInfo: {
        flex: 1,
        gap: 4,
    },
    settingTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.text,
    },
    settingSubtitle: {
        fontSize: 14,
        fontWeight: '400',
        color: colors.textSecondary,
    },
});
