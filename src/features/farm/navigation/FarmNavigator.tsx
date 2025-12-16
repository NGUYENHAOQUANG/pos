import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { FarmProvider } from '@/features/farm/context/FarmContext';
import { ShrimpPondListScreens } from '@/features/farm/screens/pond/ShrimpPondListScreens';
import { ShrimpFarmScreens } from '@/features/farm/screens/ShrimpFarmScreens';
import { PondInfoScreen } from '@/features/farm/screens/info/PondInfoScreen';
import { FarmInfoScreen } from '@/features/farm/screens/info/FarmInfoScreen';
import { ShrimpInspectionScreen } from '@/features/farm/screens/shrimp-inspection/ShrimpInspectionScreen';
import { ShrimpInspectionLogScreen } from '@/features/farm/screens/pondwork/ShrimpInspectionLogScreen';

export type FarmStackParamList = {
  FarmList: undefined;
  PondDetail: { pond: any };
  PondInfo: { pond: any };
  FarmInfo: { farm: any };
  ShrimpInspection: { pond: any; itemToEdit?: any };
  ShrimpInspectionLog: { pond: any };
};

const Stack = createNativeStackNavigator<FarmStackParamList>();

export const FarmNavigator = () => {
  return (
    <FarmProvider>
      <Stack.Navigator
        initialRouteName="FarmList"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="FarmList" component={ShrimpPondListScreens} />
        <Stack.Screen name="PondDetail" component={ShrimpFarmScreens} />
        <Stack.Screen name="PondInfo" component={PondInfoScreen} />
        <Stack.Screen name="FarmInfo" component={FarmInfoScreen} />
        <Stack.Screen name="ShrimpInspection" component={ShrimpInspectionScreen} />
        <Stack.Screen name="ShrimpInspectionLog" component={ShrimpInspectionLogScreen} />
      </Stack.Navigator>
    </FarmProvider>
  );
};
