import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { colors } from '@/styles';

interface SecurityManagementItemProps {
    iconName: string;
    title: string;
    onPress?: () => void;
    isLast?: boolean;
}

const SecurityManagementItem: React.FC<SecurityManagementItemProps> = ({
    iconName,
    title,
    onPress,
    isLast,
}) => {
    return (
        <View>
            <TouchableOpacity style={styles.itemContainer} onPress={onPress}>
                <View style={styles.iconWrapper}>
                    <AntDesign name={iconName} size={20} color={colors.text} />
                </View>
                <Text style={styles.itemTitle}>{title}</Text>
                <AntDesign name="right" size={20} color={colors.text} />
            </TouchableOpacity>
            {!isLast && <View style={styles.itemSeparator} />}
        </View>
    );
};

export const SecurityManagement: React.FC = () => {
    const items = [
        {
            id: 'privacy',
            title: 'Chính sách bảo mật',
            iconName: 'safety',
        },
        {
            id: 'terms',
            title: 'Điều khoản và điều kiện',
            iconName: 'filetext1',
        },
    ];

    return (
        <View style={styles.card}>
            <Text style={styles.headerTitle}>Quản lý bảo mật</Text>
            <View style={styles.divider} />
            <View>
                {items.map((item, index) => (
                    <SecurityManagementItem
                        key={item.id}
                        iconName={item.iconName}
                        title={item.title}
                        isLast={index === items.length - 1}
                        onPress={() => {
                            // Handle navigation here
                        }}
                    />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.white,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
        paddingVertical: 16,
        // paddingHorizontal: 16, // Removed to allow full width divider
        // marginBottom: 16, // Removed to let parent handle gap
        // Shadow for iOS
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        // Elevation for Android
        elevation: 2,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 12,
        paddingHorizontal: 16,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginBottom: 8,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    itemSeparator: {
        height: 1,
        backgroundColor: colors.border,
        marginHorizontal: 16,
    },
    iconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.blue[50], // Consistent with other components
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    itemTitle: {
        flex: 1,
        fontSize: 16,
        color: colors.text,
        fontWeight: '400',
    },
});
