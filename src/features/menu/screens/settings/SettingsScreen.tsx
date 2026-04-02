import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { colors, spacing } from '@/styles';
import { HeaderSection } from '@/shared/components/layout/HeaderSection';
import { ButtonDevices } from '@/features/control/components/devices/ButtonDevices';
import { useSettingsStore, AutoLockTimeout } from '@/features/menu/store/settingsStore';
import { Loading } from '@/shared/components/ui/Loading';
import {
    checkBiometricAvailability,
    AUTO_LOCK_OPTIONS,
} from '@/shared/components/security/BiometricLockScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '@/app/navigation/AppStack';

interface SettingRowProps {
    title: string;
    subtitle: string;
    value: boolean;
    onValueChange: (val: boolean) => void;
    disabled?: boolean;
}

const SettingRow: React.FC<SettingRowProps> = ({
    title,
    subtitle,
    value,
    onValueChange,
    disabled = false,
}) => (
    <View style={[styles.settingRow, disabled && styles.settingRowDisabled]}>
        <View style={styles.settingInfo}>
            <Text style={[styles.settingTitle, disabled && styles.settingTextDisabled]}>
                {title}
            </Text>
            <Text style={[styles.settingSubtitle, disabled && styles.settingTextDisabled]}>
                {subtitle}
            </Text>
        </View>
        <ButtonDevices
            value={value}
            onValueChange={onValueChange}
            trackColor={colors.primaryOrange}
            disabled={disabled}
        />
    </View>
);

interface AutoLockSelectorProps {
    currentValue: AutoLockTimeout;
    onSelect: (value: AutoLockTimeout) => void;
    disabled?: boolean;
    onExpand?: () => void;
}

const AutoLockSelector: React.FC<AutoLockSelectorProps> = ({
    currentValue,
    onSelect,
    disabled = false,
    onExpand,
}) => {
    const [expanded, setExpanded] = useState(false);
    const currentLabel = AUTO_LOCK_OPTIONS.find(o => o.value === currentValue)?.label ?? '';

    const handleToggle = () => {
        if (disabled) return;
        const willExpand = !expanded;
        setExpanded(willExpand);
        if (willExpand && onExpand) {
            setTimeout(onExpand, 100);
        }
    };

    return (
        <View style={[styles.card, disabled && styles.settingRowDisabled]}>
            <TouchableOpacity
                style={styles.selectorHeader}
                onPress={handleToggle}
                activeOpacity={0.7}
                disabled={disabled}
            >
                <View style={styles.settingInfo}>
                    <Text style={[styles.settingTitle, disabled && styles.settingTextDisabled]}>
                        Tự động khóa
                    </Text>
                    <Text style={[styles.settingSubtitle, disabled && styles.settingTextDisabled]}>
                        {currentLabel}
                    </Text>
                </View>
                <Ionicons
                    name={expanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={disabled ? colors.gray[400] : colors.textSecondary}
                />
            </TouchableOpacity>

            {expanded && !disabled && (
                <View style={styles.optionsList}>
                    {AUTO_LOCK_OPTIONS.map(option => {
                        const isActive = option.value === currentValue;
                        return (
                            <TouchableOpacity
                                key={option.value}
                                style={[styles.optionItem, isActive && styles.optionItemActive]}
                                onPress={() => {
                                    onSelect(option.value);
                                    setExpanded(false);
                                }}
                                activeOpacity={0.7}
                            >
                                <Text
                                    style={[styles.optionText, isActive && styles.optionTextActive]}
                                >
                                    {option.label}
                                </Text>
                                {isActive && (
                                    <Ionicons name="checkmark" size={18} color={colors.primary} />
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            )}
        </View>
    );
};

export const SettingsScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
    const soundEnabled = useSettingsStore(s => s.soundEnabled);
    const hapticEnabled = useSettingsStore(s => s.hapticEnabled);
    const alertSoundEnabled = useSettingsStore(s => s.alertSoundEnabled);
    const tabSlideEnabled = useSettingsStore(s => s.tabSlideEnabled);
    const tabSwipeEnabled = useSettingsStore(s => s.tabSwipeEnabled);
    const logoLoadingEnabled = useSettingsStore(s => s.logoLoadingEnabled);
    const lockMethod = useSettingsStore(s => s.lockMethod);
    const autoLockTimeout = useSettingsStore(s => s.autoLockTimeout);
    const pinHash = useSettingsStore(s => s.pinHash);
    const toggleSound = useSettingsStore(s => s.toggleSound);
    const toggleHaptic = useSettingsStore(s => s.toggleHaptic);
    const toggleAlertSound = useSettingsStore(s => s.toggleAlertSound);
    const toggleTabSlide = useSettingsStore(s => s.toggleTabSlide);
    const toggleTabSwipe = useSettingsStore(s => s.toggleTabSwipe);
    const toggleLogoLoading = useSettingsStore(s => s.toggleLogoLoading);
    const setLockMethod = useSettingsStore(s => s.setLockMethod);
    const setAutoLockTimeout = useSettingsStore(s => s.setAutoLockTimeout);

    const [biometricAvailable, setBiometricAvailable] = useState(false);
    const [biometricLabel, setBiometricLabel] = useState('');

    useEffect(() => {
        checkBiometricAvailability().then(result => {
            setBiometricAvailable(result.available);
            setBiometricLabel(result.biometryLabel);
        });
    }, []);

    const scrollRef = useRef<ScrollView>(null);
    const isLockEnabled = lockMethod !== 'none';
    const [showLoadingDemo, setShowLoadingDemo] = useState(false);

    // Show a 3s loading demo when toggling logo loading ON
    const handleToggleLogoLoading = () => {
        toggleLogoLoading();
        if (!logoLoadingEnabled) {
            setShowLoadingDemo(true);
            setTimeout(() => setShowLoadingDemo(false), 3000);
        }
    };

    return (
        <Loading isLoading={showLoadingDemo} transparent>
            <View style={styles.container}>
                <HeaderSection title="Cài đặt" />

                <ScrollView
                    ref={scrollRef}
                    style={styles.content}
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
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

                    {/* Animation Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Hiệu ứng chuyển động</Text>
                        <View style={styles.card}>
                            <SettingRow
                                title="Trượt chuyển tab"
                                subtitle="Hiệu ứng trượt ngang khi chuyển giữa các tab chính (cần khởi động lại)"
                                value={tabSlideEnabled}
                                onValueChange={toggleTabSlide}
                            />
                        </View>
                        <View style={styles.card}>
                            <SettingRow
                                title="Vuốt ngang chuyển tab"
                                subtitle="Vuốt sang trái / phải để chuyển giữa các tab chính"
                                value={tabSwipeEnabled}
                                onValueChange={toggleTabSwipe}
                                disabled={!tabSlideEnabled}
                            />
                        </View>
                        <View style={styles.card}>
                            <SettingRow
                                title="Logo loading"
                                subtitle="Dùng logo MebiEco làm hiệu ứng tải thay cho Loading mặc định"
                                value={logoLoadingEnabled}
                                onValueChange={handleToggleLogoLoading}
                            />
                        </View>
                    </View>

                    {/* Security Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Bảo mật</Text>

                        {/* PIN toggle — primary lock method */}
                        <View style={styles.card}>
                            <SettingRow
                                title="Khóa bằng mã PIN"
                                subtitle="Nhập mã PIN 4 số để mở khóa ứng dụng"
                                value={isLockEnabled}
                                onValueChange={enabled => {
                                    if (enabled) {
                                        if (!pinHash) {
                                            navigation.navigate('PinSetup', { mode: 'create' });
                                            return;
                                        }
                                        setLockMethod('pin');
                                    } else {
                                        navigation.navigate('PinSetup', { mode: 'disable' });
                                    }
                                }}
                            />
                        </View>

                        {/* Biometric toggle — only show when PIN is active + device supports */}
                        {biometricAvailable && isLockEnabled && (
                            <View style={styles.card}>
                                <SettingRow
                                    title={`Mở khóa bằng ${biometricLabel}`}
                                    subtitle={`Dùng ${biometricLabel} thay cho mã PIN để mở khóa nhanh hơn`}
                                    value={lockMethod === 'both'}
                                    onValueChange={enabled => {
                                        setLockMethod(enabled ? 'both' : 'pin');
                                    }}
                                />
                            </View>
                        )}

                        {/* PIN management buttons */}
                        {pinHash && isLockEnabled && (
                            <View style={styles.pinActions}>
                                <TouchableOpacity
                                    style={styles.pinActionButton}
                                    onPress={() =>
                                        navigation.navigate('PinSetup', { mode: 'change' })
                                    }
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name="key-outline" size={18} color={colors.primary} />
                                    <Text style={styles.pinActionText}>Đổi mã PIN</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.pinActionButton}
                                    onPress={() =>
                                        navigation.navigate('PinSetup', { mode: 'remove' })
                                    }
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name="trash-outline" size={18} color={colors.error} />
                                    <Text style={[styles.pinActionText, { color: colors.error }]}>
                                        Xóa mã PIN
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Auto-lock timeout — only show when lock is active */}
                        {isLockEnabled && (
                            <AutoLockSelector
                                currentValue={autoLockTimeout}
                                onSelect={setAutoLockTimeout}
                                onExpand={() => scrollRef.current?.scrollToEnd({ animated: true })}
                            />
                        )}
                    </View>
                </ScrollView>
            </View>
        </Loading>
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
    contentContainer: {
        padding: spacing.md,
        gap: 32,
        paddingBottom: 40,
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
        overflow: 'hidden',
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
    settingRowDisabled: {
        opacity: 0.4,
    },
    settingTextDisabled: {
        color: colors.gray[400],
    },
    selectorHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 12,
        gap: 12,
    },
    optionsList: {
        borderTopWidth: 1,
        borderTopColor: colors.borderLight,
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.borderLight,
    },
    optionItemActive: {
        backgroundColor: colors.blue[25],
    },
    optionText: {
        fontSize: 14,
        fontWeight: '400',
        color: colors.text,
    },
    optionTextActive: {
        fontWeight: '500',
        color: colors.primary,
    },
    pinActions: {
        flexDirection: 'row',
        gap: 8,
    },
    pinActionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: colors.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        paddingVertical: 10,
    },
    pinActionText: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.primary,
    },
});
