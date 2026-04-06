import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';

interface Farm {
    id: string;
    name: string;
    count: string;
}

interface FarmConnecterProps {
    totalFarms: string;
    farms: Farm[];
    onFarmPress?: (farm: Farm) => void;
}

export const FarmConnecter: React.FC<FarmConnecterProps> = ({ totalFarms, farms, onFarmPress }) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    return (
        <View style={styles.container}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Trang trại đã kết nối</Text>
                <View style={styles.countBadge}>
                    <Text style={styles.farmCount}>{totalFarms}</Text>
                </View>
            </View>

            <View style={styles.farmsContainer}>
                {farms.map(farm => (
                    <TouchableOpacity
                        key={farm.id}
                        style={styles.farmCard}
                        onPress={() => onFarmPress && onFarmPress(farm)}
                    >
                        <View style={styles.farmInfo}>
                            <Text style={styles.farmName}>{farm.name}</Text>
                            <Text style={styles.farmPondCount}>{farm.count} ao</Text>
                        </View>
                        <AntDesign name="right" size={16} color={theme.gray[400]} />
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            gap: 12,
        },
        sectionHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        sectionTitle: {
            fontSize: 16,
            fontWeight: '600',
            lineHeight: 20,
            color: theme.text,
        },
        countBadge: {
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 9999,
            backgroundColor: theme.blue[25],
            borderWidth: 1,
            borderColor: theme.blue[200],
        },
        farmCount: {
            fontSize: 14,
            fontWeight: '500',
            lineHeight: 20,
            color: theme.blue[600],
        },
        farmsContainer: {
            gap: 8,
        },
        farmCard: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: theme.background,
            padding: 12,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: theme.defaultBorder,
            gap: 16,
        },
        farmInfo: {
            flex: 1,
            gap: 8,
        },
        farmName: {
            fontSize: 16,
            fontWeight: '500',
            lineHeight: 20,
            color: theme.text,
        },
        farmPondCount: {
            fontSize: 16,
            fontWeight: '400',
            color: theme.textSecondary,
            lineHeight: 20,
        },
    });
