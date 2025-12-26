import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    FlatList,
    ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing, borderRadius, shadows } from '@/styles';
// import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { FarmLocation } from '@/features/control/components/HeaderCamLocation';
import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { MenuStackParamList } from '@/features/menu/navigation/MenuNavigator';
import { CompositeNavigationProp } from '@react-navigation/native';
import {
    EnvironmentParameterSection,
    EnvironmentParameter,
} from '@/features/farm/components/pondwork/environment/EnvironmentParameterSection';
import { ButtonBarFarm } from '@/features/farm/components/ButtonBarFarm';
import Toast from 'react-native-toast-message';

type NavigationProp = CompositeNavigationProp<
    NativeStackNavigationProp<FarmStackParamList>,
    NativeStackNavigationProp<MenuStackParamList>
>;

const DEFAULT_LOCATIONS: FarmLocation[] = [
    { id: '1', name: 'Trại Kiên Giang' },
    { id: '2', name: 'Trại Cà Mau' },
    { id: '3', name: 'Trại Bạc Liêu' },
    { id: '4', name: 'Trại Sóc Trăng' },
];

const ENVIRONMENT_PARAMETERS: EnvironmentParameter[] = [
    { id: '1', name: 'pH', limit: '7.5 - 8.5', isChecked: true },
    { id: '2', name: 'DO (mg/L)', limit: '5 - 8', isChecked: true },
    { id: '3', name: 'Nhiệt độ (°C)', limit: '25 - 32', isChecked: true },
    { id: '4', name: 'Độ trong (cm)', limit: '20 - 40', isChecked: true },
    { id: '5', name: 'Độ mặn (ppt)', limit: '20 - 35', isChecked: true },
    { id: '6', name: 'Độ kiềm (mg/L)', limit: '150 - 250', isChecked: true },
];

const ADVANCED_PARAMETERS: EnvironmentParameter[] = [
    { id: '7', name: 'Kali (mg/L)', limit: '250 - 400', isChecked: false },
    { id: '8', name: 'TAN (mg/L)', limit: '0 - 3', isChecked: false },
    { id: '9', name: 'Magie (mg/L)', limit: '750 - 1400', isChecked: true },
    { id: '10', name: 'NO3 (mg/L)', limit: '0 - 10', isChecked: false },
];

export const SettingEnvironmentScreens: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const insets = useSafeAreaInsets();
    // const { setTabBarVisible } = useTabBarVisibility();

    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<FarmLocation>(DEFAULT_LOCATIONS[0]);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
    const dropdownButtonRef = useRef<View>(null);
    const [parameters, setParameters] = useState<EnvironmentParameter[]>(ENVIRONMENT_PARAMETERS);
    const [advancedParameters, setAdvancedParameters] =
        useState<EnvironmentParameter[]>(ADVANCED_PARAMETERS);

    // No local tab bar visibility logic needed anymore

    const handleBack = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        }
    };

    const handleDropdownPress = () => {
        if (dropdownButtonRef.current) {
            dropdownButtonRef.current.measureInWindow((x, y, width, height) => {
                setDropdownPosition({
                    top: y + height + 4,
                    left: x,
                    width: width,
                });
                setIsDropdownVisible(true);
            });
        }
    };

    const handleSelectLocation = (location: FarmLocation) => {
        setSelectedLocation(location);
        setIsDropdownVisible(false);
    };

    const handleToggleParameter = (id: string) => {
        setParameters(prev =>
            prev.map(param => (param.id === id ? { ...param, isChecked: !param.isChecked } : param))
        );
    };

    const handleToggleAdvancedParameter = (id: string) => {
        setAdvancedParameters(prev =>
            prev.map(param => (param.id === id ? { ...param, isChecked: !param.isChecked } : param))
        );
    };

    const handleUpdateParameter = (updatedParam: EnvironmentParameter) => {
        setParameters(prev => prev.map(p => (p.id === updatedParam.id ? updatedParam : p)));
        setAdvancedParameters(prev => prev.map(p => (p.id === updatedParam.id ? updatedParam : p)));
    };

    const handleEdit = (parameter: EnvironmentParameter) => {
        navigation.navigate('EditEnvironment', {
            parameter,
            onSave: handleUpdateParameter,
        });
    };

    const handleSave = () => {
        Toast.show({
            type: 'success',
            text1: 'Đã thêm chỉ số',
            position: 'top',
            visibilityTime: 3000,
        });
        navigation.goBack();
    };

    const handleReset = () => {
        setParameters([...ENVIRONMENT_PARAMETERS]);
        setAdvancedParameters([...ADVANCED_PARAMETERS]);
    };

    const renderDropdownItem = ({ item }: { item: FarmLocation }) => {
        const isSelected = item.id === selectedLocation.id;
        return (
            <TouchableOpacity
                style={[styles.dropdownItem, isSelected && styles.dropdownItemSelected]}
                onPress={() => handleSelectLocation(item)}
                activeOpacity={0.7}
            >
                <Text
                    style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextSelected]}
                >
                    {item.name}
                </Text>
                {isSelected && <Ionicons name="checkmark" size={18} color={colors.primary} />}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerSection}>
                {/* Header */}
                <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                    <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Thiết lập thông số môi trường</Text>
                    <View style={styles.headerSpacer} />
                </View>

                {/* Divider between header and dropdown */}
                <View style={styles.headerDivider} />

                {/* Dropdown Button */}
                <View style={styles.dropdownWrapper}>
                    <View ref={dropdownButtonRef} collapsable={false}>
                        <TouchableOpacity
                            style={styles.dropdownButton}
                            onPress={handleDropdownPress}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.dropdownButtonText}>{selectedLocation.name}</Text>
                            <Ionicons
                                name={isDropdownVisible ? 'chevron-up' : 'chevron-down'}
                                size={16}
                                color={colors.textSecondary}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Content */}
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {/* Section - Nhóm mặc định */}
                <EnvironmentParameterSection
                    title="Nhóm mặc định"
                    subtitle="Bộ thông số chuẩn khi đo môi trường."
                    parameters={parameters}
                    onToggleParameter={handleToggleParameter}
                    onEdit={handleEdit}
                />

                {/* Section - Nhóm nâng cao */}
                <EnvironmentParameterSection
                    title="Nhóm nâng cao"
                    subtitle="Bộ thông số mở rộng để theo dõi."
                    parameters={advancedParameters}
                    onToggleParameter={handleToggleAdvancedParameter}
                    onEdit={handleEdit}
                />
            </ScrollView>

            {/* Footer Buttons */}
            <View style={[styles.footerContainer, { paddingBottom: insets.bottom }]}>
                <ButtonBarFarm
                    primaryTitle="Lưu thông tin"
                    secondaryTitle="Thiết lập lại"
                    onPrimaryPress={handleSave}
                    onSecondaryPress={handleReset}
                    primaryDisabled={false}
                    secondaryType="primary"
                />
            </View>

            {/* Dropdown Modal */}
            <Modal
                visible={isDropdownVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setIsDropdownVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setIsDropdownVisible(false)}
                >
                    <View
                        style={[
                            styles.dropdownModal,
                            {
                                top: dropdownPosition.top,
                                left: dropdownPosition.left,
                                width: dropdownPosition.width,
                            },
                        ]}
                    >
                        <FlatList
                            data={DEFAULT_LOCATIONS}
                            keyExtractor={item => item.id}
                            renderItem={renderDropdownItem}
                            scrollEnabled={false}
                            contentContainerStyle={styles.dropdownScrollContent}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
    },
    headerSection: {
        backgroundColor: colors.white,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 12,
        paddingHorizontal: spacing.md,
        backgroundColor: colors.white,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.sm,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
        textAlign: 'center',
    },
    headerSpacer: {
        width: 40,
    },
    headerDivider: {
        height: 1,
        backgroundColor: colors.borderLight,
    },
    dropdownWrapper: {
        marginHorizontal: spacing.md,
        marginVertical: spacing.sm,
        height: 40,
    },
    dropdownButton: {
        paddingHorizontal: 12,
        height: 40,
        borderRadius: borderRadius.sm,
        borderWidth: 1,
        borderColor: colors.borderLight,
        backgroundColor: colors.white,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dropdownButtonText: {
        fontWeight: '400',
        fontStyle: 'normal',
        fontSize: 16,
        lineHeight: 24,
        letterSpacing: 0,
        color: colors.text,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: spacing.sm,
        paddingBottom: spacing.md,
    },
    footerContainer: {
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.borderLight,
        paddingTop: 12 - 4,
    },
    modalOverlay: {
        flex: 1,
    },
    dropdownModal: {
        position: 'absolute',
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.gray[200],
        ...shadows.md,
    },
    dropdownScrollContent: {
        paddingVertical: spacing.xs,
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.sm + 2,
        paddingHorizontal: spacing.md,
        marginHorizontal: spacing.xs,
        borderRadius: borderRadius.sm,
    },
    dropdownItemSelected: {
        backgroundColor: colors.gray[100],
    },
    dropdownItemText: {
        fontSize: 14,
        color: colors.text,
    },
    dropdownItemTextSelected: {
        fontWeight: '500',
        color: colors.text,
    },
});
