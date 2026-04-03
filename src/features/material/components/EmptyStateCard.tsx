import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { Button } from '@/shared/components/buttons/Button';
import { useAppTheme } from '@/styles/themeContext';
import { Colors, spacing, borderRadius, typography } from '@/styles';
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
    const theme = useAppTheme();
    const styles = getStyles(theme);

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

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            backgroundColor: theme.background,
            borderRadius: borderRadius.md,
            padding: spacing.xl,
            marginHorizontal: spacing.md,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: theme.defaultBorder,
        },
        image: {
            marginBottom: spacing.md,
        },
        text: {
            fontSize: 14,
            color: theme.text,
            textAlign: 'center',
            marginBottom: spacing.lg,
            fontFamily: typography.fontFamily.regular,
        },
        button: {
            minWidth: 160,
        },
    });

export enum MaterialTabType {
    List = 'list',
    Warehouse = 'warehouse',
    History = 'history',
    Import = 'import',
    Inventory = 'inventory',
    ShrimpInspection = 'shrimp-inspection',
    Export = 'export',
    Material = 'material',
}

interface MaterialEmptyStateProps {
    tab: MaterialTabType;
    onPress: () => void;
}

interface EmptyStateConfig {
    message: string;
    buttonTitle: string;
    buttonStyle?: ViewStyle;
}

const EMPTY_STATE_CONFIG: Record<string, EmptyStateConfig> = {
    list: {
        message: 'Chưa có vật tư nào trong kho.',
        buttonTitle: 'Thêm vật tư vào kho',
    },
    warehouse: {
        message: 'Chưa có vật tư nào trong kho.',
        buttonTitle: 'Thêm vật tư vào kho',
    },
    material: {
        message: 'Chưa có vật tư nào trong danh mục.',
        buttonTitle: 'Tạo vật tư mới',
    },
    history: {
        message: 'Chưa có phiếu nhập kho nào được tạo.',
        buttonTitle: 'Tạo phiếu nhập kho',
    },
    import: {
        message: 'Chưa có phiếu nhập kho nào được tạo.',
        buttonTitle: 'Tạo phiếu nhập kho',
    },
    export: {
        message: 'Chưa có phiếu xuất kho nào được tạo.',
        buttonTitle: 'Tạo phiếu xuất kho',
    },
    inventory: {
        message: 'Chưa có phiếu điều chỉnh tồn kho nào được tạo.',
        buttonTitle: 'Tạo Phiếu Điều Chỉnh Tồn Kho',
        buttonStyle: { width: '100%' },
    },
    'shrimp-inspection': {
        message: 'Chưa có dữ liệu kiểm tra tôm',
        buttonTitle: 'Bắt đầu kiểm tra tôm',
    },
};

export const MaterialEmptyState: React.FC<MaterialEmptyStateProps> = ({ tab, onPress }) => {
    const { message, buttonTitle, buttonStyle } =
        EMPTY_STATE_CONFIG[tab] || EMPTY_STATE_CONFIG.list;

    return (
        <EmptyStateCard
            message={message}
            buttonTitle={buttonTitle}
            onPress={onPress}
            buttonStyle={buttonStyle}
        />
    );
};
