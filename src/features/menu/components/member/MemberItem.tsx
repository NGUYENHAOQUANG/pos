import React, { useState, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import Avatar from '@/assets/Icon/IconMenu/Avatar.svg';
import { spacing, borderRadius } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { Tag, TagStatus } from '../Tag';
import { ActionMenu, getMenuPosition } from '@/shared/components/buttons/ActionMenuButton';
import { MoreButton } from '@/shared/components/buttons/MoreButton';
import { OnboardingStep } from '@/features/walkthrough/components/OnboardingStep';

interface MemberItemProps {
    name: string;
    phone: string;
    roleName: string;
    status: TagStatus | string;
    onPressOption?: () => void;
    onDelete?: () => void;
    onSuspend?: () => void;
    onActivate?: () => void;
    onResendInvite?: () => void;
    isFirstItem?: boolean;
}

export const MemberItem = React.memo<MemberItemProps>(
    ({
        name,
        phone,
        roleName,
        status,
        onPressOption,
        onDelete,
        onSuspend,
        onActivate,
        onResendInvite,
        isFirstItem,
    }) => {
        const theme = useAppTheme();
        const styles = getStyles(theme);

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
                label: 'Tạm ngưng hoạt động',
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
                        {status && (
                            <Tag
                                status={status as TagStatus}
                                type="member"
                                style={styles.tagSpacing}
                            />
                        )}
                        <Text style={[styles.name, { color: theme.text }]}>{name}</Text>
                        <Text style={[styles.details, { color: theme.textSecondary }]}>
                            {phone}
                        </Text>
                        <Text style={[styles.details, { color: theme.textSecondary }]}>
                            {roleName}
                        </Text>
                    </View>
                </View>

                {isFirstItem ? (
                    <OnboardingStep step="ACCOUNT_MEMBER_ACTION">
                        <View
                            ref={buttonRef}
                            collapsable={false}
                            style={{ backgroundColor: theme.background, borderRadius: 20 }}
                        >
                            <MoreButton onPress={handlePressOption} color={theme.text} />
                        </View>
                    </OnboardingStep>
                ) : (
                    <View ref={buttonRef} collapsable={false}>
                        <MoreButton onPress={handlePressOption} color={theme.text} />
                    </View>
                )}

                <ActionMenu
                    visible={menuVisible}
                    onClose={() => setMenuVisible(false)}
                    position={menuPosition}
                    items={menuItems}
                />
            </View>
        );
    }
);

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: spacing.md,
            marginHorizontal: spacing.md,
            borderRadius: borderRadius.md,
            backgroundColor: theme.background,
            borderWidth: 1,
            borderColor: theme.defaultBorder,
        },
        leftContent: {
            flexDirection: 'row',
            alignItems: 'flex-start',
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
            justifyContent: 'center',
            paddingVertical: 4,
        },
        tagSpacing: {
            marginBottom: 2,
        },
        name: {
            fontSize: 14,
            fontWeight: '500',
        },
        details: {
            fontSize: 14,
            fontWeight: '400',
        },
    });
