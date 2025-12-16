import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ShrimpPondListScreens } from '@/features/farm/screens/pond/ShrimpPondListScreens';
import { ShrimpFarmScreens } from '@/features/farm/screens/ShrimpFarmScreens';

export type FarmStackParamList = {
  FarmList: undefined;
  PondDetail: { pond: any };
  FeedTheShrimp: { pondId: string };
  EditFeeder: { pondId: string; jobId?: string };
  FeedingLog: { pondId: string };
};

const Stack = createNativeStackNavigator<FarmStackParamList>();

import { FarmProvider } from '@/features/farm/context/FarmContext';
import { AddFeederScreens } from '@/features/farm/screens/pond/feed/AddFeederScreens';
import { EditFeederScreens } from '@/features/farm/screens/pond/feed/EditFeederScreens';
import { FeedingLogScreens } from '@/features/farm/screens/pond/feed/FeedingLogScreens';

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
        <Stack.Screen name="FeedTheShrimp" component={AddFeederScreens} />
        <Stack.Screen name="EditFeeder" component={EditFeederScreens} />
        <Stack.Screen name="FeedingLog" component={FeedingLogScreens} />
      </Stack.Navigator>
    </FarmProvider>
  );
};
