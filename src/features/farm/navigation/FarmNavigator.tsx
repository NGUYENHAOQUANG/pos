import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { FarmProvider } from '../context/FarmContext';
import { ShrimpPondListScreens } from '../screens/pond/ShrimpPondListScreens';
import { ShrimpFarmScreens } from '../screens/ShrimpFarmScreens';
import { PondInfoScreen } from '../screens/info/PondInfoScreen';
import { FarmInfoScreen } from '../screens/info/FarmInfoScreen';

export type FarmStackParamList = {
  FarmList: undefined;
  PondDetail: { pond: any };
  PondInfo: { pond: any };
  FarmInfo: { farm: any };
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
      </Stack.Navigator>
    </FarmProvider>
  );
};
