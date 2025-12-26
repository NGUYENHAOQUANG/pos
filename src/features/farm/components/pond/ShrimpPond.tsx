import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    StyleProp,
    ViewStyle,
    Modal,
    TouchableWithoutFeedback,
    Dimensions,
    Platform,
    StatusBar,
} from 'react-native';

import { colors, spacing, borderRadius, shadows } from '@/styles';
import { PondTypeTag, PondType } from '@/features/farm/components/pond/PondTypeTag';
import { Tag, TagStatus } from '@/features/farm/components/pond/Tag';
import { ButtonHeader } from '@/features/farm/components/ButtonHeader';

interface ShrimpPondProps {
    name: string;
    area: string;
    type: PondType;
    lastUpdate?: string;
    lastActivity?: string;
    onInfoPress?: () => void;
    onCyclePress?: () => void;
    onDetailPress?: () => void;
    style?: StyleProp<ViewStyle>;
    status?: TagStatus;
}

export const ShrimpPond: React.FC<ShrimpPondProps> = ({
    name,
    area,
    type,
    lastUpdate,
    lastActivity,
    onInfoPress,
    onCyclePress,
    onDetailPress,
    style,
    status,
}) => {
    // If no update/activity provided, consider it empty/no-data mode
    const hasData = !!lastUpdate || !!lastActivity;

    const [menuVisible, setMenuVisible] = useState(false);
    const [dropdownTop, setDropdownTop] = useState(0);
    const [dropdownRight, setDropdownRight] = useState(24);
    const buttonRef = React.useRef<View>(null);

    const openMenu = () => {
        if (buttonRef.current) {
            buttonRef.current.measure((fx, fy, width, height, px, py) => {
                const windowWidth = Dimensions.get('window').width;
                const rightSpace = windowWidth - (px + width);

                setDropdownRight(rightSpace >= 0 ? rightSpace : 24);

                const statusbarHeight =
                    Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
                const top = py ? py + height - statusbarHeight + 4 : fy + height + 100;
                setDropdownTop(top || 200);

                setMenuVisible(true);
            });
        }
    };

    return (
        <View style={[styles.container, style]}>
            {/* Header Section */}
            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    <Image
                        source={require('@/assets/images/Icon/IconFarm/Pond.png')}
                        style={styles.icon}
                        resizeMode="contain"
                    />
                </View>
                <View style={styles.infoContainer}>
                    <Text style={styles.nameText}>{name}</Text>
                    <Text style={styles.areaText}>{area}</Text>
                </View>
                <View style={styles.headerRight}>
                    <PondTypeTag type={type} style={styles.tag} />
                    <View ref={buttonRef} collapsable={false}>
                        <ButtonHeader onPress={openMenu} style={styles.menuBtn} />
                    </View>
                </View>
            </View>

            <View style={styles.divider} />

            {/* Info Section */}
            <View style={styles.body}>
                {status && <Tag status={status} style={styles.statusTag} />}
                {hasData ? (
                    <>
                        <Text style={styles.bodyText}>
                            Lần cập nhật gần nhất:{' '}
                            <Text style={styles.bodyValue}>{lastUpdate || '-'}</Text>
                        </Text>
                        <Text style={[styles.bodyText, { marginTop: spacing.xs }]}>
                            Hoạt động gần nhất:{' '}
                            <Text style={styles.bodyValue}>{lastActivity || '-'}</Text>
                        </Text>
                    </>
                ) : (
                    <Text style={styles.bodyEmptyText}>
                        Ao chức năng không có dữ liệu công việc
                    </Text>
                )}
            </View>

            {hasData && (
                <>
                    <View style={styles.divider} />
                    {/* Footer Section */}
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={styles.detailButton}
                            onPress={onDetailPress}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.detailButtonText}>Xem chi tiết</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}

            <Modal
                visible={menuVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setMenuVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <View
                            style={[
                                styles.menuContainer,
                                { top: dropdownTop, right: dropdownRight },
                            ]}
                        >
                            <TouchableOpacity
                                style={[styles.menuItem, styles.menuItemFirst]}
                                onPress={() => {
                                    onInfoPress?.();
                                    setMenuVisible(false);
                                }}
                            >
                                <Text style={styles.menuText}>Thông tin ao</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={() => {
                                    onCyclePress?.();
                                    setMenuVisible(false);
                                }}
                            >
                                <Text style={styles.menuText}>Các chu kì nuôi</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.sm,
        ...shadows.sm, // Assuming a small shadow for card look
        borderWidth: 1,
        borderColor: colors.borderDark, // Or transparent if shadow is enough
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        padding: spacing.md,
        alignItems: 'center',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.full,
        backgroundColor: colors.blue[50], // Light blue bg for icon
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.sm,
    },
    icon: {
        width: 24,
        height: 24,
    },
    infoContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    nameText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 2,
    },
    areaText: {
        fontSize: 13,
        color: colors.textSecondary,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: spacing.sm,
    },
    tag: {
        marginRight: spacing.sm,
        alignSelf: 'center',
    },
    statusTag: {
        marginBottom: spacing.sm,
    },
    menuBtn: {
        width: 32, // Smaller menu button in card? Image shows standard size but maybe compact
        height: 32,
        borderWidth: 1,
        borderColor: colors.border,
    },
    divider: {
        height: 1,
        backgroundColor: colors.borderLight,
    },
    body: {
        paddingHorizontal: spacing.md,
        paddingVertical: 12,
    },
    bodyText: {
        fontSize: 14,
        color: colors.text,
    },
    bodyValue: {
        color: colors.text,
    },
    bodyEmptyText: {
        fontSize: 14,
        color: colors.text,
        textAlign: 'center',
        paddingVertical: spacing.sm,
    },
    footer: {
        padding: spacing.md,
    },
    detailButton: {
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.sm,
        borderWidth: 1,
        borderColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.white,
    },
    detailButtonText: {
        color: colors.primary,
        fontWeight: '500',
        fontSize: 14,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    menuContainer: {
        position: 'absolute',
        backgroundColor: colors.white,
        borderRadius: 8,
        paddingVertical: 4,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 5,
        minWidth: 200,
        zIndex: 100,
    },
    menuItem: {
        padding: 4,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    menuItemFirst: {
        backgroundColor: '#0000000A',
    },
    menuText: {
        fontSize: 16,
        color: colors.gray[800],
        fontWeight: '400',
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
});
