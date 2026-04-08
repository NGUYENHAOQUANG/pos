/**
 * @file QuickReplyBottomSheet.tsx
 * @description Bottom sheet hiển thị danh sách quick reply suggestions
 */
import React, { useEffect } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Modal,
    Animated,
    Dimensions,
} from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import CloseIcon from '@/assets/Icon/CloseOutlined.svg';
import { COLORS, QUICK_REPLIES } from '../constants';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface QuickReplyBottomSheetProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (text: string) => void;
}

export const QuickReplyBottomSheet: React.FC<QuickReplyBottomSheetProps> = ({
    visible,
    onClose,
    onSelect,
}) => {
    const slideAnim = React.useRef(new Animated.Value(SCREEN_HEIGHT)).current;

    useEffect(() => {
        if (visible) {
            slideAnim.setValue(SCREEN_HEIGHT);
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 50,
                friction: 8,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: SCREEN_HEIGHT,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [visible, slideAnim]);

    const handleSelect = (text: string) => {
        onSelect(text);
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={sheetStyles.overlay}>
                    <TouchableWithoutFeedback>
                        <Animated.View
                            style={[
                                sheetStyles.container,
                                { transform: [{ translateY: slideAnim }] },
                            ]}
                        >
                            {/* Header */}
                            <View style={sheetStyles.header}>
                                <Text style={sheetStyles.title}>Gợi ý nhanh</Text>
                                <TouchableOpacity
                                    onPress={onClose}
                                    style={sheetStyles.closeButton}
                                    activeOpacity={0.7}
                                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                >
                                    <CloseIcon width={20} height={20} />
                                </TouchableOpacity>
                            </View>

                            {/* Quick Reply Items */}
                            <View style={sheetStyles.content}>
                                {QUICK_REPLIES.map(item => (
                                    <TouchableOpacity
                                        key={item.id}
                                        style={sheetStyles.itemRow}
                                        onPress={() => handleSelect(item.text)}
                                        activeOpacity={0.6}
                                    >
                                        <Text style={sheetStyles.itemText}>{item.text}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const sheetStyles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    container: {
        width: '100%',
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 24,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    title: {
        fontSize: 17,
        fontWeight: '700',
        color: COLORS.black,
    },
    closeButton: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        gap: 4,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 4,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#E5E7EB',
    },
    itemText: {
        fontSize: 15,
        color: COLORS.black,
        fontWeight: '400',
    },
});
