import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FarmProvider } from '@/features/farm/context/FarmContext';
import { JobExecution } from '@/features/farm/types/farm.types';
import { PondData, FarmData, CycleData } from '@/features/farm/types/farm.types';
import { ShrimpPondListScreens } from '@/features/farm/screens/pond/ShrimpPondListScreens';
import { ShrimpFarmScreens } from '@/features/farm/screens/ShrimpFarmScreens';
import { PondInfoScreen } from '@/features/farm/screens/info/PondInfoScreen';
import { FarmInfoScreen } from '@/features/farm/screens/info/FarmInfoScreen';
import { ShrimpInspectionScreen } from '@/features/farm/screens/pondwork/shrimp-inspection/ShrimpInspectionScreen';
import { PondworkLogScreen } from '@/features/farm/screens/pondwork/shrimp-inspection/ShrimpInspectionLogScreen';
import { AddEnvironmentScreen } from '@/features/farm/screens/pondwork/environment/AddEnvironmentScreen';
import { SettingEnvironmentScreens } from '@/features/farm/screens/pondwork/environment/SettingEnvironmentScreens';
import { EnvironmentLogScreen } from '@/features/farm/screens/pondwork/environment/EnvironmentLogScreen';
import { CreateCycleScreen } from '@/features/farm/screens/pond/CreateCycleScreen';
import { AddSiphonScreen } from '@/features/farm/screens/pondwork/xyphon/AddSiphonScreen';
import { SiphonLogScreen } from '@/features/farm/screens/pondwork/xyphon/SiphonLogScreen';
import { WaterSupplyScreen } from '@/features/farm/screens/pond/watersupply/WaterSupplyScreen';
import { WaterSupplyLogScreen } from '@/features/farm/screens/pond/watersupply/WaterSupplyLogScreen';
import { AddTransferScreen } from '@/features/farm/screens/pondwork/transfer/AddTransferScreen';
import { AddHarvestScreen } from '@/features/farm/screens/pondwork/harvest/AddHarvestScreen';
import { HarvestLogScreen } from '@/features/farm/screens/pondwork/harvest/HarvestLogScreen';
import { CycleDetailScreen } from '@/features/farm/screens/pond/CycleDetailScreen';
import { MeasureShrimpSizeLogScreen } from '@/features/farm/screens/pondwork/measurement/MeasureShrimpSizeLogScreen';
import { MeasureShrimpSizeScreen } from '@/features/farm/screens/pondwork/measurement/MeasureShrimpSizeScreen';
import { HandleProblemScreen } from '@/features/farm/screens/handleProblem/HandleProblemScreen';
import { HandleProblemLogScreen } from '@/features/farm/screens/handleProblem/HandleProblemLogScreen';
import { SunDryPondLogScreen } from '@/features/farm/screens/handleProblem/SunDryPondLogScreen';

export type FarmStackParamList = {
    FarmList: undefined;
    PondDetail: { pond: PondData };
    FeedTheShrimp: { pondId: string };
    EditFeeder: { pondId: string; jobId?: string };
    FeedingLog: { pondId: string };

    PondInfo: { pond: PondData };
    FarmInfo: { farm: FarmData };
    ShrimpInspectionScreen: { pond: PondData; itemToEdit?: JobExecution };
    MeasureShrimpSizeLogScreen: { pond: PondData };
    MeasureShrimpSizeScreen: { pond: PondData; itemToEdit?: JobExecution };
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
    AddTransferScreen: {
        pond: PondData;
        itemToEdit?: JobExecution;
        latestShrimpSize?: string;
        cycleData?: CycleData | null;
    };
    TransferLog: { pond: PondData };
    AddHarvestScreen: { pond: PondData; itemToEdit?: JobExecution };
    HarvestLog: { pond: PondData };
    CycleDetail: { pondId: string; cycleData: any };
    HandleProblem: { pond: PondData; item?: JobExecution; jobType?: 'CLEAN_POND' | 'SUN_DRY_POND' };
    HandleProblemLog: { pond: PondData; jobType?: 'CLEAN_POND' | 'SUN_DRY_POND' };
    SunDryPondLog: { pond: PondData };
};

const Stack = createNativeStackNavigator<FarmStackParamList>();

import { AddFeederScreens } from '@/features/farm/screens/pondwork/feed/AddFeederScreens';
import { EditFeederScreens } from '@/features/farm/screens/pondwork/feed/EditFeederScreens';
import { FeedingLogScreens } from '@/features/farm/screens/pondwork/feed/FeedingLogScreens';
import { AddWaterTreatmentScreens } from '@/features/farm/screens/pondwork/water-treatment/AddWaterTreatmentScreens';
import { EditWaterTreatmentScreens } from '@/features/farm/screens/pondwork/water-treatment/EditWaterTreatmentScreens';
import { WaterTreatmentLogScreens } from '@/features/farm/screens/pondwork/water-treatment/WaterTreatmentLogScreens';

export const FarmNavigator = () => {
    return (
        <FarmProvider>
            <Stack.Navigator
                initialRouteName="FarmList"
                screenOptions={{
                    headerShown: false,
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
                <Stack.Screen name="SettingEnvironment" component={SettingEnvironmentScreens} />
                <Stack.Screen name="EnvironmentLogScreen" component={EnvironmentLogScreen} />
                <Stack.Screen name="CreateCycle" component={CreateCycleScreen} />
                <Stack.Screen name="AddSiphonScreen" component={AddSiphonScreen} />
                <Stack.Screen name="SiphonLog" component={SiphonLogScreen} />
                <Stack.Screen name="AddWaterTreatmentScreen" component={AddWaterTreatmentScreens} />
                <Stack.Screen
                    name="EditWaterTreatmentScreens"
                    component={EditWaterTreatmentScreens}
                />
                <Stack.Screen name="WaterTreatmentLog" component={WaterTreatmentLogScreens} />
                <Stack.Screen name="WaterSupply" component={WaterSupplyScreen} />
                <Stack.Screen name="WaterSupplyLog" component={WaterSupplyLogScreen} />
                <Stack.Screen
                    name="MeasureShrimpSizeLogScreen"
                    component={MeasureShrimpSizeLogScreen}
                />
                <Stack.Screen name="MeasureShrimpSizeScreen" component={MeasureShrimpSizeScreen} />
                <Stack.Screen name="AddTransferScreen" component={AddTransferScreen} />
                <Stack.Screen name="AddHarvestScreen" component={AddHarvestScreen} />
                <Stack.Screen name="HarvestLog" component={HarvestLogScreen} />
                <Stack.Screen name="CycleDetail" component={CycleDetailScreen} />
                <Stack.Screen name="HandleProblem" component={HandleProblemScreen} />
                <Stack.Screen name="HandleProblemLog" component={HandleProblemLogScreen} />
                <Stack.Screen name="SunDryPondLog" component={SunDryPondLogScreen} />
            </Stack.Navigator>
        </FarmProvider>
    );
};
