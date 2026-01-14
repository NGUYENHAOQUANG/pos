import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { colors } from '@/styles';
import { useNavigation } from '@react-navigation/native';

export const DeleteAccountButton: React.FC = () => {
    const navigation = useNavigation<any>();

    const handleDeleteAccount = () => {
        // Navigate viaAuth stack
        navigation.navigate('DeleteAccount');
    };

    return (
        <View style={styles.card}>
            <TouchableOpacity style={styles.itemContainer} onPress={handleDeleteAccount}>
                <Text style={styles.itemTitle}>Xoá tài khoản</Text>
                <AntDesign name="right" size={20} color={colors.text} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.white,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
        // marginBottom: 16,
        // Shadow for iOS
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        // Elevation for Android
        elevation: 2,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16, // Match input height roughly
        paddingHorizontal: 16,
    },
    itemTitle: {
        flex: 1,
        fontSize: 16,
        color: colors.text,
        fontWeight: '400',
    },
});
