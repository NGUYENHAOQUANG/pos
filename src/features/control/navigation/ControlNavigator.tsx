import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DeviceControlScreens } from '../screens/DeviceControlScreens';
import { DevicesInPondScreens } from '../screens/devices/DeviceInPondScreens';
import { ScheduleActivitieScreens } from '../screens/schedule/ScheduleActivitieScreens';
import { HistoryActivitieScreens } from '../screens/schedule/HistoryActivitieScreens';
import { ConnectDeviceScreens } from '../screens/devices/ConnectDeviceScreens';
import CustomFeedingMachine from '../screens/CustomFeedingMachine/CustomFeedingMachineScreen';

export type ControlStackParamList = {
  ControlList: { connectedPondName?: string } | undefined;
  ControlDetail: { pondName: string };
  ConnectDevice: { pondName: string };
  CustomFeedingMachine: {
    initialMode: 'manual' | 'schedule';
    deviceId: string;
    pondName: string;
    pondId: string;
  };
  Schedule: { pondName: string };
  History: { pondName: string };
};

const Stack = createNativeStackNavigator<ControlStackParamList>();

import { ControlProvider } from '../context/ControlContext';

// ... (Stack definition)

export const ControlNavigator = () => {
  return (
    <ControlProvider>
      <Stack.Navigator
        initialRouteName="ControlList"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="ControlList" component={DeviceControlScreens} />
        <Stack.Screen
          name="ConnectDevice"
          component={ConnectDeviceScreens}
          options={{
            headerShown: false,
            presentation: 'fullScreenModal',
            animation: 'fade',
          }}
        />
        <Stack.Screen name="ControlDetail" component={DevicesInPondScreens} />
        <Stack.Screen name="CustomFeedingMachine" component={CustomFeedingMachine} />
        <Stack.Screen name="Schedule" component={ScheduleActivitieScreens} />
        <Stack.Screen name="History" component={HistoryActivitieScreens} />
      </Stack.Navigator>
    </ControlProvider>
  );
};
