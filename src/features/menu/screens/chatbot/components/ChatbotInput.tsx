import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { TextInput } from '@/shared/components/typography/AppTextInput';
import { Text } from '@/shared/components/typography/Text';
import MicrophoneIcon from '@/assets/Icon/IconChatBot/Microphone.svg';
import SendIcon from '@/assets/Icon/IconChatBot/Send.svg';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '@/styles/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useKeyboard } from '@/shared/hooks/useKeyboard';
import { AudioWaveform } from '@/features/menu/screens/chatbot/components/AudioWaveform';
import { RainbowGlowBorder } from '@/features/menu/screens/chatbot/components/RainbowGlowBorder';
import { QuickSuggestionChips } from '@/features/menu/screens/chatbot/components/QuickSuggestionChips';
import { useChatbotInput } from '@/features/menu/screens/chatbot/hooks/useChatbotInput';
import { useInputStyles } from '@/features/menu/screens/chatbot/styles/chatbotInputStyles';

interface ChatbotInputToolbarProps {
    onSend: (text: string) => void;
    onQuickAction: (text: string) => void;
    /** Incremented to force-reset all input state (zone chip, text, flow) */
    resetKey?: number;
}

export const ChatbotInputToolbar: React.FC<ChatbotInputToolbarProps> = ({
    onSend,
    onQuickAction,
    resetKey,
}) => {
    const styles = useInputStyles();
    const insets = useSafeAreaInsets();
    const { keyboardVisible } = useKeyboard();

    const {
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
        scrollViewRef,
        toggleListening,
        handleInitialChipPress,
        handleZoneSelect,
        handleCategorySelect,
        handlePondSelect,
        handleBack,
        clearSelectedZone,
        handleZonePick,
        handleSend,
    } = useChatbotInput({ onSend, onQuickAction, resetKey });

    const paddingBottom = keyboardVisible ? 12 : Math.max(16, insets.bottom + 4);

    return (
        <View style={[styles.wrapper, { paddingBottom }]}>
            {/* Quick Suggestion Chips / Zone Picker */}
            <QuickSuggestionChips
                step={step}
                isLoading={isLoading}
                zones={zones}
                categories={categories}
                ponds={ponds}
                showZonePicker={showZonePicker}
                activeZoneName={activeZoneName}
                allZones={allZones}
                scrollViewRef={scrollViewRef}
                onChipPress={handleInitialChipPress}
                onZoneSelect={handleZoneSelect}
                onCategorySelect={handleCategorySelect}
                onPondSelect={handlePondSelect}
                onBack={handleBack}
                onZonePick={handleZonePick}
            />

            {/* Input Row */}
            <View style={styles.inputWrapper}>
                <View style={[styles.inputPrimary, isListening && styles.inputPrimaryListening]}>
                    {/* Rainbow glow — rendered inside input bounds */}
                    {isListening && <RainbowGlowBorder volume={volume} />}

                    <TextInput
                        style={styles.composerInput}
                        value={text}
                        onChangeText={setText}
                        placeholder="Hỏi về ao, vụ nuôi..."
                        placeholderTextColor={colors.textSecondary}
                        multiline
                        returnKeyType="default"
                        blurOnSubmit={false}
                    />

                    <View style={styles.actionButtonsContainer}>
                        {/* Selected zone chip — inside input */}
                        {activeZoneName && (
                            <View style={styles.selectedZoneChip}>
                                <Text style={styles.selectedZoneText}>{activeZoneName}</Text>
                                {allZones.length > 1 && (
                                    <TouchableOpacity
                                        onPress={clearSelectedZone}
                                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                    >
                                        <Ionicons
                                            name="close"
                                            size={14}
                                            color={colors.textSecondary}
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}

                        {isListening && <AudioWaveform volume={volume} />}
                        <TouchableOpacity
                            style={[
                                styles.actionButton,
                                isListening && {
                                    backgroundColor: 'rgba(255, 60, 60, 0.2)',
                                    borderColor: 'rgba(255, 60, 60, 0.4)',
                                },
                            ]}
                            activeOpacity={0.7}
                            onPress={toggleListening}
                        >
                            <MicrophoneIcon
                                width={20}
                                height={20}
                                color={isListening ? '#FF453A' : undefined}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionButton, !hasText && { opacity: 0.4 }]}
                            onPress={handleSend}
                            disabled={!hasText}
                            activeOpacity={0.7}
                        >
                            <SendIcon width={20} height={20} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Disclaimer */}
            <Text style={styles.disclaimer}>
                Mebieco ChatBot là AI và có thể mắc sai sót. Vui lòng kiểm tra
            </Text>
        </View>
    );
};
