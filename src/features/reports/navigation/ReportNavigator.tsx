import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ReportsScreen } from '@/features/reports/screens/ReportsScreen';

export type ReportStackParamList = {
    ReportHome: undefined;
};

const Stack = createNativeStackNavigator<ReportStackParamList>();

export const ReportNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="ReportHome" component={ReportsScreen} />
        </Stack.Navigator>
    );
};
