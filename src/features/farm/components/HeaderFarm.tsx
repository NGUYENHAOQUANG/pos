import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    Text,
    TouchableOpacity,
    Modal,
    TouchableWithoutFeedback,
    Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '@/styles';
import {
    DropdownHeaderButton,
    DropDownHeaderItem,
} from '@/shared/components/forms/DropdownHeaderButton';
import { MoreButton } from '@/shared/components/buttons/MoreButton';
import { PondTypeTag } from '@/features/farm/components/pond/PondTypeTag';
import { PondType } from '@/features/farm/types/farm.types';
import { Tag, TagStatus } from '@/features/farm/components/pond/Tag';
import { HeaderSection } from '@/shared/components/layout/HeaderSection';

interface HeaderFarmProps {
    // Common
    onMenuPress?: () => void;
    menuOptions?: { value: string; onMenuOptionPress: () => void }[];

    // Mode: 'list' (default) or 'detail' or 'simple' or 'cycle-detail'
    type?: 'list' | 'detail' | 'simple' | 'cycle-detail';
    titleAlign?: 'center' | 'left'; // Thêm prop căn lề

    // Specific to 'list' mode
    data?: DropDownHeaderItem[];
    value?: DropDownHeaderItem;
    onSelect?: (item: DropDownHeaderItem) => void;

    // Specific to 'detail' mode
    title?: string | React.ReactNode; // e.g. Pond Name or custom ReactNode
    subtitle?: string; // e.g. Area
    tagType?: PondType | string;
    status?: TagStatus; // Added status prop
    onBack?: () => void;
    leftComponent?: React.ReactNode;
    rightAction?: React.ReactNode;
}

export const HeaderFarm = ({
    type = 'list',
    titleAlign = 'center', // Mặc định là center
    data,
    value,
    onSelect,
    onMenuPress,
    menuOptions,
    title,
    subtitle,
    tagType,
    status,
    onBack,
    leftComponent,
    rightAction,
}: HeaderFarmProps) => {
    const insets = useSafeAreaInsets();
    const [menuVisible, setMenuVisible] = useState(false);
    const [dropdownTop, setDropdownTop] = useState(0);
    const [dropdownRight, setDropdownRight] = useState(24);
    const buttonRef = React.useRef<View>(null);

    const openMenu = () => {
        if (buttonRef.current) {
            buttonRef.current.measureInWindow((x, y, width, height) => {
                const windowWidth = Dimensions.get('window').width;
                const rightSpace = windowWidth - (x + width);

                setDropdownRight(rightSpace >= 0 ? rightSpace : 24);
                setDropdownTop(y + height + 4);

                setMenuVisible(true);
            });
        } else {
            setMenuVisible(true);
        }
    };

    const handleMenuOptionPress = (onMenuOptionPress: () => void) => {
        onMenuOptionPress();
        setMenuVisible(false);
    };

    /**
     * Render Cycle Detail Mode & Simple Mode (Back, Custom Title with Subtitle, Right Action)
     */
    if (type === 'cycle-detail' || type === 'simple') {
        const centerNode =
            typeof title === 'object' ? (
                <View
                    style={{
                        width: '100%',
                        alignItems: titleAlign === 'left' ? 'flex-start' : 'center',
                    }}
                >
                    {title}
                </View>
            ) : undefined;
        // For string title, HeaderSection handles it via 'title' prop.
        // If title is object (ReactNode), pass as centerComponent.

        return (
            <HeaderSection
                title={typeof title === 'string' ? title : undefined}
                centerComponent={centerNode}
                titleAlign={titleAlign}
                leftComponent={leftComponent}
                rightComponent={rightAction || undefined} // HeaderSection handles undefined check, but safe to pass
                onBack={onBack}
                showBackButton={!leftComponent}
            />
        );
    }

    /**
     * Render Detail Mode (Back, Icon, Info, Tag, Menu)
     */
    /**
     * Render Detail Mode (Back, Icon, Info, Tag, Menu)
     * Using custom layout instead of HeaderSection to handle text truncation correctly
     * Layout: [Left Part (flex: 1)] [Right Part (auto)]
     */
    if (type === 'detail') {
        const centerNode = (
            <View style={styles.infoContainer}>
                <Text style={styles.pondName} numberOfLines={1} ellipsizeMode="tail">
                    {title || '---'}
                </Text>
                {subtitle && <Text style={styles.pondArea}>{subtitle}</Text>}
            </View>
        );

        const rightNode = (
            <View style={styles.detailRightContainer}>
                {status && <Tag status={status} style={styles.tag} />}
                {tagType && <PondTypeTag type={tagType} style={styles.tag} />}
                <View ref={buttonRef} collapsable={false}>
                    <MoreButton onPress={openMenu} style={styles.menuButtonDetail} />
                </View>
            </View>
        );

        return (
            <>
                <HeaderSection
                    centerComponent={centerNode}
                    titleAlign="left"
                    rightComponent={rightNode}
                    onBack={onBack}
                    showBackButton={true}
                    containerStyle={styles.detailHeaderContainer}
                />

                {menuOptions && menuOptions.length > 0 && (
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
                                    {menuOptions.map((option, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            style={styles.menuItem}
                                            onPress={() =>
                                                handleMenuOptionPress(option.onMenuOptionPress)
                                            }
                                        >
                                            <Text style={styles.menuText}>{option.value}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </Modal>
                )}
            </>
        );
    }

    /**
     * Render List Mode (Dropdown, Menu) - Default
     */
    if (type === 'list') {
        return (
            <View style={[styles.listContainer, { paddingTop: insets.top + 12 }]}>
                <Text style={styles.listTitle}>Trại nuôi</Text>
                <View style={styles.dropdownRow}>
                    <View style={styles.listLeftContainer}>
                        <DropdownHeaderButton data={data} value={value} onSelect={onSelect} />
                    </View>
                    <View ref={buttonRef} collapsable={false}>
                        <MoreButton onPress={onMenuPress || openMenu} />
                    </View>
                </View>
            </View>
        );
    }

    // Default or simple modes
    return (
        <HeaderSection
            leftComponent={
                onSelect ? (
                    <View style={styles.listLeftContainer}>
                        <DropdownHeaderButton data={data} value={value} onSelect={onSelect} />
                    </View>
                ) : undefined
            }
            rightComponent={<MoreButton onPress={onMenuPress || openMenu} />}
        />
    );
};

const styles = StyleSheet.create({
    // --- List Mode Styles ---
    listContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        backgroundColor: 'transparent',
    },
    listTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.text,
        marginBottom: spacing.md,
    },
    dropdownRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    detailHeaderContainer: {
        backgroundColor: 'transparent',
        borderBottomWidth: 0,
    },
    listLeftContainer: {
        flexDirection: 'row',
    },

    // --- Detail Mode Styles ---
    detailRightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    pondName: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
    },
    pondArea: {
        fontSize: 12,
        color: colors.textSecondary || colors.text, // Use textSecondary if available
    },
    detailRight: {
        // Keep for backward compatibility if used anywhere else
        flexDirection: 'row',
        alignItems: 'center',
    },
    tag: {
        marginRight: spacing.sm,
        alignSelf: 'center',
    },
    menuButtonDetail: {
        width: 40,
        height: 40,
    },
    // Modal Styles
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
    menuText: {
        fontSize: 16,
        color: colors.gray[800],
        fontWeight: '400',
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
});
