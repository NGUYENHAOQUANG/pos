import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ShrimpInspectionScreen } from '@/features/shrimp-inspection/screens/ShrimpInspectionScreen';

export type ShrimpInspectionStackParamList = {
  ShrimpInspectionList: undefined;
  ShrimpInspectionDetail: { inspectionId: string };
  ShrimpInspectionForm: { pondId: string; inspectionId?: string };
};

const Stack = createNativeStackNavigator<ShrimpInspectionStackParamList>();

export const ShrimpInspectionNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="ShrimpInspectionList"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="ShrimpInspectionList" component={ShrimpInspectionScreen} />
    </Stack.Navigator>
  );
};
