import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { colors } from '@/styles';
import { PondData } from '@/features/farm/types/farm.types';

interface PondConnecterProps {
    totalPonds: string;
    ponds: PondData[];
    onPondPress?: (pond: PondData) => void;
}

export const PondConnecter: React.FC<PondConnecterProps> = ({ totalPonds, ponds, onPondPress }) => {
    return (
        <View style={styles.container}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Ao đã kết nối</Text>
                <Text style={styles.pondCount}>{totalPonds} ao</Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.pondsContainer}>
                {ponds.map((pond, index) => {
                    // Safe handling of type - it can be a string or an object based on API
                    const typeName =
                        typeof pond.type === 'string' ? pond.type : pond.type?.name || 'Ao nuôi';
                    const status = pond.status || 'Đang hoạt động';

                    return (
                        <TouchableOpacity
                            key={pond.id || index}
                            style={styles.pondCard}
                            onPress={() => onPondPress && onPondPress(pond)}
                        >
                            <View>
                                <Text style={styles.pondName}>{pond.name}</Text>
                                <Text style={styles.pondDetail}>
                                    {typeName} - {status}
                                </Text>
                            </View>
                            <AntDesign name="right" size={20} color={colors.text} />
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        marginTop: 12,
        paddingBottom: 12,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    sectionTitle: {
        fontSize: 14,
        lineHeight: 22,
        fontWeight: '700',
        color: colors.text,
    },
    pondCount: {
        fontSize: 14,
        color: colors.text,
    },
    pondsContainer: {
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
    },
    pondCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 12,
    },
    pondName: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 4,
    },
    pondDetail: {
        fontSize: 14,
        color: colors.gray[500],
    },
});
