import React from 'react';
import { View, Text, StyleSheet, Platform, ViewStyle } from 'react-native';
import { Button } from '@/shared/components/buttons/Button';
import { colors, spacing, borderRadius, typography } from '@/styles';
import EmptyStateIcon from '@/assets/Icon/EmptyStateIcon.svg';

interface EmptyStateCardProps {
    message: string;
    buttonTitle: string;
    onPress: () => void;
    buttonStyle?: ViewStyle;
}

export const EmptyStateCard: React.FC<EmptyStateCardProps> = ({
    message,
    buttonTitle,
    onPress,
    buttonStyle,
}) => {
    return (
        <View style={styles.container}>
            <EmptyStateIcon width={100} height={100} style={styles.image} />
            <Text style={styles.text}>{message}</Text>
            <Button
                title={buttonTitle}
                onPress={onPress}
                iconLeft="add"
                variant="primary"
                size="medium"
                style={StyleSheet.flatten([styles.button, buttonStyle])}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        padding: spacing.xl,
        marginHorizontal: spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    image: {
        marginBottom: spacing.md,
    },
    text: {
        fontSize: 14,
        color: colors.text,
        textAlign: 'center',
        marginBottom: spacing.lg,
        fontFamily: typography.fontFamily.regular,
    },
    button: {
        minWidth: 160,
    },
});

export type MaterialTabType =
    | 'list'
    | 'history'
    | 'inventory'
    | 'shrimp-inspection'
    | 'export'
    | 'material';

interface MaterialEmptyStateProps {
    tab: MaterialTabType;
    onPress: () => void;
}

export const MaterialEmptyState: React.FC<MaterialEmptyStateProps> = ({ tab, onPress }) => {
    const config = {
        list: {
            message: 'Chưa có vật tư nào trong kho.',
            buttonTitle: 'Thêm vật tư vào kho',
            buttonStyle: undefined,
        },
        material: {
            message: 'Chưa có vật tư nào trong danh mục.',
            buttonTitle: 'Tạo vật tư mới',
            buttonStyle: undefined,
        },
        history: {
            message: 'Chưa có phiếu nhập kho nào được tạo.',
            buttonTitle: 'Tạo phiếu nhập kho',
            buttonStyle: undefined,
        },
        export: {
            message: 'Chưa có phiếu xuất kho nào được tạo.',
            buttonTitle: 'Tạo phiếu xuất kho',
            buttonStyle: undefined,
        },
        inventory: {
            message: 'Chưa có phiếu điều chỉnh tồn kho nào được tạo.',
            buttonTitle: 'Tạo Phiếu Điều Chỉnh Tồn Kho',
            buttonStyle: { width: '100%' } as ViewStyle,
        },
        'shrimp-inspection': {
            message: 'Chưa có dữ liệu kiểm tra tôm',
            buttonTitle: 'Bắt đầu kiểm tra tôm',
            buttonStyle: undefined,
        },
    };

    const { message, buttonTitle, buttonStyle } = config[tab] || config.list;

    return (
        <EmptyStateCard
            message={message}
            buttonTitle={buttonTitle}
            onPress={onPress}
            buttonStyle={buttonStyle}
        />
    );
};
