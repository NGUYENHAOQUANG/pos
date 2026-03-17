import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { borderRadius, colors } from '@/styles';
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
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.defaultBorder,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16, // Match input height roughly
        paddingHorizontal: 16,
    },
    itemTitle: {
        flex: 1,
        fontSize: 14,
        color: colors.text,
        fontWeight: '400',
    },
});
