import React from 'react';
import { View, Text, StyleSheet, Image, ImageSourcePropType, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Fallback colors if not available
const THEME_COLORS = {
    active: '#2F6BFF',
    warning: '#ef4444',
    inactive: '#f59e0b',
    border: '#E5E7EB',
    text: '#374151'
};

interface DevicesItemProps {
    icon: ImageSourcePropType;
    activeCount?: number;
    warningCount?: number;
    inactiveCount?: number;
    onPress?: () => void;
    style?: StyleProp<ViewStyle>;
}

export const DevicesItem: React.FC<DevicesItemProps> = ({
    icon,
    activeCount = 0,
    warningCount = 0,
    inactiveCount = 0,
    onPress,
    style
}) => {
    return (
        <TouchableOpacity style={[styles.container, style]} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.iconContainer}>
                <Image source={icon} style={styles.mainIcon} resizeMode="contain" />
            </View>

            <View style={styles.statsContainer}>
                <View style={styles.statRow}>
                    <Ionicons name="power-outline" size={16} color={THEME_COLORS.active} />
                    <Text style={styles.statValue}>{activeCount}</Text>
                </View>

                <View style={styles.statRow}>
                    <Ionicons name="warning-outline" size={16} color={THEME_COLORS.warning} />
                    <Text style={styles.statValue}>{warningCount}</Text>
                </View>

                <View style={styles.statRow}>
                    <Ionicons name="ban-outline" size={16} color={THEME_COLORS.inactive} />
                    <Text style={styles.statValue}>{inactiveCount}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#F3F4F6',
        // Removed fixed minWidth to allow flex shrinking/growing
    },
    iconContainer: {
        marginBottom: 8,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mainIcon: {
        width: 32,
        height: 32,
    },
    statsContainer: {
        gap: 4,
        alignItems: 'center',
        width: '100%',
    },
    statRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        width: '100%',
        justifyContent: 'center',
    },
    statValue: {
        fontSize: 14,
        fontWeight: '500',
        color: THEME_COLORS.text,
        marginLeft: 4,
        minWidth: 16,
    }
});
