import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { spacing } from '@/styles';

import { ButtonBar } from '@/shared/components/layout/ButtonBar';
import {
    useSurveyStore,
    selectCurrentQuestion,
    selectProgress,
    selectCurrentAnswer,
} from '../store/useSurveyStore';
import { SurveyProgressBar } from '../components/SurveyProgressBar';
import { SurveyOptionList } from '../components/SurveyOptionList';
import { SurveyNumberSlider } from '../components/SurveyNumberSlider';
import { SurveyContactInfo } from '../components/SurveyContactInfo';
import { ContactInfo } from '../types/survey.types';
import { useNavigation } from '@react-navigation/native';
import { useSubmitSurvey } from '../hooks/useSubmitSurvey';
import { HeaderSection } from '@/shared/components/layout/HeaderSection';

export const SurveyScreen = () => {
    const theme = useAppTheme();
    const styles = getStyles(theme);
    const navigation = useNavigation();

    const question = useSurveyStore(selectCurrentQuestion);
    const progress = useSurveyStore(selectProgress);
    const answer = useSurveyStore(selectCurrentAnswer);

    const setAnswer = useSurveyStore(state => state.setAnswer);
    const nextQuestion = useSurveyStore(state => state.nextQuestion);
    const prevQuestion = useSurveyStore(state => state.prevQuestion);
    const { submitSurvey, isSubmitting } = useSubmitSurvey();

    if (!question) return null;

    const isLastQuestion = progress.current === progress.total;

    let canProceed = false;
    if (question.type === 'single_choice' || question.type === 'number_slider') {
        canProceed = answer !== undefined && answer !== null;
    } else if (question.type === 'multi_select') {
        canProceed = Array.isArray(answer) && answer.length > 0;
    } else if (question.type === 'contact_info') {
        const contact = answer as ContactInfo;
        const isPhoneValid = contact?.phone ? /^(03|05|07|08|09)\d{8}$/.test(contact.phone) : false;
        canProceed = !!(contact?.name && contact.name.trim().length > 0 && isPhoneValid);
    }

    const handleNext = async () => {
        if (!canProceed) return;
        if (isLastQuestion) {
            const success = await submitSurvey();
            if (success) {
                (navigation as any).reset({
                    index: 0,
                    routes: [{ name: 'MainTabs', params: { screen: 'Farm' } }],
                });
            }
        } else {
            nextQuestion();
        }
    };

    return (
        <View style={styles.container}>
            <HeaderSection
                title="Khảo sát"
                onBack={progress.current > 1 ? prevQuestion : () => navigation.goBack()}
            />

            {/* Progress Bar */}
            <SurveyProgressBar current={progress.current} total={progress.total} />

            {/* Content */}
            <View style={styles.content}>
                <View style={styles.questionHeader}>
                    <Text style={styles.questionText}>{question.question}</Text>
                    {question.suggestion && (
                        <Text style={styles.suggestionText}>{question.suggestion}</Text>
                    )}
                </View>

                {question.type === 'single_choice' && question.options && (
                    <SurveyOptionList
                        options={question.options}
                        value={answer as string | number}
                        onSelect={val => setAnswer(question.id, val)}
                    />
                )}

                {question.type === 'multi_select' && question.options && (
                    <SurveyOptionList
                        options={question.options}
                        value={answer as string[]}
                        onSelect={val => setAnswer(question.id, val)}
                        isMultiSelect
                        maxSelections={question.maxSelections}
                    />
                )}

                {question.type === 'number_slider' && (
                    <SurveyNumberSlider
                        min={question.min || 1}
                        max={question.max || 20}
                        unit={question.unit}
                        value={answer as number | undefined}
                        onChange={val => setAnswer(question.id, val)}
                    />
                )}

                {question.type === 'contact_info' && (
                    <SurveyContactInfo
                        value={answer as ContactInfo}
                        onChange={val => setAnswer(question.id, val)}
                    />
                )}
            </View>

            {/* Footer Buttons */}
            <ButtonBar
                mode="double"
                primaryTitle={isLastQuestion ? 'Hoàn thành' : 'Tiếp theo'}
                secondaryTitle="Quay lại"
                onPrimaryPress={handleNext}
                onSecondaryPress={prevQuestion}
                primaryButtonDisabled={!canProceed || isSubmitting}
                secondaryButtonDisabled={progress.current === 1}
                containerStyle={styles.footer}
            />
        </View>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.backgroundPrimary,
        },
        content: {
            flex: 1,
        },
        questionHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            flexWrap: 'wrap',
            paddingHorizontal: spacing.lg,
            marginBottom: spacing.xl,
            gap: spacing.xs,
        },
        questionText: {
            fontSize: 18,
            fontWeight: '600',
            color: theme.text,
        },
        suggestionText: {
            fontSize: 16,
            fontWeight: '400',
            color: theme.textSecondary,
        },
        footer: {
            borderTopWidth: 1,
            borderTopColor: theme.border,
            paddingTop: spacing.lg,
        },
    });
