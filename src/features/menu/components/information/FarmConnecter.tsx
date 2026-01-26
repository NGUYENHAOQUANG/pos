import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { colors } from '@/styles';

interface Farm {
    id: string | number;
    name: string;
    count: string;
}

interface FarmConnecterProps {
    totalFarms: string;
    farms: Farm[];
    onFarmPress?: (farm: Farm) => void;
}

export const FarmConnecter: React.FC<FarmConnecterProps> = ({ totalFarms, farms, onFarmPress }) => {
    return (
        <View style={styles.container}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Trang trại đã kết nối</Text>
                <Text style={styles.farmCount}>{totalFarms} trại</Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.farmsContainer}>
                {farms.map(farm => (
                    <TouchableOpacity
                        key={farm.id}
                        style={styles.farmCard}
                        onPress={() => onFarmPress && onFarmPress(farm)}
                    >
                        <View>
                            <Text style={styles.farmName}>{farm.name}</Text>
                            <Text style={styles.farmPondCount}>{farm.count} ao</Text>
                        </View>
                        <AntDesign name="right" size={20} color={colors.text} />
                    </TouchableOpacity>
                ))}
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
    farmCount: {
        fontSize: 14,
        color: colors.text,
    },
    farmsContainer: {
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
    },
    farmCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 12,
    },
    farmName: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 4,
    },
    farmPondCount: {
        fontSize: 14,
        color: colors.gray[500],
    },
});
