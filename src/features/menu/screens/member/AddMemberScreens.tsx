import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import { colors, spacing } from '@/styles';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { MenuStackParamList } from '@/features/menu/navigation/MenuNavigator';
import { useMenuContext } from '@/features/menu/context/MenuContext';
import { HeaderMenu } from '@/features/menu/components/HeaderMenu';
import { GeneralInformation } from '@/features/menu/components/member/GeneralInformation';
import { FeaturePermissions } from '@/features/menu/components/member/FeaturePermissions';
import { ButtonBarMenu } from '@/features/menu/components/ButtonBarMenu';

import { WorkUnit } from '@/features/menu/components/member/WorkUnit';
import { unitsData } from '@/features/menu/data/memberData';

const FARM_DATA = unitsData.filter(u => u.type === 'Trại');
const POND_DATA = unitsData.filter(u => u.type === 'Ao');

export const AddMemberScreens: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<MenuStackParamList>>();
    const { setTabBarVisible } = useTabBarVisibility();
    const { addMember } = useMenuContext();

    useFocusEffect(
        React.useCallback(() => {
            const timeout = setTimeout(() => {
                setTabBarVisible(false);
            }, 100);

            return () => {
                clearTimeout(timeout);
                setTabBarVisible(true);
            };
        }, [setTabBarVisible])
    );

    // General Information State
    const [name, setName] = useState('');
    const [contact, setContact] = useState('');
    const [role, setRole] = useState<'staff' | 'manager'>('staff');

    // Feature Permissions State
    const [managementLevel, setManagementLevel] = useState<'farm' | 'pond'>('farm');
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([]);
    const [modalVisible, setModalVisible] = useState(false);

    // Reset units when management level changes
    React.useEffect(() => {
        setSelectedUnitIds([]);
    }, [managementLevel]);

    const handleBack = () => {
        navigation.goBack();
    };

    const handleAddMember = () => {
        // Validation
        if (!name.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Vui lòng nhập tên thành viên',
            });
            return;
        }

        if (!contact.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Vui lòng nhập thông tin liên hệ',
            });
            return;
        }

        if (selectedUnitIds.length === 0) {
            Toast.show({
                type: 'error',
                text1: 'Vui lòng chọn ít nhất một đơn vị công tác',
            });
            return;
        }

        if (selectedPermissions.length === 0) {
            Toast.show({
                type: 'error',
                text1: 'Vui lòng chọn ít nhất một quyền thao tác',
            });
            return;
        }

        addMember({
            name,
            contact,
            role: role === 'staff' ? 'Nhân viên' : 'Quản lý', // Map to display string or ID
            managementLevel: managementLevel === 'farm' ? 'Cấp trại nuôi' : 'Cấp ao nuôi',
            permissions: selectedPermissions,
            unitIds: selectedUnitIds,
        });

        // Success Toast handled in MemberManagementScreens via param
        navigation.navigate('MemberManagement', { showSuccess: true } as any);
    };

    return (
        <View style={styles.container}>
            <HeaderMenu title="Thêm thành viên" onBack={handleBack} />

            <ScrollView contentContainerStyle={styles.content}>
                <GeneralInformation
                    name={name}
                    onNameChange={setName}
                    contact={contact}
                    onContactChange={setContact}
                    role={role}
                    onRoleChange={setRole}
                />

                <FeaturePermissions
                    managementLevel={managementLevel}
                    onManagementLevelChange={setManagementLevel}
                    selectedPermissions={selectedPermissions}
                    onPermissionsChange={setSelectedPermissions}
                    selectedUnitIds={selectedUnitIds}
                    onUnitsChange={setSelectedUnitIds}
                    onAddUnitPress={() => setModalVisible(true)}
                />
            </ScrollView>

            <ButtonBarMenu
                primaryTitle="Thêm thành viên"
                onPrimaryPress={handleAddMember}
                secondaryTitle="Huỷ"
                onSecondaryPress={handleBack}
                style={styles.footer}
            />

            <WorkUnit
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSave={setSelectedUnitIds}
                type={managementLevel}
                data={managementLevel === 'farm' ? FARM_DATA : POND_DATA}
                initialSelected={selectedUnitIds}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
    },
    content: {
        paddingVertical: spacing.sm,
        paddingHorizontal: 0, // Fill width
        gap: spacing.sm,
        paddingBottom: 100,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingBottom: spacing.lg, // Safe area space
    },
});
