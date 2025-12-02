import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, Text } from 'react-native';
import { HeaderMeterial } from '../components/material/HeaderMeterial';
import { ButtonMetaerial } from '../components/material/ButtonMeterial';
import { HeadingMeterial, TabType } from '../components/material/HeadingMeterial';
import { SearchBarMeterial } from '../components/material/SearchBarMeterial';
import { MaterialList, MaterialItem } from '../components/material/MaterialList';
import { colors, spacing } from '@/styles';

export const MeterialScreen = () => {
    const [selectedTab, setSelectedTab] = useState<TabType>('list');

    // Mock data for testing MaterialList
    const mockMaterial: MaterialItem = {
        id: '1',
        name: 'Tên vật tư',
        group: 'Thức ăn',
        unit: 'Kg',
        remaining: 10,
        manufacturer: 'Tên nhà sản xuất',
        usage: 'Nội dung công dụng',
        unitOfUse: 'Kg',
        dosage: 'Nội dung liều dùng',
    };

    const handleCreateImport = () => {
        console.log('Create Import');
    };

    const handleCreateAdjustment = () => {
        console.log('Create Adjustment');
    };

    const handleCreateMaterial = () => {
        console.log('Create Material');
    };

    const handleSearch = (text: string) => {
        console.log('Search:', text);
    };

    const handleFilterPress = () => {
        console.log('Filter pressed');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <HeaderMeterial
                    rightComponent={
                        <ButtonMetaerial
                            onPressCreateImport={handleCreateImport}
                            onPressCreateAdjustment={handleCreateAdjustment}
                            onPressCreateMaterial={handleCreateMaterial}
                        />
                    }
                />
                <HeadingMeterial selectedTab={selectedTab} onTabSelect={setSelectedTab} />
                <SearchBarMeterial onSearch={handleSearch} onFilterPress={handleFilterPress} />
                
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        flex: 1,
        padding: spacing.md,
    },
});
