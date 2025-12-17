import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FarmProvider } from '@/features/farm/context/FarmContext';
import { ShrimpPondListScreens } from '@/features/farm/screens/pond/ShrimpPondListScreens';
import { ShrimpFarmScreens } from '@/features/farm/screens/ShrimpFarmScreens';
import { PondInfoScreen } from '@/features/farm/screens/info/PondInfoScreen';
import { FarmInfoScreen } from '@/features/farm/screens/info/FarmInfoScreen';
import { ShrimpInspectionScreen } from '@/features/farm/screens/pondwork/shrimp-inspection/ShrimpInspectionScreen';
import { PondworkLogScreen } from '@/features/farm/screens/pondwork/shrimp-inspection/ShrimpInspectionLogScreen';
import { AddEnvironmentScreen } from '@/features/farm/screens/pondwork/environment/AddEnvironmentScreen';
import { SettingEnvironment } from '@/features/farm/screens/pondwork/environment/SettingEnvironment';
import { EnvironmentLogScreen } from '@/features/farm/screens/pondwork/environment/EnvironmentLogScreen';

export type FarmStackParamList = {
  FarmList: undefined;
  PondDetail: { pond: any };
  FeedTheShrimp: { pondId: string };
  EditFeeder: { pondId: string; jobId?: string };
  FeedingLog: { pondId: string };
  PondInfo: { pond: any };
  FarmInfo: { farm: any };
  ShrimpInspectionScreen: { pond: any; itemToEdit?: any };
  PondworkLogScreen: { pond: any };
  AddEnvironmentScreen: { pond: any; itemToEdit?: any };
  SettingEnvironment: undefined;
  EnvironmentLogScreen: { pond: any };
};

const Stack = createNativeStackNavigator<FarmStackParamList>();

import { AddFeederScreens } from '@/features/farm/screens/pond/feed/AddFeederScreens';
import { EditFeederScreens } from '@/features/farm/screens/pond/feed/EditFeederScreens';
import { FeedingLogScreens } from '@/features/farm/screens/pond/feed/FeedingLogScreens';
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
        <Stack.Screen name="FeedTheShrimp" component={AddFeederScreens} />
        <Stack.Screen name="EditFeeder" component={EditFeederScreens} />
        <Stack.Screen name="FeedingLog" component={FeedingLogScreens} />
        <Stack.Screen name="PondInfo" component={PondInfoScreen} />
        <Stack.Screen name="FarmInfo" component={FarmInfoScreen} />
        <Stack.Screen name="ShrimpInspectionScreen" component={ShrimpInspectionScreen} />
        <Stack.Screen name="PondworkLogScreen" component={PondworkLogScreen} />
        <Stack.Screen name="AddEnvironmentScreen" component={AddEnvironmentScreen} />
        <Stack.Screen name="SettingEnvironment" component={SettingEnvironment} />
        <Stack.Screen name="EnvironmentLogScreen" component={EnvironmentLogScreen} />
      </Stack.Navigator>
    </FarmProvider>
  );
};
