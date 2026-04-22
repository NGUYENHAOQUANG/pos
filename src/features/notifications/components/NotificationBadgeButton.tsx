import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles';
import { useUnreadNotificationCount } from '@/features/notifications/hooks/useNotifications';

interface NotificationBadgeButtonProps {
    style?: StyleProp<ViewStyle>;
    onPress?: () => void;
}

export const NotificationBadgeButton: React.FC<NotificationBadgeButtonProps> = ({
    style,
    onPress,
}) => {
    const theme = useAppTheme();
    const navigation = useNavigation<any>();
    const { data: unreadCount = 0 } = useUnreadNotificationCount();
    const styles = getStyles(theme);

    const handlePress = () => {
        if (onPress) {
            onPress();
        } else {
            navigation.navigate('NotificationList');
        }
    };

    return (
        <TouchableOpacity style={[styles.notificationButton, style]} onPress={handlePress}>
            <Ionicons name="notifications-outline" size={20} color={theme.text} />
            {unreadCount > 0 && (
                <View style={styles.badgeContainer}>
                    <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        notificationButton: {
            width: 40,
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 8,
            borderWidth: 1,
            backgroundColor: theme.background,
            borderColor: theme.borderDark,
        },
        badgeContainer: {
            position: 'absolute',
            top: -4,
            right: -10,
            backgroundColor: theme.error,
            borderRadius: 10,
            minWidth: 20,
            height: 18,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 6,
        },
        badgeText: {
            color: '#FFFFFF',
            fontSize: 10,
            fontWeight: 'bold',
        },
    });
