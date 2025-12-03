import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, Platform } from 'react-native';
import { HeaderMeterial } from '../../components/HeaderMeterial';
import { HeadingMeterial, TabType } from '../../components/HeadingMaterial';
import { SearchBarMeterial } from '../../components/SearchBarMeterial';
import { AddMaterialCard } from '../../components/material/AddMaterialCard';
import { ButtonMetaerial } from '../../components/ButtonMaterial';
import { colors, spacing } from '@/styles';

export const MaterialListScreen = () => {
    const [selectedTab, setSelectedTab] = useState<TabType>('list');

    const handleSearch = (text: string) => {
        console.log('Search:', text);
    };

    const handleFilterPress = () => {
        console.log('Filter pressed');
    };

    const handleAddMaterial = () => {
        console.log('Add material pressed');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
            <View style={styles.container}>
                <HeaderMeterial
                    rightComponent={
                        <ButtonMetaerial
                            onPressCreateImport={() => console.log('Import')}
                            onPressCreateAdjustment={() => console.log('Adjustment')}
                            onPressCreateMaterial={() => console.log('Create Material')}
                        />
                    }
                />
                <HeadingMeterial selectedTab={selectedTab} onTabSelect={setSelectedTab} />
                <SearchBarMeterial onSearch={handleSearch} onFilterPress={handleFilterPress} />

                <View style={styles.content}>
                    <AddMaterialCard onPressAdd={handleAddMaterial} />
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.white,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    container: {
        flex: 1,
        backgroundColor: colors.background || '#F5F7FA', // Fallback to light gray if background color not defined
    },
    content: {
        flex: 1,
        padding: spacing.md,
        alignItems: 'center',
        paddingTop: spacing.xl,
    },
});
