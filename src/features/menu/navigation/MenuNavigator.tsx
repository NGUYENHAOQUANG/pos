import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MenuScreens } from '@/features/menu/screens/MenuScreens';
import { PersonalInformationScreens } from '@/features/menu/screens/information/PersonalInformationScreens';

import { AquacultureManagementScreens } from '@/features/menu/screens/aquaculture/AquacultureManagementScreens';

import { AddAquacultureScreens } from '@/features/menu/screens/aquaculture/AddAquacultureScreens';
import { EditAquacultureScreens } from '@/features/menu/screens/aquaculture/EditAquacultureScreens';

export type MenuStackParamList = {
  MenuMain: undefined;
  PersonalInformation: undefined;
  AquacultureManagement: undefined;
  AddAquaculture: undefined;
  EditAquaculture: { aquaculture: any }; // Using any to avoid circular dependency or import ease, or verify import
};

const Stack = createNativeStackNavigator<MenuStackParamList>();

import { MenuProvider } from '@/features/menu/context/MenuContext';

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
        <Stack.Screen name="AquacultureManagement" component={AquacultureManagementScreens} />
        <Stack.Screen name="AddAquaculture" component={AddAquacultureScreens} />
        <Stack.Screen name="EditAquaculture" component={EditAquacultureScreens} />
      </Stack.Navigator>
    </MenuProvider>
  );
};
