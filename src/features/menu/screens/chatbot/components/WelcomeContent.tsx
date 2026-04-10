/**
 * @file WelcomeContent.tsx
 * @description Gemini-style welcome screen hiển thị khi chưa có message
 */
import React, { useRef, useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Easing,
    ActivityIndicator,
} from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { WELCOME_SUGGESTIONS } from '@/features/menu/screens/chatbot/constants';
import { useAppTheme } from '@/styles/themeContext';
import { zoneApi } from '@/features/farm/api/zoneApi';
import { pondApi } from '@/features/farm/api/pondApi';
import { pondCategoryApi } from '@/features/farm/api/pondCategoryApi';
import { Zone, PondData } from '@/features/farm/types/farm.types';
import { PondCategory } from '@/features/farm/types/pond-category.types';
import ChatBotIcon from '@/assets/Icon/IconMenu/ChatBotIcon.svg';
import { HeaderSection } from '@/shared/components/layout/HeaderSection';

interface WelcomeContentProps {
    userName?: string;
    onSuggestionPress: (text: string) => void;
}

export const WelcomeContent: React.FC<WelcomeContentProps> = ({ userName, onSuggestionPress }) => {
    const theme = useAppTheme();
    const styles = useWelcomeStyles(theme);

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

    // ── Staggered fade-in animations ──
    const greetingOpacity = useRef(new Animated.Value(0)).current;
    const greetingTranslateY = useRef(new Animated.Value(20)).current;
    const questionOpacity = useRef(new Animated.Value(0)).current;
    const questionTranslateY = useRef(new Animated.Value(20)).current;
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
            // 2. Question text
            Animated.parallel([
                Animated.timing(questionOpacity, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.timing(questionTranslateY, {
                    toValue: 0,
                    duration: 400,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
            ]),
            // 3. Suggestion chips (staggered)
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
    }, [greetingOpacity, greetingTranslateY, questionOpacity, questionTranslateY, chipAnimations]);

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

    // ── Sub-renders ──
    const renderHeader = () => {
        if (step === 'SUGGESTIONS') {
            return (
                <View>
                    <ChatBotIcon width={76} height={76} />
                    <Text style={[styles.greetingLarge, { textAlign: 'center' }]}>
                        Tôi có thể giúp gì cho bạn hôm nay?
                    </Text>
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
            <View style={{ gap: 16 }}>
                <ChatBotIcon width={76} height={76} />
                <HeaderSection
                    includeSafeArea={false}
                    title={title}
                    titleAlign="left"
                    titleStyle={styles.greetingLarge}
                    onBack={handleBack}
                    containerStyle={{
                        paddingHorizontal: 0,
                        paddingBottom: 0,
                        paddingTop: 0,
                        backgroundColor: 'transparent',
                    }}
                />
            </View>
        );
    };

    const renderContent = () => {
        if (step === 'SELECT_ZONE' || step === 'SELECT_CATEGORY' || step === 'SELECT_POND') {
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
                    <View style={styles.listContainer}>
                        {shouldShowLoader ? (
                            <ActivityIndicator
                                size="small"
                                color={theme.info}
                                style={{ padding: 20 }}
                            />
                        ) : data.length === 0 ? (
                            <Text style={styles.emptyText}>{emptyText}</Text>
                        ) : (
                            data.map((item: any) => (
                                <View key={item.id} style={styles.columnWrapper}>
                                    <TouchableOpacity
                                        style={[styles.suggestionChip, styles.onboardingChip]}
                                        onPress={() => onPress(item)}
                                    >
                                        <Text style={styles.suggestionText} numberOfLines={2}>
                                            {item.name}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            ))
                        )}
                    </View>
                </Animated.View>
            );
        }

        return (
            <View style={styles.suggestionsSection}>
                {WELCOME_SUGGESTIONS.map((item, index) => (
                    <Animated.View
                        key={item.id}
                        style={{
                            opacity: chipAnimations[index].opacity,
                            transform: [{ translateY: chipAnimations[index].translateY }],
                            width: '48%',
                        }}
                    >
                        <TouchableOpacity
                            style={[styles.suggestionChip, styles.onboardingChip]}
                            onPress={() => handleSuggestionPress(item)}
                            activeOpacity={0.7}
                        >
                            <Text
                                style={styles.suggestionText}
                                numberOfLines={2}
                                ellipsizeMode="tail"
                            >
                                {item.text}
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>
                ))}
            </View>
        );
    };

    return (
        <View style={styles.wrapper}>
            {/* ── Greeting Section ─── */}
            <View style={styles.greetingSection}>
                {step === 'SUGGESTIONS' && (
                    <Animated.View
                        style={[
                            styles.greetingRow,
                            {
                                opacity: greetingOpacity,
                                transform: [{ translateY: greetingTranslateY }],
                            },
                        ]}
                    >
                        <Text style={styles.greetingSmall}>
                            Xin chào{userName ? ` ${userName}` : ''}!
                        </Text>
                    </Animated.View>
                )}

                <Animated.View
                    style={{
                        opacity: questionOpacity,
                        transform: [{ translateY: questionTranslateY }],
                    }}
                >
                    {renderHeader()}
                </Animated.View>
            </View>

            {/* ── Dynamic Content ─── */}
            {renderContent()}
        </View>
    );
};

const useWelcomeStyles = (theme: any) =>
    React.useMemo(
        () =>
            StyleSheet.create({
                wrapper: { flex: 1, paddingHorizontal: 24, paddingTop: 48, paddingBottom: 24 },
                greetingSection: { marginBottom: 40 },
                greetingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
                greetingSmall: { fontSize: 16, fontWeight: '400', color: theme.textSecondary },
                greetingLarge: {
                    fontSize: 24,
                    fontWeight: '700',
                    color: theme.text,
                    letterSpacing: -0.3,
                },
                suggestionsSection: {
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    rowGap: 14,
                    width: '100%',
                },
                listContainer: {
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    rowGap: 14,
                    width: '100%',
                    paddingBottom: 20,
                },
                columnWrapper: { width: '48%' },
                suggestionChip: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 14,
                    paddingHorizontal: 12,
                    borderRadius: 24,
                    borderWidth: 1,
                    borderColor: theme.border,
                    backgroundColor: theme.backgroundPrimary,
                    width: '100%',
                },
                onboardingChip: { paddingVertical: 14, paddingHorizontal: 12 },
                suggestionText: {
                    fontSize: 13,
                    fontWeight: '500',
                    color: theme.text,
                    textAlign: 'center',
                },
                loadingContainer: {
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 40,
                },
                loadingText: { marginTop: 12, fontSize: 14, color: theme.textSecondary },
                emptyText: {
                    fontSize: 14,
                    color: theme.textSecondary,
                    fontStyle: 'italic',
                    paddingVertical: 20,
                    width: '100%',
                    textAlign: 'center',
                },
            }),
        [theme]
    );
