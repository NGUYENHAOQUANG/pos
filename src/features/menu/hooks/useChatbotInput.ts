import { useState, useCallback, useRef, useEffect } from 'react';
import { ScrollView, LayoutAnimation } from 'react-native';
import Voice, {
    SpeechResultsEvent,
    SpeechErrorEvent,
    SpeechVolumeChangeEvent,
} from '@dev-amirzubair/react-native-voice';
import Toast from 'react-native-toast-message';
import { zoneApi } from '@/features/farm/api/zoneApi';
import { pondApi } from '@/features/farm/api/pondApi';
import { pondCategoryApi } from '@/features/farm/api/pondCategoryApi';
import { Zone, PondData } from '@/features/farm/types/farm.types';
import { PondCategory } from '@/features/farm/types/pond-category.types';
import { chatbotState } from '@/features/menu/services/chatbotState';

// ── Types ──
export type ActionIntent = 'POND_STATUS' | 'DEVICE_CONTROL' | 'REPORTS' | 'ALERTS';
export type SelectionStep = 'SUGGESTIONS' | 'SELECT_ZONE' | 'SELECT_CATEGORY' | 'SELECT_POND';

export const ZONE_FLOW_MAP: Record<string, ActionIntent> = {
    'Hiện có cảnh báo nào không?': 'ALERTS',
};

interface UseChatbotInputParams {
    onSend: (text: string) => void;
    onQuickAction: (text: string) => void;
    /** Incremented to force-reset all input state */
    resetKey?: number;
}

export const useChatbotInput = ({ onSend, onQuickAction, resetKey }: UseChatbotInputParams) => {
    const [text, setText] = useState('');

    // ── States for Selection Flow ──
    const [step, setStep] = useState<SelectionStep>('SUGGESTIONS');
    const [actionIntent, setActionIntent] = useState<ActionIntent | null>(null);
    const [zones, setZones] = useState<Zone[]>([]);
    const [categories, setCategories] = useState<PondCategory[]>([]);
    const [ponds, setPonds] = useState<PondData[]>([]);
    const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<PondCategory | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [volume, setVolume] = useState(0);

    // Persistent zone chip — survives message sends
    const [activeZoneName, setActiveZoneName] = useState<string | null>(
        chatbotState.selectedZoneName
    );
    // All available zones — for mandatory zone logic
    const [allZones, setAllZones] = useState<Zone[]>([]);
    // Whether to show zone picker inline (when user clears chip)
    const [showZonePicker, setShowZonePicker] = useState(false);

    const scrollViewRef = useRef<ScrollView>(null);
    const previousTextRef = useRef<string>('');

    // ── Fetch zones on mount + auto-select if only 1 zone ──
    useEffect(() => {
        zoneApi
            .getZones()
            .then(fetchedZones => {
                const zoneList = fetchedZones || [];
                setAllZones(zoneList);
                if (zoneList.length === 1 && !chatbotState.selectedZoneId) {
                    // Auto-select if only 1 zone
                    const zone = zoneList[0];
                    chatbotState.selectedZoneId = zone.id;
                    chatbotState.selectedZoneName = zone.name;
                    setActiveZoneName(zone.name);
                } else if (zoneList.length > 1 && !chatbotState.selectedZoneId) {
                    // Must pick a zone first
                    setShowZonePicker(true);
                }
            })
            .catch(err => console.error('Error fetching zones:', err));
    }, []);

    // ── Reset all state when resetKey changes (new chat) ──
    useEffect(() => {
        if (resetKey === undefined || resetKey === 0) return;
        setText('');
        setStep('SUGGESTIONS');
        setActionIntent(null);
        setZones([]);
        setCategories([]);
        setPonds([]);
        setSelectedZone(null);
        setSelectedCategory(null);
        setIsLoading(false);
        setShowZonePicker(false);
        // Clear global chatbot state
        chatbotState.selectedZoneId = null;
        chatbotState.selectedZoneName = null;
        setActiveZoneName(null);
        // Re-check if auto-select is needed
        if (allZones.length === 1) {
            const zone = allZones[0];
            chatbotState.selectedZoneId = zone.id;
            chatbotState.selectedZoneName = zone.name;
            setActiveZoneName(zone.name);
        } else if (allZones.length > 1) {
            setShowZonePicker(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resetKey]);

    // Sync zone chip when zone is selected externally (e.g. from WelcomeContent)
    useEffect(() => {
        const interval = setInterval(() => {
            const stateZoneName = chatbotState.selectedZoneName;
            if (stateZoneName !== activeZoneName) {
                setActiveZoneName(stateZoneName);
            }
        }, 500);
        return () => clearInterval(interval);
    }, [activeZoneName]);

    // ── Voice Recognition Setup ──
    useEffect(() => {
        Voice.onSpeechStart = () => setIsListening(true);
        Voice.onSpeechEnd = () => setIsListening(false);
        Voice.onSpeechError = (e: SpeechErrorEvent) => {
            console.error('Speech error:', e.error);
            setIsListening(false);
        };
        Voice.onSpeechResults = (e: SpeechResultsEvent) => {
            if (e.value && e.value.length > 0) {
                const prefix = previousTextRef.current ? previousTextRef.current + ' ' : '';
                setText(prefix + e.value[0]);
            }
        };
        Voice.onSpeechPartialResults = (e: SpeechResultsEvent) => {
            if (e.value && e.value.length > 0) {
                const prefix = previousTextRef.current ? previousTextRef.current + ' ' : '';
                setText(prefix + e.value[0]);
            }
        };
        Voice.onSpeechVolumeChanged = (e: SpeechVolumeChangeEvent) => {
            if (e.value !== undefined) {
                setVolume(e.value);
            }
        };

        return () => {
            Voice.destroy().then(Voice.removeAllListeners);
        };
    }, []);

    // ── Helpers ──
    const animateLayout = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    };

    const getActionPrefix = () => {
        switch (actionIntent) {
            case 'DEVICE_CONTROL':
                return 'Điều khiển thiết bị';
            case 'REPORTS':
                return 'Báo cáo tổng quan';
            default:
                return 'Xem thông số';
        }
    };

    const toggleListening = async () => {
        try {
            if (isListening) {
                await Voice.stop();
                setIsListening(false);
            } else {
                previousTextRef.current = text.trim();
                await Voice.start('vi-VN');
            }
        } catch (e) {
            console.error('Lỗi khi bật/tắt mic:', e);
        }
    };

    // ── Flow Handlers ──
    const handleInitialChipPress = (chipText: string) => {
        const intent = ZONE_FLOW_MAP[chipText];
        if (intent) {
            animateLayout();
            setActionIntent(intent);
            setStep('SELECT_ZONE');
            setIsLoading(true);
            zoneApi
                .getZones()
                .then(fetchedZones => {
                    setZones(fetchedZones || []);
                    setIsLoading(false);
                })
                .catch(error => {
                    console.error('Error fetching zones:', error);
                    setIsLoading(false);
                });
            scrollViewRef.current?.scrollTo({ x: 0, animated: true });
        } else {
            onQuickAction(chipText);
        }
    };

    const handleZoneSelect = async (zone: Zone) => {
        animateLayout();
        setSelectedZone(zone);
        chatbotState.selectedZoneId = zone.id;
        chatbotState.selectedZoneName = zone.name;
        setActiveZoneName(zone.name);

        // ALERTS intent: send directly after zone selection, no category/pond needed
        if (actionIntent === 'ALERTS') {
            onQuickAction(`Hiện có cảnh báo nào không? Trại ${zone.name}`);
            resetFlow();
            return;
        }

        setStep('SELECT_CATEGORY');
        setIsLoading(true);
        try {
            const res = await pondCategoryApi.getPondCategories();
            const fetchedCategories =
                (res as unknown as { items: PondCategory[] })?.items ||
                (Array.isArray(res) ? res : []) ||
                [];
            setCategories(fetchedCategories);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setIsLoading(false);
        }
        scrollViewRef.current?.scrollTo({ x: 0, animated: true });
    };

    const handleCategorySelect = async (category: PondCategory & { id: string }) => {
        if (!selectedZone) return;

        if (category.id === 'all_categories') {
            onQuickAction(`${getActionPrefix()} tất cả ao thuộc trại ${selectedZone.name}`);
            resetFlow();
            return;
        }

        animateLayout();
        setSelectedCategory(category);
        setStep('SELECT_POND');
        setIsLoading(true);
        try {
            const res = await pondApi.getPondsByZone(selectedZone.id, {
                PondCategoryId: category.id,
            });
            const fetchedPonds =
                (res as unknown as { items: PondData[] })?.items ||
                (Array.isArray(res) ? res : []) ||
                [];
            setPonds(fetchedPonds);
        } catch (error) {
            console.error('Error fetching ponds:', error);
        } finally {
            setIsLoading(false);
        }
        scrollViewRef.current?.scrollTo({ x: 0, animated: true });
    };

    const handlePondSelect = (pond: PondData & { id: string }) => {
        if (selectedZone) {
            if (pond.id === 'all_ponds' && selectedCategory) {
                onQuickAction(
                    `${getActionPrefix()} tất cả ao loại ${selectedCategory.name} thuộc trại ${
                        selectedZone.name
                    }`
                );
            } else {
                onQuickAction(
                    `${getActionPrefix()} ao ${pond.name} thuộc trại ${selectedZone.name}`
                );
            }
            resetFlow();
        }
    };

    const handleBack = () => {
        animateLayout();
        if (step === 'SELECT_POND') {
            setStep('SELECT_CATEGORY');
        } else if (step === 'SELECT_CATEGORY') {
            setStep('SELECT_ZONE');
            setSelectedZone(null);
            chatbotState.selectedZoneId = null;
            chatbotState.selectedZoneName = null;
            setSelectedCategory(null);
        } else if (step === 'SELECT_ZONE') {
            setStep('SUGGESTIONS');
            setActionIntent(null);
        }
        scrollViewRef.current?.scrollTo({ x: 0, animated: true });
    };

    // Clear selected zone chip + chatbotState
    const clearSelectedZone = useCallback(() => {
        if (allZones.length <= 1) return;
        animateLayout();
        setSelectedZone(null);
        setActiveZoneName(null);
        chatbotState.selectedZoneId = null;
        chatbotState.selectedZoneName = null;
        setShowZonePicker(true);
    }, [allZones.length]);

    // Handle zone pick from inline picker
    const handleZonePick = useCallback((zone: Zone) => {
        animateLayout();
        chatbotState.selectedZoneId = zone.id;
        chatbotState.selectedZoneName = zone.name;
        setActiveZoneName(zone.name);
        setShowZonePicker(false);
    }, []);

    const resetFlow = useCallback(() => {
        animateLayout();
        setStep('SUGGESTIONS');
        setZones([]);
        setCategories([]);
        setPonds([]);
        setSelectedZone(null);
        setSelectedCategory(null);
        setActionIntent(null);
    }, []);

    // Zone is required before sending
    const isZoneSelected = !!chatbotState.selectedZoneId;

    const handleSend = useCallback(() => {
        if (text.trim().length === 0) return;
        if (!isZoneSelected) {
            Toast.show({
                type: 'error',
                text1: 'Vui lòng chọn trại trước khi gửi',
            });
            return;
        }
        onSend(text.trim());
        setText('');
        resetFlow();
    }, [text, onSend, resetFlow, isZoneSelected]);

    const hasText = text.trim().length > 0;

    return {
        // State
        text,
        setText,
        step,
        zones,
        categories,
        ponds,
        isLoading,
        isListening,
        volume,
        activeZoneName,
        allZones,
        showZonePicker,
        hasText,
        isZoneSelected,

        // Refs
        scrollViewRef,

        // Handlers
        toggleListening,
        handleInitialChipPress,
        handleZoneSelect,
        handleCategorySelect,
        handlePondSelect,
        handleBack,
        clearSelectedZone,
        handleZonePick,
        handleSend,
    };
};
