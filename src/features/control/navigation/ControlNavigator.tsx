import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DeviceControlScreens } from '../screens/DeviceControlScreens';
import { DevicesInPondScreens } from '../screens/devices/DeviceInPondScreens';
import { ScheduleActivitieScreens } from '../screens/schedule/ScheduleActivitieScreens';
import { HistoryActivitieScreens } from '../screens/schedule/HistoryActivitieScreens';

export type ControlStackParamList = {
  ControlList: undefined;
  ControlDetail: { pondName: string };
  Schedule: { pondName: string };
  History: { pondName: string };
};

const Stack = createNativeStackNavigator<ControlStackParamList>();

export const ControlNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="ControlList"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="ControlList" component={DeviceControlScreens} />
      <Stack.Screen name="ControlDetail" component={DevicesInPondScreens} />
      <Stack.Screen name="Schedule" component={ScheduleActivitieScreens} />
      <Stack.Screen name="History" component={HistoryActivitieScreens} />
    </Stack.Navigator>
  );
};
