import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius } from '@/styles';
import { Tag, TagStatus } from '../Tag';
import { ActionMenu, getMenuPosition } from '@/shared/components/buttons/ActionMenuButton';

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
    // onResendInvite,
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

    /* if (status === 'pending') {
        menuItems.push({
            label: 'Gửi lại lời mời',
            onPress: () => {
                setMenuVisible(false);
                setTimeout(() => onResendInvite?.(), 100);
            },
        });
    } */

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
        danger: true,
    } as any);

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
                    <Ionicons name="person-outline" size={24} color={colors.white} />
                </View>

                <View style={styles.info}>
                    <View style={styles.headerRow}>
                        <Text style={styles.name}>{name}</Text>
                        <Tag status={status} style={styles.tag} />
                    </View>
                    <Text style={styles.details}>
                        {role} - {managementLevel}
                    </Text>
                </View>
            </View>

            <TouchableOpacity
                ref={buttonRef}
                style={styles.optionButton}
                onPress={handlePressOption}
                activeOpacity={0.7}
            >
                <Ionicons name="ellipsis-vertical" size={16} color={colors.textSecondary} />
            </TouchableOpacity>

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
        backgroundColor: colors.white,
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
        backgroundColor: colors.gray[300],
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
    tag: {
        height: 20, // Slightly smaller than default tag if needed
    },
    details: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '400',
    },
    optionButton: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: borderRadius.sm,
        borderWidth: 1,
        borderColor: colors.borderDark,
    },
});
