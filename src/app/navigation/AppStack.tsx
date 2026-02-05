/**
 * @file AppStack.tsx
 * @description Root Stack Navigator - Contains MainTabs and all detail/form screens
 * Following Partner pattern: Root Stack → MainTabs (Tab Bar visible) + Detail Screens (Tab Bar hidden)
 * @author Kindy
 * @created 2025-01-07
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Main Tabs
import { MainNavigator } from './MainNavigator';

// Farm screens
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
import { WaterSupplyScreen } from '@/features/farm/screens/pondwork/watersupply/WaterSupplyScreen';
import { WaterSupplyLogScreen } from '@/features/farm/screens/pondwork/watersupply/WaterSupplyLogScreen';
import { AddTransferScreen } from '@/features/farm/screens/pondwork/transfer/AddTransferScreen';
import { AddHarvestScreen } from '@/features/farm/screens/pondwork/harvest/AddHarvestScreen';
import { HarvestLogScreen } from '@/features/farm/screens/pondwork/harvest/HarvestLogScreen';
import { CycleDetailScreen } from '@/features/farm/screens/pond/CycleDetailScreen';
import { MeasureShrimpSizeLogScreen } from '@/features/farm/screens/pondwork/measurement/MeasureShrimpSizeLogScreen';
import { MeasureShrimpSizeScreen } from '@/features/farm/screens/pondwork/measurement/MeasureShrimpSizeScreen';
import { HandleProblemScreen } from '@/features/farm/screens/handleProblem/HandleProblemScreen';
import { HandleProblemLogScreen } from '@/features/farm/screens/handleProblem/HandleProblemLogScreen';
import { SunDryPondLogScreen } from '@/features/farm/screens/handleProblem/SunDryPondLogScreen';
import { AddFeederScreens } from '@/features/farm/screens/pondwork/feed/AddFeederScreens';
import { EditFeederScreens } from '@/features/farm/screens/pondwork/feed/EditFeederScreens';
import { FeedingLogScreens } from '@/features/farm/screens/pondwork/feed/FeedingLogScreens';
import { AddWaterTreatmentScreens } from '@/features/farm/screens/pondwork/water-treatment/AddWaterTreatmentScreens';
import { EditWaterTreatmentScreens } from '@/features/farm/screens/pondwork/water-treatment/EditWaterTreatmentScreens';
import { WaterTreatmentLogScreens } from '@/features/farm/screens/pondwork/water-treatment/WaterTreatmentLogScreens';
import { EditEnvironmentScreens } from '@/features/menu/screens/environment/EditEnvironmentScreens';
import CountingShrimpScreen from '@/features/farm/screens/pond/CountingShrimpScreens';

// Material screens
import { AddMaterialScreen } from '@/features/material/screens/material/AddMaterialScreen';
import { EditMaterialScreen } from '@/features/material/screens/material/EditMaterialScreen';
import { AddWarehouseScreen } from '@/features/material/screens/warehouse/AddWarehouseScreen';
import { AddExportWarehouseScreen } from '@/features/material/screens/warehouse/AddExportWarehouseScreen';
import { AddInventoryScreen } from '@/features/material/screens/inventory/AddInventoryScreen';

// Control screens
import { ConnectDeviceScreens } from '@/features/control/screens/devices/ConnectDeviceScreens';
import CustomFeedingMachine from '@/features/control/screens/CustomFeedingMachine/CustomFeedingMachineScreen';
import { ScheduleActivitieScreens } from '@/features/control/screens/schedule/ScheduleActivitieScreens';
import { UserManualScreens } from '@/features/control/screens/usermanual/UserManualScreens';
import { GeneralUserManualScreens } from '@/features/control/screens/usermanual/GeneralUserManualScreens';
import { HistoryActivitieScreens } from '@/features/control/screens/schedule/HistoryActivitieScreens';

// Menu screens
import { PersonalInformationScreens } from '@/features/menu/screens/information/PersonalInformationScreens';
import { EditPersonalInformationScreens } from '@/features/menu/screens/information/EditPersonalInformationScreens';
import { AquacultureManagementScreens } from '@/features/menu/screens/aquaculture/AquacultureManagementScreens';
import { AddAquacultureScreens } from '@/features/menu/screens/aquaculture/AddAquacultureScreens';
import { EditAquacultureScreens } from '@/features/menu/screens/aquaculture/EditAquacultureScreens';
import { MemberManagementScreens } from '@/features/menu/screens/member/MemberManagementScreens';
import { AddMemberScreens } from '@/features/menu/screens/member/AddMemberScreens';
import { EditMemberScreens } from '@/features/menu/screens/member/EditMemberScreens';
import { DeviceManagement } from '@/features/menu/screens/devices/DeviceManagement';
import { AddDeviceScreens } from '@/features/menu/screens/devices/AddDeviceScreens';
import { EditDevicesScreens } from '@/features/menu/screens/devices/EditDevicesScreens';
import { HistoryDevicesScreens } from '@/features/menu/screens/devices/HistoryDevicesScreens';
import { EquipmentMaintenanceScreens } from '@/features/menu/screens/devices/EquipmentMaintenanceScreens';
import { EditEquimentMaintenanceScreens } from '@/features/menu/screens/devices/EditEquimentMaintenanceScreens';
import { DeleteAccountScreen } from '@/features/menu/screens/deleteAcount/DeleteAccountScreen';

// Types
import { JobExecution, PondData, FarmData, CycleData } from '@/features/farm/types/farm.types';
import { IMaterial } from '@/features/material/types/material.types';
import { IInventoryCheck } from '@/features/material/types/inventoryCheck.types';
import { Aquaculture, Member } from '@/features/menu/types/menu.types';
import { IExportWarehouseReceipt } from '@/features/material/types/warehouse.types';
import { ImportReceipt } from '@/features/material/types/importReceipt.types';

// Wrapped Menu screens - Now using components directly
const PersonalInformationWithProvider = PersonalInformationScreens;
const AquacultureManagementWithProvider = AquacultureManagementScreens;
const MemberManagementWithProvider = MemberManagementScreens;
const AddAquacultureWithProvider = AddAquacultureScreens;
const EditAquacultureWithProvider = EditAquacultureScreens;
const AddMemberWithProvider = AddMemberScreens;
const EditMemberWithProvider = EditMemberScreens;
const DeviceManagementWithProvider = DeviceManagement;
const AddDeviceWithProvider = AddDeviceScreens;
const EditDeviceWithProvider = EditDevicesScreens;
const HistoryDevicesWithProvider = HistoryDevicesScreens;
const EquipmentMaintenanceWithProvider = EquipmentMaintenanceScreens;
const EditEquimentMaintenanceWithProvider = EditEquimentMaintenanceScreens;

// Root Stack Param List - All screens in the app
export type AppStackParamList = {
    // Main Tabs (Tab Bar visible)
    // Main Tabs (Tab Bar visible)
    MainTabs: { screen: string; params?: any } | undefined;

    // ============== Farm Screens (Tab Bar hidden) ==============
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
    SettingEnvironment: {
        data?: { advancedParameters?: Array<{ id: string; name: string }> };
        onSave?: (data: { advancedParameters: Array<{ id: string; name: string }> }) => void;
    };
    EditEnvironment: {
        parameter: {
            id: string;
            name: string;
            limit: string;
            isChecked: boolean;
            min?: string;
            max?: string;
            alertEnabled?: boolean;
        };
    };
    EnvironmentLogScreen: { pond: PondData };
    CreateCycle: {
        pondId: string;
        zoneId?: string;
        initialData?: CycleData | null;
        aiCount?: number;
    };
    AddSiphonScreen: { pond: PondData; itemToEdit?: JobExecution };
    SiphonLog: { pond: PondData };
    AddWaterTreatmentScreen: { pond: PondData; itemToEdit?: JobExecution };
    EditWaterTreatmentScreens: { pondId: string; jobId: string };
    WaterTreatmentLog: { pondId?: string; pond?: PondData };
    WaterSupply: { pond?: PondData; item?: JobExecution };
    WaterSupplyLog: { pond: PondData };
    AddTransferScreen: {
        pond: PondData;
        itemToEdit?: JobExecution;
        latestShrimpSize?: string;
        cycleData?: CycleData | null;
    };
    TransferLog: { pond: PondData };
    AddHarvestScreen: { pond: PondData; itemToEdit?: JobExecution };
    HarvestLog: { pond: PondData };
    CycleDetail: { pondId: string; cycleData: CycleData };
    HandleProblem: {
        pond: PondData;
        item?: JobExecution;
        jobType?: 'CLEAN_POND' | 'SUN_DRY_POND' | 'TROUBLESHOOTING';
    };
    HandleProblemLog: {
        pond: PondData;
        jobType?: 'CLEAN_POND' | 'SUN_DRY_POND' | 'TROUBLESHOOTING';
    };
    SunDryPondLog: { pond: PondData };
    CountingShrimp: undefined;

    // ============== Material Screens (Tab Bar hidden) ==============
    AddMaterial: { onSave?: (data: Omit<IMaterial, 'id'>) => void };
    EditMaterial: { material: IMaterial; onSave?: (data: IMaterial) => void };
    AddWarehouse: {
        availableMaterials?: IMaterial[];
        onSave?: (data: Omit<ImportReceipt, 'id'>) => void;
        importReceiptId?: string;
    };
    AddExportWarehouse: {
        availableMaterials?: IMaterial[];
        onSave?: (data: Omit<IExportWarehouseReceipt, 'id'>) => void;
        exportReceiptId?: string;
    };
    AddInventory: {
        onSave?: (data: IInventoryCheck) => void;
        initialMaterialName?: string;
        inventoryId?: string;
    };

    // ============== Control Screens (Tab Bar hidden) ==============
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
    UserManual: undefined;
    GeneralUserManual: undefined;

    // ============== Menu Screens (Tab Bar hidden) ==============
    PersonalInformation: undefined;
    EditPersonalInformationScreens: undefined;
    AquacultureManagement: undefined;
    MemberManagement: undefined;
    AddAquaculture: undefined;
    EditAquaculture: { aquaculture: Aquaculture };
    AddMember: undefined;
    EditMember: { member: Member };
    DeviceManagement: undefined;
    AddDevice: undefined;
    EditDevice: { deviceId: string };
    HistoryDevices: {
        deviceId?: string;
        success?: boolean;
        maintenanceData?: {
            date: string;
            description: string;
            resetTime: boolean;
        };
    };
    EquipmentMaintenance: { deviceId?: string };
    EditEquimentMaintenance: {
        deviceId: string;
        maintenanceId: string;
        initialData: {
            date?: string | Date;
            description?: string;
            resetTime?: boolean;
        };
    };
    DeleteAccount: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export const AppStack: React.FC = () => {
    return (
        <Stack.Navigator
            initialRouteName="MainTabs"
            screenOptions={{
                headerShown: false,
            }}
        >
            {/* Main Tabs - Tab Bar visible */}
            <Stack.Screen name="MainTabs" component={MainNavigator} />

            {/* ============== Farm Screens ============== */}
            <Stack.Screen name="PondDetail" component={ShrimpFarmScreens} />
            <Stack.Screen name="FeedTheShrimp" component={AddFeederScreens} />
            <Stack.Screen name="EditFeeder" component={EditFeederScreens} />
            <Stack.Screen name="FeedingLog" component={FeedingLogScreens} />
            <Stack.Screen name="PondInfo" component={PondInfoScreen} />
            <Stack.Screen name="FarmInfo" component={FarmInfoScreen} />
            <Stack.Screen name="ShrimpInspectionScreen" component={ShrimpInspectionScreen} />
            <Stack.Screen
                name="MeasureShrimpSizeLogScreen"
                component={MeasureShrimpSizeLogScreen}
            />
            <Stack.Screen name="MeasureShrimpSizeScreen" component={MeasureShrimpSizeScreen} />
            <Stack.Screen name="PondworkLogScreen" component={PondworkLogScreen} />
            <Stack.Screen name="AddEnvironmentScreen" component={AddEnvironmentScreen} />
            <Stack.Screen name="SettingEnvironment" component={SettingEnvironmentScreens} />
            <Stack.Screen name="EditEnvironment" component={EditEnvironmentScreens} />
            <Stack.Screen name="EnvironmentLogScreen" component={EnvironmentLogScreen} />
            <Stack.Screen name="CreateCycle" component={CreateCycleScreen} />
            <Stack.Screen name="AddSiphonScreen" component={AddSiphonScreen} />
            <Stack.Screen name="SiphonLog" component={SiphonLogScreen} />
            <Stack.Screen name="AddWaterTreatmentScreen" component={AddWaterTreatmentScreens} />
            <Stack.Screen name="EditWaterTreatmentScreens" component={EditWaterTreatmentScreens} />
            <Stack.Screen name="WaterTreatmentLog" component={WaterTreatmentLogScreens} />
            <Stack.Screen name="WaterSupply" component={WaterSupplyScreen} />
            <Stack.Screen name="WaterSupplyLog" component={WaterSupplyLogScreen} />
            <Stack.Screen name="AddTransferScreen" component={AddTransferScreen} />
            <Stack.Screen name="TransferLog" component={AddTransferScreen} />
            <Stack.Screen name="AddHarvestScreen" component={AddHarvestScreen} />
            <Stack.Screen name="HarvestLog" component={HarvestLogScreen} />
            <Stack.Screen name="CycleDetail" component={CycleDetailScreen} />
            <Stack.Screen name="HandleProblem" component={HandleProblemScreen} />
            <Stack.Screen name="HandleProblemLog" component={HandleProblemLogScreen} />
            <Stack.Screen name="SunDryPondLog" component={SunDryPondLogScreen} />
            <Stack.Screen name="CountingShrimp" component={CountingShrimpScreen} />

            {/* ============== Material Screens ============== */}
            <Stack.Screen name="AddMaterial" component={AddMaterialScreen} />
            <Stack.Screen name="EditMaterial" component={EditMaterialScreen} />
            <Stack.Screen name="AddWarehouse" component={AddWarehouseScreen} />
            <Stack.Screen name="AddExportWarehouse" component={AddExportWarehouseScreen} />
            <Stack.Screen name="AddInventory" component={AddInventoryScreen} />

            {/* ============== Control Screens ============== */}
            {/* ControlDetail moved to MainNavigator to show Tab Bar */}
            {/* Control screens use Zustand store directly - no provider needed */}
            <Stack.Screen name="ConnectDevice" component={ConnectDeviceScreens} />
            <Stack.Screen
                name="CustomFeedingMachine"
                component={CustomFeedingMachine}
                options={{ gestureEnabled: false }}
            />
            <Stack.Screen name="Schedule" component={ScheduleActivitieScreens} />
            <Stack.Screen name="History" component={HistoryActivitieScreens} />
            <Stack.Screen name="UserManual" component={UserManualScreens} />
            <Stack.Screen name="GeneralUserManual" component={GeneralUserManualScreens} />

            {/* ============== Menu Screens ============== */}
            <Stack.Screen name="PersonalInformation" component={PersonalInformationWithProvider} />
            <Stack.Screen
                name="AquacultureManagement"
                component={AquacultureManagementWithProvider}
            />
            <Stack.Screen name="MemberManagement" component={MemberManagementWithProvider} />
            <Stack.Screen name="AddAquaculture" component={AddAquacultureWithProvider} />
            <Stack.Screen name="EditAquaculture" component={EditAquacultureWithProvider} />
            <Stack.Screen name="AddMember" component={AddMemberWithProvider} />
            <Stack.Screen name="EditMember" component={EditMemberWithProvider} />
            <Stack.Screen name="DeviceManagement" component={DeviceManagementWithProvider} />
            <Stack.Screen name="AddDevice" component={AddDeviceWithProvider} />
            <Stack.Screen name="EditDevice" component={EditDeviceWithProvider} />
            <Stack.Screen name="HistoryDevices" component={HistoryDevicesWithProvider} />
            <Stack.Screen
                name="EquipmentMaintenance"
                component={EquipmentMaintenanceWithProvider}
            />
            <Stack.Screen
                name="EditEquimentMaintenance"
                component={EditEquimentMaintenanceWithProvider}
            />

            <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} />
            <Stack.Screen
                name="EditPersonalInformationScreens"
                component={EditPersonalInformationScreens}
            />
        </Stack.Navigator>
    );
};
