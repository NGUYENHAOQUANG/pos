import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DevicesItem } from './DevicesItem';

interface PondCardProps {
    pondName: string;
    onPressDetail?: () => void;
}

export const PondCard: React.FC<PondCardProps> = ({
    pondName,
    onPressDetail,
}) => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{pondName}</Text>
                <TouchableOpacity
                    style={styles.detailButton}
                    onPress={onPressDetail}
                    activeOpacity={0.7}
                >
                    <Text style={styles.detailButtonText}>Xem chi tiết</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.devicesContainer}>
                <DevicesItem
                    icon={require('@/assets/images/Icon/IconDevices/fan.png')}
                    activeCount={0}
                    warningCount={0}
                    inactiveCount={0}
                    style={styles.deviceItem}
                />
                <DevicesItem
                    icon={require('@/assets/images/Icon/IconDevices/feeder.png')}
                    activeCount={0}
                    warningCount={0}
                    inactiveCount={0}
                    style={styles.deviceItem}
                />
                <DevicesItem
                    icon={require('@/assets/images/Icon/IconDevices/oxy.png')}
                    activeCount={0}
                    warningCount={0}
                    inactiveCount={0}
                    style={styles.deviceItem}
                />
                <DevicesItem
                    icon={require('@/assets/images/Icon/IconDevices/syphon.png')}
                    activeCount={0}
                    warningCount={0}
                    inactiveCount={0}
                    style={styles.deviceItem}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
    },
    detailButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: 'white',
    },
    detailButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
    },
    devicesContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8, // Using gap to space items
    },
    deviceItem: {
        flex: 1,
    },
});
