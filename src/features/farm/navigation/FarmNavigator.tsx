import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ShrimpPondListScreens } from '../screens/pond/ShrimpPondListScreens';
import { ShrimpFarmScreens } from '../screens/ShrimpFarmScreens';

export type FarmStackParamList = {
  FarmList: undefined;
  PondDetail: { pond: any };
};

const Stack = createNativeStackNavigator<FarmStackParamList>();

import { FarmProvider } from '../context/FarmContext';

// ... existing imports

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
      </Stack.Navigator>
    </FarmProvider>
  );
};
