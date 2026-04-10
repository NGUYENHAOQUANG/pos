import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Modal,
    TouchableWithoutFeedback,
    Dimensions,
} from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { DropDownButtonBasic, DropDownItem } from '@/features/farm/components/DropDownButtonBasic';
import { MoreButton } from '@/shared/components/buttons/MoreButton';
import { PondTypeTag } from '@/features/farm/components/pond/PondTypeTag';
import { PondType, POND_TYPES } from '@/features/farm/types/farm.types';
import { Tag, TagStatus } from '@/features/farm/components/pond/Tag';
import { HeaderSection } from '@/shared/components/layout/HeaderSection';
import { IconInfomation } from '@/assets/icons';

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
    tagType?: PondType | string;
    status?: TagStatus; // Added status prop
    onBack?: () => void;
    onInfoPress?: () => void;
    backButtonDisabled?: boolean;
    leftComponent?: React.ReactNode;
    rightAction?: React.ReactNode;
    rightTopComponent?: React.ReactNode;
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
    onInfoPress,
    backButtonDisabled,
    leftComponent,
    rightAction,
    rightTopComponent,
}: HeaderFarmProps) => {
    const insets = useSafeAreaInsets();
    const [menuVisible, setMenuVisible] = useState(false);
    const [dropdownTop, setDropdownTop] = useState(0);
    const [dropdownRight, setDropdownRight] = useState(24);
    const buttonRef = React.useRef<View>(null);
    const theme = useAppTheme();
    const styles = getStyles(theme);

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
                backButtonDisabled={backButtonDisabled}
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
        // Check if this is a settling pond
        const pondTypeName = typeof tagType === 'string' ? tagType : (tagType as PondType)?.name;
        const isSettlingPond = pondTypeName === POND_TYPES.SETTLING;

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
                {isSettlingPond ? (
                    <TouchableOpacity
                        onPress={onInfoPress}
                        style={styles.infoButton}
                        activeOpacity={0.7}
                    >
                        <IconInfomation width={20} height={20} />
                    </TouchableOpacity>
                ) : (
                    <View ref={buttonRef} collapsable={false}>
                        <MoreButton onPress={openMenu} style={styles.menuButtonDetail} />
                    </View>
                )}
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
                    backButtonDisabled={backButtonDisabled}
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
                <View style={styles.topRow}>
                    <Text style={styles.listTitle}>Trại Nuôi</Text>
                    {rightTopComponent}
                </View>
                <View style={styles.dropdownRow}>
                    <DropDownButtonBasic
                        data={data}
                        value={value}
                        onSelect={onSelect}
                        style={{ flex: 1 }}
                    />
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
                        <DropDownButtonBasic
                            data={data}
                            value={value}
                            onSelect={onSelect}
                            showIcon={false}
                        />
                    </View>
                ) : undefined
            }
            rightComponent={<MoreButton onPress={onMenuPress || openMenu} />}
        />
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        // --- List Mode Styles ---
        listContainer: {
            paddingHorizontal: 16,
            paddingBottom: 16,
            backgroundColor: 'transparent',
        },
        topRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: spacing.md,
        },
        listTitle: {
            fontSize: 20,
            fontWeight: '600',
            color: theme.text,
        },
        dropdownRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
        },
        detailHeaderContainer: {
            backgroundColor: 'transparent',
            borderBottomWidth: 0,
        },
        listLeftContainer: {
            flex: 1,
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
            color: theme.text,
        },
        pondArea: {
            fontSize: 12,
            color: theme.textSecondary || theme.text, // Use textSecondary if available
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
        infoButton: {
            width: 40,
            height: 40,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
            borderRadius: 9999,
            borderWidth: 1,
            borderColor: theme.defaultBorder,
            backgroundColor: theme.background,
        },
        // Modal Styles
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.05)',
        },
        menuContainer: {
            position: 'absolute',
            backgroundColor: theme.background,
            borderRadius: 8,
            paddingVertical: 4,
            shadowColor: theme.shadow,
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
            color: theme.text,
            fontWeight: '400',
            paddingVertical: 4,
            paddingHorizontal: 8,
        },
    });
