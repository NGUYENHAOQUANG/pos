import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { PondData } from '@/features/farm/types/farm.types';

interface PondConnecterProps {
    totalPonds: string;
    ponds: PondData[];
    onPondPress?: (pond: PondData) => void;
}

export const PondConnecter: React.FC<PondConnecterProps> = ({ totalPonds, ponds, onPondPress }) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    return (
        <View style={styles.container}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Ao đã kết nối</Text>
                <View style={styles.countBadge}>
                    <Text style={styles.pondCount}>{totalPonds}</Text>
                </View>
            </View>

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
                            <View style={styles.pondInfo}>
                                <Text style={styles.pondName}>{pond.name}</Text>
                                <Text style={styles.pondDetail}>
                                    {typeName} - {status}
                                </Text>
                            </View>
                            <AntDesign name="right" size={16} color={theme.gray[400]} />
                        </TouchableOpacity>
                    );
                })}
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
            color: theme.gray[950],
        },
        countBadge: {
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 9999,
            backgroundColor: theme.blue[25],
            borderWidth: 1,
            borderColor: theme.blue[200],
        },
        pondCount: {
            fontSize: 14,
            fontWeight: '500',
            lineHeight: 20,
            color: theme.blue[600],
        },
        pondsContainer: {
            gap: 8,
        },
        pondCard: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: theme.white,
            padding: 12,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: theme.gray[200],
            gap: 16,
        },
        pondInfo: {
            flex: 1,
            gap: 8,
        },
        pondName: {
            fontSize: 16,
            fontWeight: '500',
            lineHeight: 20,
            color: theme.gray[950],
        },
        pondDetail: {
            fontSize: 16,
            fontWeight: '400',
            color: theme.gray[500],
            lineHeight: 20,
        },
    });
