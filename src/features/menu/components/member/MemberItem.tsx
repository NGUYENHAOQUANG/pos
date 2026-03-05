import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Avatar from '@/assets/Icon/IconMenu/Avatar.svg';
import { colors, spacing, borderRadius } from '@/styles';
import { Tag, TagStatus } from '../Tag';
import { ActionMenu, getMenuPosition } from '@/shared/components/buttons/ActionMenuButton';
import { MoreButton } from '@/shared/components/buttons/MoreButton';

interface MemberItemProps {
    name: string;
    role: string;
    managementLevel: string;
    status: TagStatus;
    onPressOption?: () => void;
    onDelete?: () => void;
    onSuspend?: () => void;
    onActivate?: () => void;
    onResendInvite?: () => void;
}

export const MemberItem: React.FC<MemberItemProps> = ({
    name,
    role,
    managementLevel,
    status,
    onPressOption,
    onDelete,
    onSuspend,
    onActivate,
    onResendInvite,
}) => {
    const [menuVisible, setMenuVisible] = useState(false);
    const [menuPosition, setMenuPosition] = useState<any>({ top: 0, right: 0 });
    const buttonRef = useRef<View>(null);

    const menuItems = [
        {
            label: 'Chỉnh sửa thông tin',
            onPress: () => {
                setMenuVisible(false);
                setTimeout(() => onPressOption?.(), 100);
            },
        },
    ];

    if (status === 'pending') {
        menuItems.push({
            label: 'Gửi lại lời mời',
            onPress: () => {
                setMenuVisible(false);
                setTimeout(() => onResendInvite?.(), 100);
            },
        });
    }

    if (status === 'active') {
        menuItems.push({
            label: 'Tạm ngưng',
            onPress: () => {
                setMenuVisible(false);
                setTimeout(() => onSuspend?.(), 100);
            },
        });
    }

    if (status === 'paused') {
        menuItems.push({
            label: 'Kích hoạt lại',
            onPress: () => {
                setMenuVisible(false);
                setTimeout(() => onActivate?.(), 100);
            },
        });
    }

    menuItems.push({
        label: 'Xoá thành viên',
        onPress: () => {
            setMenuVisible(false);
            setTimeout(() => onDelete?.(), 100);
        },
    });

    const handlePressOption = () => {
        buttonRef.current?.measureInWindow((x, y, width, height) => {
            const windowHeight = require('react-native').Dimensions.get('window').height;
            const windowWidth = require('react-native').Dimensions.get('window').width;

            // Calculate estimated height: ~50px per item + ~16px padding
            const estimatedHeight = menuItems.length * 50 + 16;

            // pageY is y in measureInWindow
            const verticalPos = getMenuPosition(y, height, windowHeight, estimatedHeight);

            setMenuPosition({
                ...verticalPos,
                right: windowWidth - (x + width),
            });
            setMenuVisible(true);
        });
    };

    return (
        <View style={styles.container}>
            <View style={styles.leftContent}>
                {/* Avatar Placeholder */}
                <View style={styles.avatar}>
                    <Avatar width={48} height={48} />
                </View>

                <View style={styles.info}>
                    <View style={styles.headerRow}>
                        <Text style={styles.name}>{name}</Text>
                        <Tag status={status} type="member" />
                    </View>
                    <Text style={styles.details}>
                        {role} - {managementLevel}
                    </Text>
                </View>
            </View>

            <View ref={buttonRef} collapsable={false}>
                <MoreButton onPress={handlePressOption} color={colors.textSecondary} />
            </View>

            <ActionMenu
                visible={menuVisible}
                onClose={() => setMenuVisible(false)}
                position={menuPosition}
                items={menuItems}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.md,
        marginHorizontal: spacing.md,
        borderRadius: borderRadius.md,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
    },
    leftContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: spacing.md,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    info: {
        flex: 1,
        gap: 4,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        flexWrap: 'wrap', // Allow wrap if name is too long
    },
    name: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
    },
    details: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '400',
    },
});
