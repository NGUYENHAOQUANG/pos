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
import { PondDetailScreen } from '@/features/farm/screens/pond-detail/PondDetailScreen';
import { PondInfoScreen } from '@/features/farm/screens/info/PondInfoScreen';
import { FarmInfoScreen } from '@/features/farm/screens/info/FarmInfoScreen';
import { ShrimpInspectionScreen } from '@/features/farm/screens/pondwork/shrimp-inspection/ShrimpInspectionScreen';
import { PondworkLogScreen } from '@/features/farm/screens/pondwork/shrimp-inspection/ShrimpInspectionLogScreen';
import { AddEnvironmentScreen } from '@/features/farm/screens/pondwork/environment/AddEnvironmentScreen';
import { SettingEnvironmentScreens } from '@/features/farm/screens/pondwork/environment/SettingEnvironmentScreens';
import { EnvironmentLogScreen } from '@/features/farm/screens/pondwork/environment/EnvironmentLogScreen';
import { CreateCycleScreen } from '@/features/farm/screens/create-cycle/CreateCycleScreen';
import { AddSiphonScreen } from '@/features/farm/screens/pondwork/xyphon/AddSiphonScreen';
import { SiphonLogScreen } from '@/features/farm/screens/pondwork/xyphon/SiphonLogScreen';
import { WaterSupplyScreen } from '@/features/farm/screens/pondwork/waterchange/WaterChangeScreen';
import { WaterSupplyLogScreen } from '@/features/farm/screens/pondwork/waterchange/WaterChangeLogScreen';
import { AddTransferScreen } from '@/features/farm/screens/pondwork/transfer/AddTransferScreen';
import { AddHarvestScreen } from '@/features/farm/screens/pondwork/harvest/AddHarvestScreen';
import { HarvestLogScreen } from '@/features/farm/screens/pondwork/harvest/HarvestLogScreen';
import { CycleDetailScreen } from '@/features/farm/screens/cycle-detail/CycleDetailScreen';
import { MeasureShrimpSizeLogScreen } from '@/features/farm/screens/pondwork/measurement/MeasureShrimpSizeLogScreen';
import { MeasureShrimpSizeScreen } from '@/features/farm/screens/pondwork/measurement/MeasureShrimpSizeScreen';
import { HandleProblemFormScreen } from '@/features/farm/screens/handleProblem/HandleProblemFormScreen';
import { HandleProblemLogScreen } from '@/features/farm/screens/handleProblem/HandleProblemLogScreen';
import { FeedingLogScreens } from '@/features/farm/screens/pondwork/feed/FeedingLogScreens';
import { FeedingManagementScreens } from '@/features/farm/screens/pondwork/feed/FeedingManagementScreens';
import { AddWaterTreatmentScreens } from '@/features/farm/screens/pondwork/water-treatment/AddWaterTreatmentScreens';
import { EditWaterTreatmentScreens } from '@/features/farm/screens/pondwork/water-treatment/EditWaterTreatmentScreens';
import { WaterTreatmentLogScreens } from '@/features/farm/screens/pondwork/water-treatment/WaterTreatmentLogScreens';
import { EditEnvironmentScreens } from '@/features/menu/screens/environment/EditEnvironmentScreens';
import CountingShrimpScreen from '@/features/farm/screens/ai-counting-shrimp/CountingShrimpScreens';
import { MeasureShrimpSizeAIScreen } from '@/features/farm/screens/pondwork/measurement/MeasureShrimpSizeAIScreen';
import { ShrimpHealthCheckAIScreen } from '@/features/farm/screens/pondwork/shrimp-inspection/ShrimpHealthCheckAIScreen';

// Material screens
import { MaterialFormScreen } from '@/features/material/screens/material_form';
import { ImportReceiptFormScreen } from '@/features/material/screens/import_receipt_form';
import { ExportWarehouseFormScreen } from '@/features/material/screens/export_warehouse_form';
import { AddInventoryScreen } from '@/features/material/screens/inventory_form';

// Control screens
import { ConnectDeviceScreens } from '@/features/control/screens/devices/ConnectDeviceScreens';
import CustomFeedingMachine from '@/features/control/screens/CustomFeedingMachine/CustomFeedingMachineScreen';
import { ScheduleActivitieScreens } from '@/features/control/screens/schedule/ScheduleActivitieScreens';
import { UserManualScreens } from '@/features/control/screens/usermanual/UserManualScreens';
import { GeneralUserManualScreens } from '@/features/control/screens/usermanual/GeneralUserManualScreens';
import { HistoryActivitieScreens } from '@/features/control/screens/schedule/HistoryActivitieScreens';

// Menu screens
import { PersonalInformationScreens } from '@/features/menu/screens/information/PersonalInformationScreens';
import { InformationFormScreen } from '@/features/menu/screens/informationForm/InformationFormScreen';
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
import { DeleteAccountFormScreen } from '@/features/menu/screens/deleteAcount/DeleteAccountFormScreen';

// Types
import {
    JobExecution,
    PondData,
    FarmData,
    CycleData,
    SeasonData,
} from '@/features/farm/types/farm.types';
import { IMaterial } from '@/features/material/types/material.types';
import { IInventoryCheck } from '@/features/material/types/inventoryCheck.types';
import { Member } from '@/features/menu/types/menu.types';
import { IWarehouseItem } from '@/features/material/types/warehouse.types';
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
    ReportView: undefined;

    // Feeding Module
    FeedingLog: { pondId: string; title?: string };
    FeedingManagement: { pondId: string; jobId?: string; itemToEdit?: JobExecution }; // Màn hình Container gộp

    // Job/Task Module
    PondDetail: { pondId: string; zoneId: string };
    PondInfo: { pond: PondData };
    FarmInfo: { farm: FarmData };
    ShrimpInspectionScreen: {
        pond: PondData;
        itemToEdit?: JobExecution;
        aiHealthCheckResult?: any;
    };
    ShrimpHealthCheckAIScreen: { pond: PondData };
    MeasureShrimpSizeLogScreen: { pond: PondData };
    MeasureShrimpSizeScreen: {
        pond: PondData;
        itemToEdit?: JobExecution;
        aiShrimpSize?: string;
    };
    MeasureShrimpSizeAIScreen: { pondId: string };
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
        zoneId: string;
        cycleId?: string;
        isEditMode?: boolean;
        aiCount?: number;
    };
    AddSiphonScreen: { pond: PondData; itemToEdit?: JobExecution };
    SiphonLog: { pond: PondData };
    AddWaterTreatmentScreen: { pond: PondData; itemToEdit?: JobExecution };
    EditWaterTreatmentScreens: {
        pondId: string;
        jobId: string;
        pond?: PondData;
        item?: JobExecution;
        itemToEdit?: JobExecution;
    };
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
    CycleDetailScreen: { pondId: string; zoneId: string; warehouseId?: string };
    HandleProblem: {
        pondId: string;
        item?: JobExecution;
        jobType?: 'CLEAN_POND' | 'SUN_DRY_POND' | 'TROUBLESHOOTING';
    };
    HandleProblemLog: {
        pondId: string;
        jobType?: 'CLEAN_POND' | 'SUN_DRY_POND' | 'TROUBLESHOOTING';
    };
    SunDryPondLog: { pondId: string };
    CountingShrimp: { pondId: string; zoneId: string };

    // ============== Material Screens (Tab Bar hidden) ==============
    MaterialForm: { materialId?: string; onSave?: (data: any) => void };
    ImportReceiptFormScreen: {
        importReceiptId?: string;
        availableMaterials?: IMaterial[];
        onSave?: (data: Omit<ImportReceipt, 'id'>) => void;
    };
    ExportWarehouseForm: {
        availableMaterials?: IMaterial[];
        onSave?: (data: any) => void;
        exportReceiptId?: string;
    };
    AddInventory: {
        onSave?: (data: IInventoryCheck) => void;
        initialMaterialName?: string;
        inventoryId?: string;
        initialMaterial?: IWarehouseItem;
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
    EditPersonalInformationScreen: undefined;
    AquacultureManagement: undefined;
    MemberManagement: undefined;
    AddAquaculture: undefined;
    EditAquaculture: { aquaculture: SeasonData };
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
            <Stack.Screen name="PondDetail" component={PondDetailScreen} />
            <Stack.Screen name="FeedingManagement" component={FeedingManagementScreens} />
            <Stack.Screen name="FeedingLog" component={FeedingLogScreens} />
            <Stack.Screen name="PondInfo" component={PondInfoScreen} />
            <Stack.Screen name="FarmInfo" component={FarmInfoScreen} />
            <Stack.Screen name="ShrimpInspectionScreen" component={ShrimpInspectionScreen} />
            <Stack.Screen
                name="MeasureShrimpSizeLogScreen"
                component={MeasureShrimpSizeLogScreen}
            />
            <Stack.Screen name="MeasureShrimpSizeScreen" component={MeasureShrimpSizeScreen} />
            <Stack.Screen name="ShrimpHealthCheckAIScreen" component={ShrimpHealthCheckAIScreen} />
            <Stack.Screen name="MeasureShrimpSizeAIScreen" component={MeasureShrimpSizeAIScreen} />
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
            <Stack.Screen name="AddHarvestScreen" component={AddHarvestScreen} />
            <Stack.Screen name="HarvestLog" component={HarvestLogScreen} />
            <Stack.Screen name="CycleDetailScreen" component={CycleDetailScreen} />
            <Stack.Screen name="HandleProblem" component={HandleProblemFormScreen} />
            <Stack.Screen name="HandleProblemLog" component={HandleProblemLogScreen} />
            <Stack.Screen name="CountingShrimp" component={CountingShrimpScreen} />

            {/* ============== Material Screens ============== */}
            <Stack.Screen name="MaterialForm" component={MaterialFormScreen} />
            <Stack.Screen name="ImportReceiptFormScreen" component={ImportReceiptFormScreen} />
            <Stack.Screen name="ExportWarehouseForm" component={ExportWarehouseFormScreen} />
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

            <Stack.Screen name="DeleteAccount" component={DeleteAccountFormScreen} />
            <Stack.Screen name="EditPersonalInformationScreen" component={InformationFormScreen} />
        </Stack.Navigator>
    );
};
