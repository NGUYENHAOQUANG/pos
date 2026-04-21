/**
 * @file WelcomeContent.tsx
 * @description Welcome screen with new layout: greeting + avatar + suggestion cards.
 * Light-mode only — no dark mode support.
 */
import React, { useRef, useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Easing,
    ActivityIndicator,
    LayoutAnimation,
} from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { WELCOME_SUGGESTIONS } from '@/features/menu/constants/chatbot.constants';
import { colors } from '@/styles/colors';
import { borderRadius } from '@/styles';
import { zoneApi } from '@/features/farm/api/zoneApi';
import { pondApi } from '@/features/farm/api/pondApi';
import { pondCategoryApi } from '@/features/farm/api/pondCategoryApi';
import { Zone, PondData } from '@/features/farm/types/farm.types';
import { PondCategory } from '@/features/farm/types/pond-category.types';
import { ChatbotAvatar } from '@/features/menu/animation/ChatbotAvatar';
import { chatbotState } from '@/features/menu/services/chatbotState';
import { AnimatedBgTipCard } from '@/features/menu/components/chatbot/AnimatedBgTipCard';
import ArrowRightIcon from '@/assets/Icon/ArrowRight.svg';

/** Staggered fade-in + slide-up wrapper for list items */
const STAGGER_DELAY = 60;
const StaggeredCard: React.FC<{ index: number; children: React.ReactNode }> = ({
    index,
    children,
}) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(12)).current;

    useEffect(() => {
        const delay = index * STAGGER_DELAY;
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 1,
                duration: 300,
                delay,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration: 300,
                delay,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
        ]).start();
    }, [index, opacity, translateY]);

    return (
        <Animated.View style={{ opacity, transform: [{ translateY }] }}>{children}</Animated.View>
    );
};

/**
 * Get time-based greeting in Vietnamese
 */
const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
};

interface WelcomeContentProps {
    userName?: string;
    onSuggestionPress: (text: string) => void;
}

export const WelcomeContent: React.FC<WelcomeContentProps> = ({ userName, onSuggestionPress }) => {
    // ── States for Onboarding Flow ──
    const [step, setStep] = useState<
        'SUGGESTIONS' | 'SELECT_ZONE' | 'SELECT_CATEGORY' | 'SELECT_POND'
    >('SUGGESTIONS');
    const [zones, setZones] = useState<Zone[]>([]);
    const [categories, setCategories] = useState<PondCategory[]>([]);
    const [ponds, setPonds] = useState<PondData[]>([]);
    const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<PondCategory | null>(null);
    const [isFetchingPonds, setIsFetchingPonds] = useState(false);
    const [actionIntent, setActionIntent] = useState<
        'POND_STATUS' | 'DEVICE_CONTROL' | 'REPORTS' | null
    >(null);

    // Sync: when zone is cleared from input chip → reset welcome flow
    // Only reset if we're past zone selection (category/pond requires a zone)
    useEffect(() => {
        const interval = setInterval(() => {
            const needsZone = step === 'SELECT_CATEGORY' || step === 'SELECT_POND';
            if (!chatbotState.selectedZoneId && needsZone) {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setStep('SUGGESTIONS');
                setSelectedZone(null);
                setSelectedCategory(null);
                setActionIntent(null);
            }
        }, 500);
        return () => clearInterval(interval);
    }, [step]);

    // ── Staggered fade-in animations ──
    const greetingOpacity = useRef(new Animated.Value(0)).current;
    const greetingTranslateY = useRef(new Animated.Value(20)).current;
    const subtitleOpacity = useRef(new Animated.Value(0)).current;
    const subtitleTranslateY = useRef(new Animated.Value(15)).current;
    const chipAnimations = useRef(
        WELCOME_SUGGESTIONS.map(() => ({
            opacity: new Animated.Value(0),
            translateY: new Animated.Value(15),
        }))
    ).current;

    const slideAnimTranslateX = useRef(new Animated.Value(50)).current;
    const slideAnimOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.sequence([
            // 1. Greeting text
            Animated.parallel([
                Animated.timing(greetingOpacity, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(greetingTranslateY, {
                    toValue: 0,
                    duration: 500,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
            ]),
            // 2. Subtitle text
            Animated.parallel([
                Animated.timing(subtitleOpacity, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.timing(subtitleTranslateY, {
                    toValue: 0,
                    duration: 400,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
            ]),
            // 3. Suggestion cards (staggered)
            Animated.stagger(
                100,
                chipAnimations.map(anim =>
                    Animated.parallel([
                        Animated.timing(anim.opacity, {
                            toValue: 1,
                            duration: 350,
                            useNativeDriver: true,
                        }),
                        Animated.timing(anim.translateY, {
                            toValue: 0,
                            duration: 350,
                            easing: Easing.out(Easing.cubic),
                            useNativeDriver: true,
                        }),
                    ])
                )
            ),
        ]).start();
    }, [greetingOpacity, greetingTranslateY, subtitleOpacity, subtitleTranslateY, chipAnimations]);

    // ── Onboarding Slide Animation ──
    useEffect(() => {
        if (step !== 'SUGGESTIONS') {
            slideAnimTranslateX.setValue(50);
            slideAnimOpacity.setValue(0);
            requestAnimationFrame(() => {
                Animated.parallel([
                    Animated.timing(slideAnimTranslateX, {
                        toValue: 0,
                        duration: 300,
                        easing: Easing.out(Easing.cubic),
                        useNativeDriver: false,
                    }),
                    Animated.timing(slideAnimOpacity, {
                        toValue: 1,
                        duration: 250,
                        useNativeDriver: false,
                    }),
                ]).start();
            });
        }
    }, [step, slideAnimTranslateX, slideAnimOpacity]);

    // ── Logic ──
    const handleSuggestionPress = async (item: (typeof WELCOME_SUGGESTIONS)[0]) => {
        if (
            item.text === 'Xem thông số Trại/Ao' ||
            item.text === 'Điều khiển thiết bị' ||
            item.text === 'Báo cáo tổng quan'
        ) {
            if (item.text === 'Xem thông số Trại/Ao') setActionIntent('POND_STATUS');
            else if (item.text === 'Điều khiển thiết bị') setActionIntent('DEVICE_CONTROL');
            else setActionIntent('REPORTS');

            setStep('SELECT_ZONE');
            if (zones.length === 0) {
                try {
                    const fetchedZones = await zoneApi.getZones();
                    setZones(fetchedZones || []);
                } catch (error) {
                    console.error('Error fetching zones:', error);
                }
            }
        } else {
            onSuggestionPress(item.text);
        }
    };

    const handleZonePress = async (zone: Zone) => {
        setSelectedZone(zone);
        // Sync to chatbotState so API sends correct farm_id
        chatbotState.selectedZoneId = zone.id;
        chatbotState.selectedZoneName = zone.name;
        setStep('SELECT_CATEGORY');
        if (categories.length === 0) {
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
            }
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
            onSuggestionPress(`${prefix} tất cả ao thuộc trại ${selectedZone.name}`);
            return;
        }

        setSelectedCategory(category);
        setStep('SELECT_POND');
        setPonds([]); // Clear old ponds to display loading cleanly
        setIsFetchingPonds(true);
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
            setIsFetchingPonds(false);
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
                onSuggestionPress(
                    `${prefix} tất cả ao loại ${selectedCategory.name} thuộc trại ${selectedZone.name}`
                );
                return;
            }

            if (actionIntent === 'POND_STATUS') {
                onSuggestionPress(`Xem thông số ao ${pond.name} thuộc trại ${selectedZone.name}`);
            } else if (actionIntent === 'DEVICE_CONTROL') {
                onSuggestionPress(
                    `Điều khiển thiết bị ao ${pond.name} thuộc trại ${selectedZone.name}`
                );
            } else if (actionIntent === 'REPORTS') {
                onSuggestionPress(
                    `Báo cáo tổng quan ao ${pond.name} thuộc trại ${selectedZone.name}`
                );
            }
        }
    };

    // ── Sub-renders ──
    const renderOnboardingHeader = () => {
        const title =
            step === 'SELECT_ZONE'
                ? 'Chọn trại nuôi'
                : step === 'SELECT_CATEGORY'
                ? 'Chọn loại ao'
                : `Chọn ao trong ${selectedZone?.name}`;

        return (
            <View style={{ marginBottom: 16 }}>
                <Text style={styles.onboardingTitle}>{title}</Text>
            </View>
        );
    };

    const renderOnboardingContent = () => {
        let data: any[] = [];
        let emptyText = '';
        let onPress: (item: any) => void = () => {};
        let shouldShowLoader = false;

        if (step === 'SELECT_ZONE') {
            data = zones;
            emptyText = 'Không có trại nuôi nào.';
            onPress = handleZonePress;
            shouldShowLoader = zones.length === 0;
        } else if (step === 'SELECT_CATEGORY') {
            data =
                categories.length > 0
                    ? [...categories, { id: 'all_categories', name: 'Tất cả ao' }]
                    : [];
            emptyText = 'Không có loại ao nào.';
            onPress = handleCategoryPress;
            shouldShowLoader = categories.length === 0;
        } else {
            data = ponds.length > 0 ? [...ponds, { id: 'all_ponds', name: 'Tất cả ao' }] : [];
            emptyText = 'Không có ao nào trong trại này.';
            onPress = handlePondPress;
            shouldShowLoader = isFetchingPonds;
        }

        return (
            <Animated.View
                style={{
                    width: '100%',
                    opacity: slideAnimOpacity,
                    transform: [{ translateX: slideAnimTranslateX }],
                }}
            >
                <View style={{ width: '100%', paddingBottom: 20 }}>
                    {shouldShowLoader ? (
                        <ActivityIndicator
                            size="small"
                            color={colors.info}
                            style={{ padding: 20 }}
                        />
                    ) : data.length === 0 ? (
                        <Text style={styles.emptyText}>{emptyText}</Text>
                    ) : (
                        <View style={[styles.cardList, { width: '100%' }]}>
                            {data.map((item: any, index: number) => (
                                <StaggeredCard key={item.id} index={index}>
                                    <TouchableOpacity
                                        style={styles.suggestionCard}
                                        onPress={() => onPress(item)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.suggestionCardText} numberOfLines={2}>
                                            {item.name}
                                        </Text>
                                        <View style={styles.arrowButton}>
                                            <ArrowRightIcon
                                                width={16}
                                                height={16}
                                                color={colors.text}
                                            />
                                        </View>
                                    </TouchableOpacity>
                                </StaggeredCard>
                            ))}
                        </View>
                    )}
                </View>
            </Animated.View>
        );
    };

    // ── Onboarding Flow (Zone → Category → Pond) ──
    if (step !== 'SUGGESTIONS') {
        return (
            <View style={styles.wrapper}>
                <View style={[styles.outerCard, { paddingBottom: 16 }]}>
                    <View style={styles.greetingSection}>{renderOnboardingHeader()}</View>
                    {renderOnboardingContent()}
                </View>
            </View>
        );
    }
    // ── Main Welcome Layout ──
    return (
        <View style={styles.wrapper}>
            <View style={styles.outerCard}>
                {/* Greeting row: text left + avatar right */}
                <Animated.View
                    style={[
                        styles.greetingSection,
                        {
                            opacity: greetingOpacity,
                            transform: [{ translateY: greetingTranslateY }],
                        },
                    ]}
                >
                    <View style={styles.greetingRow}>
                        <View style={styles.greetingTextContainer}>
                            <Text style={styles.greetingLarge}>
                                {getGreeting()},{'\n'}
                                {userName || 'bạn'}!
                            </Text>
                        </View>
                        <ChatbotAvatar size={64} animated />
                    </View>

                    {/* Subtitle */}
                    <Animated.View
                        style={{
                            opacity: subtitleOpacity,
                            transform: [{ translateY: subtitleTranslateY }],
                        }}
                    >
                        <Text style={styles.subtitle}>Bạn cần hỗ trợ gì?</Text>
                    </Animated.View>
                </Animated.View>

                {/* Suggestion cards — vertical list */}
                <View style={styles.cardList}>
                    {WELCOME_SUGGESTIONS.map((item, index) => (
                        <Animated.View
                            key={item.id}
                            style={{
                                opacity: chipAnimations[index].opacity,
                                transform: [{ translateY: chipAnimations[index].translateY }],
                            }}
                        >
                            <TouchableOpacity
                                style={styles.suggestionCard}
                                onPress={() => handleSuggestionPress(item)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.suggestionCardText}>{item.text}</Text>
                                <View style={styles.arrowButton}>
                                    <ArrowRightIcon width={16} height={16} color={colors.text} />
                                </View>
                            </TouchableOpacity>
                        </Animated.View>
                    ))}
                </View>
            </View>

            {/* Animated Background Tip Card */}
            <AnimatedBgTipCard />
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        paddingHorizontal: 16,
        paddingBottom: 24,
    },
    outerCard: {
        backgroundColor: colors.chatbot.glassBg,
        borderWidth: 1,
        borderColor: colors.chatbot.glassBorder,
        borderRadius: borderRadius.md,
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.full,
        backgroundColor: colors.chatbot.glassButtonBg,
        borderWidth: 1,
        borderColor: colors.chatbot.glassButtonBorder,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    greetingSection: {
        marginBottom: 12,
    },
    greetingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    greetingTextContainer: {
        flex: 1,
        marginRight: 16,
    },
    greetingLarge: {
        fontSize: 20,
        fontWeight: '600',
        color: colors.text,
    },
    subtitle: {
        fontSize: 14,
        fontWeight: '400',
        color: colors.textSecondary,
        marginTop: 8,
    },
    onboardingTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: colors.text,
    },

    // Suggestion cards — vertical list
    cardList: {
        gap: 8,
    },
    suggestionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: borderRadius.md,
        backgroundColor: colors.chatbot.glassButtonBg,
        borderWidth: 1,
        borderColor: colors.chatbot.glassBorder,
    },
    suggestionCardText: {
        fontSize: 14,
        fontWeight: '400',
        color: colors.text,
        flex: 1,
    },
    arrowButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.chatbot.glassBg,
        borderWidth: 1,
        borderColor: colors.chatbot.glassBorder,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Onboarding flow styles
    emptyText: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '400',
        paddingVertical: 20,
        width: '100%',
        textAlign: 'center',
    },
});
