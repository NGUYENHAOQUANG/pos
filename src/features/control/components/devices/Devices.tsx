import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Switch, ImageSourcePropType } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ButtonControlMode } from './ButtonControlMode';
import { EControlMode } from '../../types/control.types';

export interface DeviceData {
    id: string;
    name: string;
    icon: ImageSourcePropType;
    mode: EControlMode;
    isOn: boolean;
    errorMessage?: string;
}

export interface DeviceCardProps {
    data: DeviceData;
    onToggle: (id: string, val: boolean) => void;
    onSettingsPress?: (id: string) => void;
    onModePress?: (id: string) => void;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({ data, onToggle, onSettingsPress, onModePress }) => {
    // Determine styles based on state
    let containerStyle = styles.cardContainer;
    let iconColor = '#2F6BFF'; // Default Blue
    let borderColor = '#2F6BFF';
    let switchTrackColor = '#2F6BFF';

    if (data.errorMessage) {
        // Error State
        containerStyle = { ...styles.cardContainer, ...styles.cardError };
        iconColor = '#EF4444';
        borderColor = '#EF4444';
        switchTrackColor = '#2F6BFF';
    } else if (!data.isOn) {
        // Inactive State
        containerStyle = { ...styles.cardContainer, ...styles.cardInactive };
        iconColor = '#6B7280';
        borderColor = 'transparent';
        switchTrackColor = '#E5E7EB';
    } else {
        // Active State
        containerStyle = { ...styles.cardContainer, ...styles.cardActive };
    }

    return (
        <View style={containerStyle}>
            <View style={styles.leftColumn}>
                <Image
                    source={data.icon}
                    style={[styles.icon, { tintColor: iconColor }]}
                    resizeMode="contain"
                />
                <View>
                    {data.errorMessage && (
                        <Text style={styles.errorText}>{data.errorMessage}</Text>
                    )}
                    <Text style={styles.deviceName}>{data.name}</Text>
                </View>
            </View>

            <View style={styles.rightColumn}>
                <TouchableOpacity
                    style={styles.settingsButton}
                    onPress={() => onSettingsPress?.(data.id)}
                    activeOpacity={0.7}
                >
                    <Ionicons name="settings-outline" size={20} color="#1F2937" />
                </TouchableOpacity>

                <ButtonControlMode
                    mode={data.mode}
                    onPress={() => onModePress?.(data.id)}
                />

                <Switch
                    trackColor={{ false: '#9CA3AF', true: switchTrackColor }}
                    thumbColor={'white'}
                    ios_backgroundColor="#E5E7EB"
                    onValueChange={(val) => onToggle(data.id, val)}
                    value={data.isOn}
                    style={styles.switch}
                />
            </View>
        </View>
    );
};



const styles = StyleSheet.create({
    container: {
        // No grid layout in the example image, they are stacked vertically? 
        // The previous request had them in grid.
        // But the new image shows them stacked vertically one by one.
        // "Điều chỉnh cái này sao cho có 4 trạng thái như hình"
        // The image shows a vertical list. I will switch to vertical list to match the image exactly.
        gap: 12,
    },
    wrapper: {
        width: '100%',
    },
    cardContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        height: 120,
        flexDirection: 'row',
        justifyContent: 'space-between',
        // Common shadows
    },
    cardActive: {
        borderColor: '#2F6BFF',
        backgroundColor: 'white',
    },
    cardInactive: {
        borderColor: 'transparent',
        backgroundColor: '#F3F4F6', // Light Gray
    },
    cardError: {
        borderColor: '#EF4444', // Red border
        backgroundColor: '#FEF2F2', // Light Red bg
    },
    leftColumn: {
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flex: 1,
    },
    rightColumn: {
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        flex: 1,
    },
    icon: {
        width: 40,
        height: 40,
    },
    deviceName: {
        fontSize: 16,
        fontWeight: '400',
        color: '#1F2937',
    },
    errorText: {
        fontSize: 14,
        color: '#EF4444',
        marginBottom: 4,
    },
    settingsButton: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: 'white', // Settings button is white even on gray card? Image shows white bg on settings btn.
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    switch: {
        transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
        marginRight: -2,
    }
});
