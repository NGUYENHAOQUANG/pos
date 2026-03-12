import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { colors, typography } from '@/styles';
import { PondData } from '@/features/farm/types/farm.types';

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

interface PondInfoCardProps {
    pond?: PondData;
}

export const PondInfoCard: React.FC<PondInfoCardProps> = ({ pond }) => {
    const pondInfo = {
        name: pond?.name || '{ten ao nuoi tom}',
        // Safely handle if type is string (old) or object (new)
        type: (typeof pond?.type === 'object' ? pond?.type?.name : pond?.type) || '{loại ao}',
        // shape: pond?.shape || '{hình dáng ao}',
        area: pond?.areaSqm
            ? `${Math.round(Number(pond.areaSqm))} m²`
            : pond?.area
            ? `${parseInt(pond.area.toString().replace(/[^0-9.]/g, ''), 10)} m²`
            : '{diện tích}',
        depth: pond?.maxDepth ? `${pond.maxDepth} m` : pond?.depth?.toString() || '{độ sâu}',
    };

    return (
        <View style={styles.card}>
            <InfoField label="Tên ao:" value={pondInfo.name} />
            <InfoField label="Loại ao:" value={pondInfo.type} />
            {/* <InfoField label="Hình dáng ao:" value={pondInfo.shape} /> */}
            <InfoField label="Diện tích:" value={pondInfo.area} />
            <InfoField label="Độ sâu:" value={pondInfo.depth.toString()} />
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
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
    },
    fieldContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    fieldLabel: {
        fontSize: 14,
        lineHeight: 22,
        color: colors.textSecondary,
    },
    fieldValue: {
        fontSize: 14,
        fontWeight: typography.fontWeight.bold,
        lineHeight: 22,
        color: colors.text,
        flex: 1,
        textAlign: 'right',
        marginLeft: 80,
    },
});
