import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FarmProvider, JobExecution } from '@/features/farm/context/FarmContext';
import { PondData, FarmData, CycleData } from '@/features/farm/types/farm.types';
import { ShrimpPondListScreens } from '../screens/pond/ShrimpPondListScreens';
import { ShrimpFarmScreens } from '../screens/ShrimpFarmScreens';
import { PondInfoScreen } from '@/features/farm/screens/info/PondInfoScreen';
import { FarmInfoScreen } from '@/features/farm/screens/info/FarmInfoScreen';
import { ShrimpInspectionScreen } from '@/features/farm/screens/pondwork/shrimp-inspection/ShrimpInspectionScreen';
import { PondworkLogScreen } from '@/features/farm/screens/pondwork/shrimp-inspection/ShrimpInspectionLogScreen';
import { AddEnvironmentScreen } from '@/features/farm/screens/pondwork/environment/AddEnvironmentScreen';
import { SettingEnvironment } from '@/features/farm/screens/pondwork/environment/SettingEnvironment';
import { EnvironmentLogScreen } from '@/features/farm/screens/pondwork/environment/EnvironmentLogScreen';
import { CreateCycleScreen } from '@/features/farm/screens/pond/CreateCycleScreen';
import { AddSiphonScreen } from '@/features/farm/screens/pondwork/xyphon/AddSiphonScreen';
import { SiphonLogScreen } from '@/features/farm/screens/pondwork/xyphon/SiphonLogScreen';
import { WaterSupplyScreen } from '@/features/farm/screens/pond/watersupply/WaterSupplyScreen';
import { WaterSupplyLogScreen } from '@/features/farm/screens/pond/watersupply/WaterSupplyLogScreen';

import { AddFeederScreens } from '@/features/farm/screens/pondwork/feed/AddFeederScreens';
import { EditFeederScreens } from '@/features/farm/screens/pondwork/feed/EditFeederScreens';
import { FeedingLogScreens } from '@/features/farm/screens/pondwork/feed/FeedingLogScreens';
import { AddWaterTreatmentScreens } from '@/features/farm/screens/pondwork/water-treatment/AddWaterTreatmentScreens';
import { EditWaterTreatmentScreens } from '@/features/farm/screens/pondwork/water-treatment/EditWaterTreatmentScreens';
import { WaterTreatmentLogScreens } from '@/features/farm/screens/pondwork/water-treatment/WaterTreatmentLogScreens';

export type FarmStackParamList = {
  FarmList: undefined;
  PondDetail: { pond: PondData };
  FeedTheShrimp: { pondId: string };
  EditFeeder: { pondId: string; jobId?: string };
  FeedingLog: { pondId: string };

  PondInfo: { pond: PondData };
  FarmInfo: { farm: FarmData };
  ShrimpInspectionScreen: { pond: PondData; itemToEdit?: JobExecution };
  PondworkLogScreen: { pond: PondData };
  AddEnvironmentScreen: { pond: PondData; itemToEdit?: JobExecution };
  SettingEnvironment: undefined;
  EnvironmentLogScreen: { pond: PondData };
  CreateCycle: { pondId: string; initialData?: CycleData | null };
  AddSiphonScreen: { pond: PondData; itemToEdit?: JobExecution };
  SiphonLog: { pond: PondData };
  AddWaterTreatmentScreen: { pond: PondData; itemToEdit?: JobExecution };
  EditWaterTreatmentScreens: { pondId: string; jobId: string };
  WaterTreatmentLog: { pondId?: string; pond?: PondData };
  WaterSupply: { pond?: any; item?: any };
  WaterSupplyLog: { pond: any };
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
        <Stack.Screen name="CreateCycle" component={CreateCycleScreen} />
        <Stack.Screen name="AddSiphonScreen" component={AddSiphonScreen} />
        <Stack.Screen name="SiphonLog" component={SiphonLogScreen} />
        <Stack.Screen name="AddWaterTreatmentScreen" component={AddWaterTreatmentScreens} />
        <Stack.Screen name="EditWaterTreatmentScreens" component={EditWaterTreatmentScreens} />
        <Stack.Screen name="WaterTreatmentLog" component={WaterTreatmentLogScreens} />
        <Stack.Screen name="WaterSupply" component={WaterSupplyScreen} />
        <Stack.Screen name="WaterSupplyLog" component={WaterSupplyLogScreen} />
      </Stack.Navigator>
    </FarmProvider>
  );
};
