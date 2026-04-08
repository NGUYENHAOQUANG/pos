import React, { useRef, useEffect } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Animated,
    Dimensions,
    Easing,
    FlatList,
} from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../constants';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// ── Types ──────────────────────────────────────────────────────────────────
export interface ChatSession {
    id: string;
    title: string;
    date: string;
}

interface ChatHistoryBottomSheetProps {
    visible: boolean;
    onClose: () => void;
    sessions: ChatSession[];
    currentSessionId?: string;
    onSelectSession: (id: string) => void;
    onNewChat: () => void;
}

export const ChatHistoryBottomSheet: React.FC<ChatHistoryBottomSheetProps> = ({
    visible,
    onClose,
    sessions,
    currentSessionId,
    onSelectSession,
    onNewChat,
}) => {
    const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 0.4,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(translateY, {
                    toValue: 0,
                    damping: 25,
                    mass: 0.8,
                    stiffness: 250,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(translateY, {
                    toValue: SCREEN_HEIGHT,
                    duration: 250,
                    easing: Easing.in(Easing.ease),
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible, opacity, translateY]);

    const renderItem = ({ item }: { item: ChatSession }) => {
        const isActive = item.id === currentSessionId;
        return (
            <TouchableOpacity
                style={[styles.sessionItem, isActive && styles.sessionItemActive]}
                onPress={() => onSelectSession(item.id)}
                activeOpacity={0.7}
            >
                <View style={[styles.iconBox, isActive && styles.iconBoxActive]}>
                    <Ionicons
                        name="chatbubble-outline"
                        size={20}
                        color={isActive ? COLORS.orange : COLORS.grayText}
                    />
                </View>
                <View style={styles.sessionInfo}>
                    <Text
                        style={[styles.sessionTitle, isActive && styles.sessionTitleActive]}
                        numberOfLines={1}
                    >
                        {item.title}
                    </Text>
                    <Text style={styles.sessionDate}>{item.date}</Text>
                </View>
                {isActive && <Ionicons name="checkmark-circle" size={20} color={COLORS.orange} />}
            </TouchableOpacity>
        );
    };

    return (
        <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
            <View style={styles.overlayContainer}>
                {/* Backdrop Layer */}
                <Animated.View
                    style={[styles.backdrop, { opacity }]}
                    pointerEvents={visible ? 'auto' : 'none'}
                >
                    <TouchableOpacity
                        style={StyleSheet.absoluteFill}
                        activeOpacity={1}
                        onPress={onClose}
                    />
                </Animated.View>

                {/* Sheet Layer */}
                <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Lịch sử trò chuyện</Text>
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <Ionicons name="close" size={24} color={COLORS.black} />
                        </TouchableOpacity>
                    </View>

                    {/* New Chat Button */}
                    <TouchableOpacity
                        style={styles.newChatButton}
                        onPress={onNewChat}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="add" size={20} color={COLORS.white} />
                        <Text style={styles.newChatText}>Cuộc trò chuyện mới</Text>
                    </TouchableOpacity>

                    {/* Chat List */}
                    <View style={styles.listContainer}>
                        {sessions.length > 0 ? (
                            <FlatList
                                data={sessions}
                                keyExtractor={item => item.id}
                                renderItem={renderItem}
                                contentContainerStyle={styles.listContent}
                                showsVerticalScrollIndicator={false}
                            />
                        ) : (
                            <View style={styles.emptyContainer}>
                                <Ionicons
                                    name="chatbubbles-outline"
                                    size={48}
                                    color={COLORS.grayMedium}
                                />
                                <Text style={styles.emptyText}>Chưa có cuộc trò chuyện nào</Text>
                            </View>
                        )}
                    </View>

                    {/* Safe Area Padding */}
                    <View style={{ height: 34 }} />
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlayContainer: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#000',
    },
    sheet: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: SCREEN_HEIGHT * 0.8,
        minHeight: SCREEN_HEIGHT * 0.5,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.inputBorder,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.black,
    },
    closeButton: {
        padding: 4,
    },
    newChatButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.orange,
        borderRadius: 12,
        paddingVertical: 14,
        marginHorizontal: 20,
        marginTop: 20,
        marginBottom: 12,
        gap: 8,
    },
    newChatText: {
        color: COLORS.white,
        fontSize: 15,
        fontWeight: '600',
    },
    listContainer: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 24,
        gap: 12,
    },
    sessionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 16,
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.inputBorder,
    },
    sessionItemActive: {
        borderColor: COLORS.orange,
        backgroundColor: '#FFF3E0',
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: COLORS.inputBg,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    iconBoxActive: {
        backgroundColor: COLORS.white,
    },
    sessionInfo: {
        flex: 1,
        marginRight: 12,
    },
    sessionTitle: {
        fontSize: 15,
        fontWeight: '500',
        color: COLORS.black,
        marginBottom: 4,
    },
    sessionTitleActive: {
        color: COLORS.orange,
        fontWeight: '600',
    },
    sessionDate: {
        fontSize: 13,
        color: COLORS.grayText,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        marginTop: 12,
        fontSize: 15,
        color: COLORS.grayText,
    },
});
