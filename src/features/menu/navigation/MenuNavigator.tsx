import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MenuScreens } from '@/features/menu/screens/MenuScreens';
import { PersonalInformationScreens } from '@/features/menu/screens/information/PersonalInformationScreens';
import { AquacultureManagementScreens } from '@/features/menu/screens/aquaculture/AquacultureManagementScreens';
import { AddAquacultureScreens } from '@/features/menu/screens/aquaculture/AddAquacultureScreens';
import { EditAquacultureScreens } from '@/features/menu/screens/aquaculture/EditAquacultureScreens';
import { MemberManagementScreens } from '@/features/menu/screens/member/MemberManagementScreens';
import { AddMemberScreens } from '@/features/menu/screens/member/AddMemberScreens';
import { EditMemberScreens } from '@/features/menu/screens/member/EditMemberScreens';
import { EnvironmentParameter } from '@/features/farm/components/pondwork/environment/EnvironmentParameterSection';
import { Aquaculture, Member } from '@/features/menu/types/menu.types';
import { SettingEnvironmentScreens } from '@/features/farm/screens/pondwork/environment/SettingEnvironmentScreens';
import { EditEnvironmentScreens } from '@/features/menu/screens/environment/EditEnvironmentScreens';
import { MenuProvider } from '@/features/menu/context/MenuContext';
import { DeviceManagement } from '@/features/menu/screens/devices/DeviceManagement';
import { AddDeviceScreens } from '@/features/menu/screens/devices/AddDeviceScreens';
import { EditDevicesScreens } from '@/features/menu/screens/devices/EditDevicesScreens';
import { HistoryDevicesScreens } from '@/features/menu/screens/devices/HistoryDevicesScreens';
import { EquipmentMaintenanceScreens } from '@/features/menu/screens/devices/EquipmentMaintenanceScreens';
import { EditEquimentMaintenanceScreens } from '@/features/menu/screens/devices/EditEquimentMaintenanceScreens';
import { FarmNavigator } from '@/features/farm/navigation/FarmNavigator';

export type MenuStackParamList = {
    MenuMain: undefined;
    PersonalInformation: undefined;
    AquacultureManagement: undefined;
    MemberManagement: undefined;
    AddAquaculture: undefined;
    EditAquaculture: { aquaculture: Aquaculture };
    AddMember: undefined;
    EditMember: { member: Member };
    SettingEnvironment: undefined;
    EditEnvironment: {
        parameter: EnvironmentParameter;
        onSave: (data: EnvironmentParameter) => void;
    };
    DeviceManagement: undefined;
    AddDevice: undefined;
    EditDevice: { deviceId: string };
    HistoryDevices: { deviceId?: string };
    EquipmentMaintenance: { deviceId?: string };
    EditEquimentMaintenance: { deviceId: string; maintenanceId: string; initialData: any };
    FarmStack: undefined;
};

const Stack = createNativeStackNavigator<MenuStackParamList>();

export const MenuNavigator = () => {
    return (
        <MenuProvider>
            <Stack.Navigator
                initialRouteName="MenuMain"
                screenOptions={{
                    headerShown: false,
                }}
            >
                <Stack.Screen name="MenuMain" component={MenuScreens} />
                <Stack.Screen name="PersonalInformation" component={PersonalInformationScreens} />
                <Stack.Screen name="MemberManagement" component={MemberManagementScreens} />
                <Stack.Screen
                    name="AquacultureManagement"
                    component={AquacultureManagementScreens}
                />
                <Stack.Screen name="AddAquaculture" component={AddAquacultureScreens} />
                <Stack.Screen name="EditAquaculture" component={EditAquacultureScreens} />
                <Stack.Screen name="AddMember" component={AddMemberScreens} />
                <Stack.Screen name="EditMember" component={EditMemberScreens} />
                <Stack.Screen name="SettingEnvironment" component={SettingEnvironmentScreens} />
                <Stack.Screen name="EditEnvironment" component={EditEnvironmentScreens} />
                <Stack.Screen name="DeviceManagement" component={DeviceManagement} />
                <Stack.Screen name="AddDevice" component={AddDeviceScreens} />
                <Stack.Screen name="EditDevice" component={EditDevicesScreens} />
                <Stack.Screen name="HistoryDevices" component={HistoryDevicesScreens} />
                <Stack.Screen name="EquipmentMaintenance" component={EquipmentMaintenanceScreens} />
                <Stack.Screen
                    name="EditEquimentMaintenance"
                    component={EditEquimentMaintenanceScreens}
                />
                <Stack.Screen name="FarmStack" component={FarmNavigator} />
            </Stack.Navigator>
        </MenuProvider>
    );
};
