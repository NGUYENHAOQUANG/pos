import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Modal,
    ScrollView,
    Pressable,
    NativeSyntheticEvent,
    TextLayoutEventData,
    useWindowDimensions,
    Animated,
    Dimensions,
} from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { colors } from '@/styles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { StatusHighlight } from './StatusHighlight';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAX_LINES = 3;

interface DataRowProps {
    label: string;
    value: string | number;
    unit?: string;
    isWarning?: boolean;
}

export const DataRow: React.FC<DataRowProps> = ({ label, value, unit, isWarning }) => {
    const [isTruncated, setIsTruncated] = useState(false);
    const [showSheet, setShowSheet] = useState(false);

    if (isWarning) {
        return <StatusHighlight label={label} value={value} unit={unit} />;
    }

    const displayValue = `${value}${unit ? ` ${unit}` : ''}`;

    const handleTextLayout = (e: NativeSyntheticEvent<TextLayoutEventData>) => {
        if (e.nativeEvent.lines.length > MAX_LINES) {
            setIsTruncated(true);
        }
    };

    return (
        <>
            <View style={[styles.container, isTruncated && styles.containerColumn]}>
                <Text style={styles.label}>{label}</Text>

                <View style={[styles.valueWrapper, isTruncated && styles.valueWrapperFull]}>
                    <Text
                        style={[styles.value, isTruncated && styles.valueLeftAlign]}
                        numberOfLines={isTruncated ? MAX_LINES : undefined}
                        onTextLayout={!isTruncated ? handleTextLayout : undefined}
                    >
                        {displayValue}
                    </Text>

                    {isTruncated && (
                        <TouchableOpacity
                            style={styles.seeMoreBtn}
                            onPress={() => setShowSheet(true)}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.seeMoreText}>Xem thêm</Text>
                            <Ionicons name="arrow-forward" size={14} color={colors.primary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Bottom Sheet Modal */}
            {isTruncated && (
                <DetailBottomSheet
                    visible={showSheet}
                    onClose={() => setShowSheet(false)}
                    title={label}
                    content={displayValue}
                />
            )}
        </>
    );
};

// ─── Bottom Sheet Modal Component ──────────────────────────────────────────

interface DetailBottomSheetProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    content: string;
}

const DetailBottomSheet: React.FC<DetailBottomSheetProps> = ({
    visible,
    onClose,
    title,
    content,
}) => {
    const insets = useSafeAreaInsets();
    const { height: screenHeight } = useWindowDimensions();
    const sheetHeight = screenHeight * 0.75;
    const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

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

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <Pressable style={styles.dismissArea} onPress={onClose} />

                <Animated.View
                    style={[
                        styles.sheet,
                        { height: sheetHeight, paddingBottom: Math.max(insets.bottom, 16) },
                        { transform: [{ translateY: slideAnim }] },
                    ]}
                >
                    <View style={styles.sheetHeader}>
                        <Text style={styles.sheetTitle} numberOfLines={1}>
                            {title.replace(/:$/, '').trim()}
                        </Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={22} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.sheetDivider} />

                    <ScrollView
                        style={styles.scrollArea}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator
                    >
                        <Text style={styles.sheetContent}>{content}</Text>
                    </ScrollView>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        borderRadius: 4,
    },
    containerColumn: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 4,
    },
    label: {
        fontSize: 14,
        color: colors.gray[500],
        flexShrink: 1,
    },
    valueWrapper: {
        flexDirection: 'column',
        alignItems: 'flex-end',
        flexShrink: 1,
        maxWidth: '60%',
        marginLeft: 8,
    },
    valueWrapperFull: {
        maxWidth: '100%',
        alignItems: 'flex-start',
        marginLeft: 0,
    },
    value: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.text,
        textAlign: 'right',
        lineHeight: 20,
    },
    valueLeftAlign: {
        textAlign: 'left',
    },
    seeMoreBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
        gap: 4,
        alignSelf: 'flex-start',
    },
    seeMoreText: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: '500',
    },
    // Bottom sheet styles
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'flex-end',
    },
    dismissArea: {
        flex: 1,
        width: '100%',
    },
    sheet: {
        backgroundColor: colors.white,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        width: '100%',
    },
    sheetHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        height: 60,
    },
    sheetTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
        flex: 1,
        marginRight: 16,
    },
    closeBtn: {
        padding: 4,
    },
    sheetDivider: {
        height: 1,
        backgroundColor: colors.gray[200],
    },
    scrollArea: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    sheetContent: {
        fontSize: 16,
        color: colors.text,
        lineHeight: 24,
    },
});
