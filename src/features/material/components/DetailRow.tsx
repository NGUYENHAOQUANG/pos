import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    StyleProp,
    TextStyle,
    ViewStyle,
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
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '@/styles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const MAX_LINES = 3;

export interface DetailRowProps {
    label: string;
    value?: React.ReactNode | string | number | null;
    labelStyle?: StyleProp<TextStyle>;
    valueStyle?: StyleProp<TextStyle>;
    style?: StyleProp<ViewStyle>;
    isSpaceBetween?: boolean;
    /** Tiêu đề hiển thị trên header của bottom sheet */
    bottomSheetTitle?: string;
    /** Label hiển thị trong nội dung bottom sheet (nếu khác với tiêu đề) */
    sheetLabel?: string;
}

export const DetailRow: React.FC<DetailRowProps> = ({
    label,
    value,
    labelStyle,
    valueStyle,
    style,
    isSpaceBetween = true,
    bottomSheetTitle,
    sheetLabel,
}) => {
    const display = value !== null && value !== undefined && value !== '' ? value : '---';
    const isTextValue = typeof display === 'string' || typeof display === 'number';

    const [isTruncated, setIsTruncated] = useState(false);
    const [showSheet, setShowSheet] = useState(false);

    const handleTextLayout = (e: NativeSyntheticEvent<TextLayoutEventData>) => {
        if (e.nativeEvent.lines.length > MAX_LINES) {
            setIsTruncated(true);
        }
    };

    return (
        <>
            <View
                style={[
                    styles.detailRow,
                    isSpaceBetween && !isTruncated && styles.detailRowSpaceBetween,
                    isTruncated && styles.detailRowColumn,
                    style,
                ]}
            >
                <Text style={[styles.detailLabel, labelStyle]}>{label}</Text>

                {isTextValue ? (
                    <View style={isTruncated ? styles.valueBlock : styles.valueInline}>
                        <Text
                            style={[styles.detailValue, valueStyle]}
                            numberOfLines={isTruncated ? MAX_LINES : undefined}
                            onTextLayout={!isTruncated ? handleTextLayout : undefined}
                        >
                            {display}
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
                ) : (
                    display
                )}
            </View>

            {/* Bottom Sheet */}
            {isTextValue &&
                isTruncated &&
                (() => {
                    const sheetTitle = bottomSheetTitle ?? label;
                    // Show contentLabel inside scroll only if sheetLabel is provided and differs from sheetTitle
                    const contentLabel =
                        sheetLabel &&
                        sheetLabel.replace(/:$/, '').trim() !== sheetTitle.replace(/:$/, '').trim()
                            ? sheetLabel
                            : undefined;
                    return (
                        <DetailBottomSheet
                            visible={showSheet}
                            onClose={() => setShowSheet(false)}
                            title={sheetTitle}
                            content={String(display)}
                            contentLabel={contentLabel}
                        />
                    );
                })()}
        </>
    );
};

// ─── Bottom Sheet ────────────────────────────────────────────────────────────

interface DetailBottomSheetProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    content: string;
    /** Label hiển thị trong scroll content (chỉ khi khác title) */
    contentLabel?: string;
}

const DetailBottomSheet: React.FC<DetailBottomSheetProps> = ({
    visible,
    onClose,
    title,
    content,
    contentLabel,
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
                {/* Tap outside to dismiss */}
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
                        <TouchableOpacity
                            onPress={onClose}
                            style={styles.closeBtn}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="close" size={22} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.sheetDivider} />

                    {/* Scrollable content */}
                    <ScrollView
                        style={styles.scrollArea}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator
                        keyboardShouldPersistTaps="handled"
                    >
                        {contentLabel && <Text style={styles.sheetLabel}>{contentLabel}</Text>}
                        <Text style={styles.sheetContent}>{content}</Text>
                    </ScrollView>
                </Animated.View>
            </View>
        </Modal>
    );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    // DetailRow
    detailRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
    },
    detailRowSpaceBetween: {
        justifyContent: 'space-between',
    },
    detailRowColumn: {
        flexDirection: 'column',
        gap: 4,
    },
    detailLabel: {
        fontWeight: '400',
        fontSize: 14,
        color: colors.gray[500],
        lineHeight: 20,
    },
    detailValue: {
        fontSize: 14,
        color: colors.gray[950],
        fontWeight: '500',
        lineHeight: 22,
    },
    valueInline: {
        flexShrink: 1,
    },
    valueBlock: {
        width: '100%',
    },
    seeMoreBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        alignSelf: 'center',
        marginTop: 6,
    },
    seeMoreText: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.primary,
    },

    // Bottom sheet
    overlay: {
        flex: 1,
        backgroundColor: colors.overlayLight,
        justifyContent: 'flex-end',
    },
    dismissArea: {
        flex: 1,
    },
    sheet: {
        backgroundColor: colors.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        flexDirection: 'column', // Added this
        overflow: 'hidden', // Added this
    },
    handle: {
        width: 36,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.gray[300],
        alignSelf: 'center',
        marginTop: 8,
        marginBottom: 4,
    },
    sheetHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 2,
    },
    sheetTitle: {
        flex: 1,
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
    },
    closeBtn: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sheetDivider: {
        height: 1,
        backgroundColor: colors.border,
    },
    scrollArea: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingTop: 12,
    },
    sheetLabel: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 8,
    },
    sheetContent: {
        fontSize: 14,
        color: colors.gray[600],
        lineHeight: 22,
    },
});
