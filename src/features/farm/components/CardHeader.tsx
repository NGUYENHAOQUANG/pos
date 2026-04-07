import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import EditIcon from '@/assets/Icon/IconFarm/Edit.svg';

interface CardHeaderProps {
    title: string;
    onEdit?: () => void;
    style?: any;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ title, onEdit, style }) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    return (
        <View style={[styles.container, style]}>
            <Text style={styles.title} numberOfLines={1}>
                {title}
            </Text>
            {onEdit && (
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={onEdit}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <EditIcon style={styles.editIcon} color={theme.textSecondary} />
                </TouchableOpacity>
            )}
        </View>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 8,
            paddingHorizontal: 12,
            backgroundColor: theme.backgroundPrimary,
            borderBottomWidth: 1,
            borderBottomColor: theme.borderLight,
        },
        title: {
            fontSize: 15,
            fontWeight: '700',
            color: theme.text,
            lineHeight: 22,
            flexShrink: 1,
            paddingRight: 4,
        },
        editButton: {
            width: 32,
            height: 32,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: theme.defaultBorder,
            alignItems: 'center',
            justifyContent: 'center',
        },
        editIcon: {
            width: 14,
            height: 14,
        },
    });
