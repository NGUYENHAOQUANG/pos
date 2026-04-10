/**
 * @file QuickReplyBottomSheet.tsx
 * @description Bottom sheet hiển thị danh sách quick reply suggestions
 */
import React, { useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Modal,
    Animated,
    Dimensions,
    ActivityIndicator,
    ScrollView,
    Easing,
} from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import CloseIcon from '@/assets/Icon/CloseOutlined.svg';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, QUICK_REPLIES } from '@/features/menu/screens/chatbot/constants';
import { zoneApi } from '@/features/farm/api/zoneApi';
import { pondApi } from '@/features/farm/api/pondApi';
import { pondCategoryApi } from '@/features/farm/api/pondCategoryApi';
import { Zone, PondData } from '@/features/farm/types/farm.types';
import { PondCategory } from '@/features/farm/types/pond-category.types';

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
    const slideAnimTranslateX = React.useRef(new Animated.Value(50)).current;
    const slideAnimOpacity = React.useRef(new Animated.Value(0)).current;

    // ── States for Onboarding Flow ──
    const [step, setStep] = useState<
        'SUGGESTIONS' | 'SELECT_ZONE' | 'SELECT_CATEGORY' | 'SELECT_POND'
    >('SUGGESTIONS');
    const [zones, setZones] = useState<Zone[]>([]);
    const [categories, setCategories] = useState<PondCategory[]>([]);
    const [ponds, setPonds] = useState<PondData[]>([]);
    const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<PondCategory | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [actionIntent, setActionIntent] = useState<
        'POND_STATUS' | 'DEVICE_CONTROL' | 'REPORTS' | null
    >(null);

    useEffect(() => {
        if (visible) {
            setStep('SUGGESTIONS');
            setSelectedZone(null);
            setSelectedCategory(null);
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

    // ── Onboarding Slide Animation ──
    useEffect(() => {
        if (!isLoading && step !== 'SUGGESTIONS') {
            slideAnimTranslateX.setValue(50);
            slideAnimOpacity.setValue(0);
            Animated.parallel([
                Animated.timing(slideAnimTranslateX, {
                    toValue: 0,
                    duration: 300,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnimOpacity, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [step, isLoading, slideAnimTranslateX, slideAnimOpacity]);

    const handleSuggestionPress = async (text: string) => {
        if (
            text === 'Xem thông số Trại/Ao' ||
            text === 'Điều khiển thiết bị' ||
            text === 'Báo cáo tổng quan'
        ) {
            if (text === 'Xem thông số Trại/Ao') setActionIntent('POND_STATUS');
            else if (text === 'Điều khiển thiết bị') setActionIntent('DEVICE_CONTROL');
            else setActionIntent('REPORTS');

            setStep('SELECT_ZONE');
            setIsLoading(true);
            try {
                const fetchedZones = await zoneApi.getZones();
                setZones(fetchedZones || []);
            } catch (error) {
                console.error('Error fetching zones:', error);
            } finally {
                setIsLoading(false);
            }
        } else {
            onSelect(text);
            onClose();
        }
    };

    const handleZonePress = async (zone: Zone) => {
        setSelectedZone(zone);
        setStep('SELECT_CATEGORY');
        setIsLoading(true);
        try {
            const res = await pondCategoryApi.getPondCategories();
            const fetchedCategories =
                (res as any)?.items ||
                (res as any)?.data?.items ||
                (Array.isArray(res) ? res : []) ||
                [];
            setCategories(fetchedCategories);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCategoryPress = async (category: PondCategory | any) => {
        if (!selectedZone) return;

        if (category.id === 'all_categories') {
            const prefix =
                actionIntent === 'DEVICE_CONTROL'
                    ? 'Điều khiển thiết bị'
                    : actionIntent === 'REPORTS'
                    ? 'Báo cáo tổng quan'
                    : 'Xem thông số';
            onSelect(`${prefix} tất cả ao thuộc trại ${selectedZone.name}`);
            onClose();
            return;
        }

        setSelectedCategory(category);
        setStep('SELECT_POND');
        setIsLoading(true);
        try {
            const res = await pondApi.getPondsByZone(selectedZone.id, {
                PondCategoryId: category.id,
            });
            const fetchedPonds =
                (res as any)?.items ||
                (res as any)?.data?.items ||
                (Array.isArray(res) ? res : []) ||
                [];
            setPonds(fetchedPonds);
        } catch (error) {
            console.error('Error fetching ponds:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePondPress = (pond: PondData | any) => {
        if (selectedZone) {
            if (pond.id === 'all_ponds' && selectedCategory) {
                const prefix =
                    actionIntent === 'DEVICE_CONTROL'
                        ? 'Điều khiển thiết bị'
                        : actionIntent === 'REPORTS'
                        ? 'Báo cáo tổng quan'
                        : 'Xem thông số';
                onSelect(
                    `${prefix} tất cả ao loại ${selectedCategory.name} thuộc trại ${selectedZone.name}`
                );
                onClose();
                return;
            }

            if (actionIntent === 'POND_STATUS') {
                onSelect(`Xem thông số ao ${pond.name} thuộc trại ${selectedZone.name}`);
            } else if (actionIntent === 'DEVICE_CONTROL') {
                onSelect(`Điều khiển thiết bị ao ${pond.name} thuộc trại ${selectedZone.name}`);
            } else if (actionIntent === 'REPORTS') {
                onSelect(`Báo cáo tổng quan ao ${pond.name} thuộc trại ${selectedZone.name}`);
            }
            onClose();
        }
    };

    const handleBack = () => {
        if (step === 'SELECT_POND') {
            setStep('SELECT_CATEGORY');
        } else if (step === 'SELECT_CATEGORY') {
            setStep('SELECT_ZONE');
            setSelectedZone(null);
            setSelectedCategory(null);
        } else if (step === 'SELECT_ZONE') {
            setStep('SUGGESTIONS');
            setSelectedZone(null);
        }
    };

    const renderHeader = () => {
        if (step === 'SUGGESTIONS') {
            return (
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
            );
        }

        const title =
            step === 'SELECT_ZONE'
                ? 'Chọn trại nuôi'
                : step === 'SELECT_CATEGORY'
                ? 'Chọn loại ao'
                : `Chọn ao trong ${selectedZone?.name}`;

        return (
            <View style={[sheetStyles.header, { justifyContent: 'flex-start', gap: 12 }]}>
                <TouchableOpacity
                    onPress={handleBack}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name="arrow-back" size={24} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={sheetStyles.title}>{title}</Text>
                <View style={{ flex: 1 }} />
                <TouchableOpacity
                    onPress={onClose}
                    style={sheetStyles.closeButton}
                    activeOpacity={0.7}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <CloseIcon width={20} height={20} />
                </TouchableOpacity>
            </View>
        );
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <View style={sheetStyles.loadingContainer}>
                    <ActivityIndicator size="small" color={COLORS.blue} />
                    <Text style={sheetStyles.loadingText}>Đang tải dữ liệu...</Text>
                </View>
            );
        }

        if (step === 'SELECT_ZONE' || step === 'SELECT_CATEGORY' || step === 'SELECT_POND') {
            let data: any[] = [];
            let emptyText = '';
            let onPress: (item: any) => void = () => {};

            if (step === 'SELECT_ZONE') {
                data = zones;
                emptyText = 'Không có trại nuôi nào.';
                onPress = handleZonePress;
            } else if (step === 'SELECT_CATEGORY') {
                data =
                    categories.length > 0
                        ? [...categories, { id: 'all_categories', name: 'Tất cả ao' }]
                        : [];
                emptyText = 'Không có loại ao nào.';
                onPress = handleCategoryPress;
            } else {
                data = ponds.length > 0 ? [...ponds, { id: 'all_ponds', name: 'Tất cả ao' }] : [];
                emptyText = 'Không có ao nào trong trại này.';
                onPress = handlePondPress;
            }

            return (
                <Animated.View
                    style={{
                        width: '100%',
                        opacity: slideAnimOpacity,
                        transform: [{ translateX: slideAnimTranslateX }],
                    }}
                >
                    <View style={sheetStyles.content}>
                        {data.length === 0 ? (
                            <Text style={sheetStyles.emptyText}>{emptyText}</Text>
                        ) : (
                            data.map((item: any) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={sheetStyles.itemRow}
                                    onPress={() => onPress(item)}
                                    activeOpacity={0.6}
                                >
                                    <Text style={sheetStyles.itemText}>{item.name}</Text>
                                </TouchableOpacity>
                            ))
                        )}
                    </View>
                </Animated.View>
            );
        }

        return (
            <View style={sheetStyles.content}>
                {QUICK_REPLIES.map(item => (
                    <TouchableOpacity
                        key={item.id}
                        style={sheetStyles.itemRow}
                        onPress={() => handleSuggestionPress(item.text)}
                        activeOpacity={0.6}
                    >
                        <Text style={sheetStyles.itemText}>{item.text}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        );
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
                            {renderHeader()}
                            <ScrollView bounces={false} style={{ maxHeight: SCREEN_HEIGHT * 0.5 }}>
                                {renderContent()}
                            </ScrollView>
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
        gap: 0, // removed gap since itemRow has padding
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
    loadingContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 30 },
    loadingText: { marginTop: 8, fontSize: 13, color: COLORS.grayText },
    emptyText: {
        fontSize: 13,
        color: COLORS.grayText,
        fontStyle: 'italic',
        paddingVertical: 10,
        textAlign: 'center',
    },
});
