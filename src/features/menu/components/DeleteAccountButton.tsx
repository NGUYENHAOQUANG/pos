import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { borderRadius } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { useNavigation } from '@react-navigation/native';

export const DeleteAccountButton: React.FC = () => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    const navigation = useNavigation<any>();

    const handleDeleteAccount = () => {
        // Navigate viaAuth stack
        navigation.navigate('DeleteAccount');
    };

    return (
        <View style={styles.card}>
            <TouchableOpacity style={styles.itemContainer} onPress={handleDeleteAccount}>
                <Text style={styles.itemTitle}>Xoá tài khoản</Text>
                <AntDesign name="right" size={20} color={theme.text} />
            </TouchableOpacity>
        </View>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        card: {
            backgroundColor: theme.white,
            borderRadius: borderRadius.md,
            borderWidth: 1,
            borderColor: theme.defaultBorder,
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
            color: theme.text,
            fontWeight: '400',
        },
    });
