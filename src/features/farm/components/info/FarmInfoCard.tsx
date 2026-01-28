import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { colors } from '@/styles';
import { FarmData } from '@/features/farm/types/farm.types';
import FarmInfor from '@/assets/images/FarmInfor.svg';

interface InfoFieldProps {
    label: string;
    value: string;
}

const InfoField: React.FC<InfoFieldProps> = ({ label, value }) => {
    return (
        <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>{label}</Text>
            <Text style={styles.fieldValue}>{value}</Text>
        </View>
    );
};

interface FarmInfoCardProps {
    farm?: FarmData;
}

export const FarmInfoCard: React.FC<FarmInfoCardProps> = ({ farm }) => {
    const [mapMode, setMapMode] = React.useState<'map' | 'satellite'>('map');

    const farmInfo = {
        name: farm?.name || '{ten trai nuoi tom}',
        code: farm?.code || '{mã trại}',
        area:
            typeof farm?.area === 'number'
                ? (farm.area as number).toLocaleString('vi-VN')
                : farm?.area
                ? Number(farm.area).toLocaleString('vi-VN')
                : '',
        address: farm?.address || '',
    };

    return (
        <View style={styles.card}>
            <View style={styles.imageContainer}>
                <FarmInfor width="100%" height="100%" preserveAspectRatio="xMidYMid slice" />
                <View style={styles.mapControls}>
                    <TouchableOpacity
                        style={[
                            styles.controlButton,
                            mapMode === 'map' && styles.controlButtonActive,
                        ]}
                        onPress={() => setMapMode('map')}
                    >
                        <Text
                            style={[
                                styles.controlButtonText,
                                mapMode === 'map' && styles.controlButtonTextActive,
                            ]}
                        >
                            Bản đồ
                        </Text>
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    <TouchableOpacity
                        style={[
                            styles.controlButton,
                            mapMode === 'satellite' && styles.controlButtonActive,
                        ]}
                        onPress={() => setMapMode('satellite')}
                    >
                        <Text
                            style={[
                                styles.controlButtonText,
                                mapMode === 'satellite' && styles.controlButtonTextActive,
                            ]}
                        >
                            Vệ tinh
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
            <InfoField label="Tên trại:" value={farmInfo.name} />
            <InfoField label="Mã trại:" value={farmInfo.code} />
            <InfoField label="Diện tích:" value={farmInfo.area} />
            <InfoField label="Địa chỉ:" value={farmInfo.address} />
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.white,
        paddingTop: 12,
        paddingBottom: 12,
        paddingHorizontal: 16,
        marginTop: 8,
        // Shadow equivalent to box-shadow: 0px 1px 6px -1px #00000005
        shadowColor: colors.shadow,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2, // For Android
    },
    fieldContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    fieldLabel: {
        fontSize: 14,
        fontWeight: '700',
        lineHeight: 22,
        color: colors.text,
    },
    imageContainer: {
        height: 180,
        width: '100%',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 16,
    },
    fieldValue: {
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 22,
        color: colors.text,
    },
    mapControls: {
        position: 'absolute',
        top: 12,
        left: 12,
        flexDirection: 'row',
        backgroundColor: colors.white,
        borderRadius: 8,
        padding: 4,
        shadowColor: colors.shadow,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    controlButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    controlButtonActive: {
        borderColor: colors.blue[600],
    },
    controlButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.text,
    },
    controlButtonTextActive: {
        color: colors.blue[600],
        fontWeight: '600',
    },
    divider: {
        width: 1,
        backgroundColor: colors.border,
        marginVertical: 4,
        marginHorizontal: 4,
    },
});
