import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { HeadingDevices } from '../components/HeadingDevices';
import { ButtonHelp } from '../components/ButtonHelp';
import { DevicesStatus } from '../components/DevicesStatus';
import { PondCard } from '../components/devices/PondCard';


export const DeviceControlScreens = () => {
    return (
        <View style={styles.container}>
            <HeadingDevices
                title="Điều Khiển Thiết Bị"
                rightComponent={<ButtonHelp />}
                showBackButton={false}
            />
            <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
                <DevicesStatus totalPonds={2} activePonds={2} warningPonds={1} otherPonds={0} />
                <View style={styles.spacer} />
                <PondCard pondName="Ao 1" />
                <PondCard pondName="Ao 2" />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F5FF',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    spacer: {
        height: 16,
    }
});
