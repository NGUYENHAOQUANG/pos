import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MeterialScreen } from '../screens/MaterialScreen'; // This will be the main list screen
import { AddMaterialScreen } from '../screens/material/AddMaterialScreen';
import { EditMaterialScreen } from '../screens/material/EditMaterialScreen';
import { AddWarehouseScreen } from '../screens/warehouse/AddWarehouseScreen';
import { AddInventoryScreen } from '../screens/inventory/AddInventoryScreen';
import { IMaterial, IWarehouseReceipt, IInventoryTicket } from '../types/material.types';

export type MaterialStackParamList = {
    MaterialList: { selectedTab?: 'list' | 'history' | 'inventory' };
    AddMaterial: { onSave?: (data: Omit<IMaterial, 'id'>) => void };
    EditMaterial: { material: IMaterial; onSave?: (data: IMaterial) => void };
    AddWarehouse: {
        availableMaterials: IMaterial[];
        onSave?: (data: Omit<IWarehouseReceipt, 'id'>) => void;
    };
    AddInventory: { onSave?: (data: IInventoryTicket) => void; initialMaterialName?: string };
};

const Stack = createNativeStackNavigator<MaterialStackParamList>();

export const MaterialNavigator = () => {
    return (
        <Stack.Navigator
            initialRouteName="MaterialList"
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="MaterialList" component={MeterialScreen} />
            <Stack.Screen name="AddMaterial" component={AddMaterialScreen} />
            <Stack.Screen name="EditMaterial" component={EditMaterialScreen} />
            <Stack.Screen name="AddWarehouse" component={AddWarehouseScreen} />
            <Stack.Screen name="AddInventory" component={AddInventoryScreen} />
        </Stack.Navigator>
    );
};
