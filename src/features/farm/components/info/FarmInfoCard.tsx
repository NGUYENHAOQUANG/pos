import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

import { colors, typography } from '@/styles';
import { FarmData } from '@/features/farm/types/farm.types';
const BGFarmInfo = require('@/assets/backgrounds/Farm-Infor.png');

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
        <View style={styles.wrapper}>
            {/* Map Image - Outside card */}
            <View style={styles.imageContainer}>
                <Image source={BGFarmInfo} style={styles.backgroundImage} resizeMode="cover" />
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

            {/* Info Card - Separate from map */}
            <View style={styles.card}>
                <InfoField label="Tên trại:" value={farmInfo.name} />
                <InfoField label="Mã trại:" value={farmInfo.code} />
                <InfoField label="Diện tích:" value={farmInfo.area} />
                <InfoField label="Địa chỉ:" value={farmInfo.address} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
    },
    card: {
        backgroundColor: colors.white,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginTop: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
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
        color: colors.textSecondary,
    },
    imageContainer: {
        height: 250,
        width: '100%',
        borderRadius: 16,
        overflow: 'hidden',
        marginTop: 16,
        backgroundColor: colors.gray[100],
    },
    backgroundImage: {
        width: '100%',
        height: '100%',
    },
    fieldValue: {
        fontSize: 14,
        fontWeight: typography.fontWeight.medium,
        lineHeight: 22,
        color: colors.text,
        flex: 1,
        marginLeft: 80,
        textAlign: 'right',
    },
    mapControls: {
        position: 'absolute',
        top: 12,
        left: 12,
        flexDirection: 'row',
        backgroundColor: colors.gray[100],
        borderRadius: 100,
        padding: 2,
    },
    controlButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    controlButtonActive: {
        backgroundColor: colors.white,
        padding: 4,
        borderWidth: 1,
        borderColor: colors.border,
    },
    controlButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.textSecondary,
    },
    controlButtonTextActive: {
        color: colors.black,
        fontWeight: '700',
    },
    divider: {
        display: 'none',
    },
});
