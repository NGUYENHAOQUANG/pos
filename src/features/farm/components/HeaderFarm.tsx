import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    Text,
    TouchableOpacity,
    Modal,
    TouchableWithoutFeedback,
    Dimensions,
    Platform,
    StatusBar,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius } from '@/styles';
import { DropDownButtonBasic, DropDownItem } from '@/features/farm/components/DropDownButtonBasic';
import { ButtonHeader } from '@/features/farm/components/ButtonHeader';
import { IconPond } from '@/assets/icons'; // Import new SVG
import { PondTypeTag, PondType } from '@/features/farm/components/pond/PondTypeTag';
import { HeaderSection } from '@/shared/components/layout/HeaderSection';

interface HeaderFarmProps {
    // Common
    onMenuPress?: () => void;
    menuOptions?: { value: string; onMenuOptionPress: () => void }[];

    // Mode: 'list' (default) or 'detail' or 'simple' or 'cycle-detail'
    type?: 'list' | 'detail' | 'simple' | 'cycle-detail';
    titleAlign?: 'center' | 'left'; // Thêm prop căn lề

    // Specific to 'list' mode
    data?: DropDownItem[];
    value?: DropDownItem;
    onSelect?: (item: DropDownItem) => void;

    // Specific to 'detail' mode
    title?: string | React.ReactNode; // e.g. Pond Name or custom ReactNode
    subtitle?: string; // e.g. Area
    tagType?: PondType;
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
    onBack,
    leftComponent,
    rightAction,
}: HeaderFarmProps) => {
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
        const centerNode = typeof title === 'object' ? title : undefined;
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
    if (type === 'detail') {
        const leftNode = (
            <View style={styles.detailLeft}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <IconPond width={40} height={40} style={{ marginRight: spacing.sm }} />
                <View style={styles.infoContainer}>
                    <Text style={styles.pondName}>{title || '---'}</Text>
                    <Text style={styles.pondArea}>{subtitle || '---'}</Text>
                </View>
            </View>
        );

        const rightNode = (
            <View style={styles.detailRight}>
                {tagType && <PondTypeTag type={tagType} style={styles.tag} />}
                <View ref={buttonRef} collapsable={false}>
                    <ButtonHeader onPress={openMenu} style={styles.menuButtonDetail} />
                </View>
            </View>
        );

        return (
            <>
                <HeaderSection leftComponent={leftNode} rightComponent={rightNode} />

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
    const listLeft = onSelect ? (
        <View style={styles.listLeftContainer}>
            <DropDownButtonBasic data={data} value={value} onSelect={onSelect} />
        </View>
    ) : undefined;

    const listRight = <ButtonHeader onPress={onMenuPress} />;

    return <HeaderSection leftComponent={listLeft} rightComponent={listRight} />;
};

const styles = StyleSheet.create({
    // --- List Mode Styles ---
    listLeftContainer: {
        flexDirection: 'row', // Ensure it takes necessary width
        marginRight: 16,
    },

    // --- Detail Mode Styles ---
    detailLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
        borderRadius: borderRadius.sm,
        borderWidth: 1,
        borderColor: colors.borderDark || colors.border,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.full,
        backgroundColor: colors.blue[50],
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.sm,
    },
    icon: {
        width: 24,
        height: 24,
    },
    infoContainer: {
        justifyContent: 'center',
    },
    pondName: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
    },
    pondArea: {
        fontSize: 12,
        color: colors.text,
    },
    detailRight: {
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
