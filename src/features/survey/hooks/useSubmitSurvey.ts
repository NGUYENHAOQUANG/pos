import { useState } from 'react';
import Toast from 'react-native-toast-message';
import { surveyApi } from '@/features/survey/api/surveyApi';
import { useSurveyStore } from '@/features/survey/store/useSurveyStore';
import type {
    SurveySubmitPayload,
    SurveyQuestion,
    ContactInfo,
    AnswerType,
} from '@/features/survey/types/survey.types';

/**
 * Resolve a value to its Vietnamese label using question options
 */
const resolveLabel = (question: SurveyQuestion | undefined, value: string | number): string => {
    if (!question?.options) return String(value);
    const option = question.options.find(opt => opt.value === value);
    return option ? option.label : String(value);
};

/**
 * Transform raw survey answers from store into API payload
 * Maps internal value codes to Vietnamese labels for API consumption
 * Maps q1 → A1/B1 so server receives correct sequential keys
 */
const buildPayload = (
    answers: Record<string, AnswerType>,
    questions: SurveyQuestion[]
): SurveySubmitPayload => {
    // Determine branch based on Q1 answer
    const q1 = answers['q1'] as string;
    const branchType: 'A' | 'B' = q1 === 'a_active' || q1 === 'a_paused' ? 'A' : 'B';

    // Extract contact info from the last question (A8 or B8)
    const contactInfo = (answers['A8'] || answers['B8'] || {}) as ContactInfo;

    // Build a lookup map: questionId → SurveyQuestion
    const questionMap = new Map<string, SurveyQuestion>();
    questions.forEach(q => questionMap.set(q.id, q));

    // Format question answers with Vietnamese labels
    // Map q1 → A1 or B1 based on branch
    const formattedAnswers: Record<string, string | string[]> = {};
    Object.keys(answers).forEach(key => {
        // Skip contact info questions
        if (key === 'A8' || key === 'B8') return;

        const val = answers[key];
        const question = questionMap.get(key);

        // Map q1 key to A1 or B1
        const apiKey = key === 'q1' ? `${branchType}1` : key;

        if (Array.isArray(val)) {
            // Multi-select: resolve each value to its label, keep as array
            formattedAnswers[apiKey] = val.map(v => resolveLabel(question, v));
        } else if (typeof val === 'number') {
            // Number slider: keep as number string
            formattedAnswers[apiKey] = String(val);
        } else if (typeof val === 'string') {
            // Single choice: resolve to label
            formattedAnswers[apiKey] = resolveLabel(question, val);
        }
    });

    return {
        branchType,
        fullName: contactInfo.name || '',
        phoneNumber: contactInfo.phone || '',
        province: contactInfo.province || '',
        note: contactInfo.note || '',
        answers: formattedAnswers,
    };
};

/**
 * Hook to handle survey submission
 */
export const useSubmitSurvey = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const submitSurvey = async (): Promise<boolean> => {
        const { answers, questions } = useSurveyStore.getState();
        const payload = buildPayload(answers, questions);

        setIsSubmitting(true);
        try {
            await surveyApi.submit(payload);

            Toast.show({
                type: 'success',
                text1: 'Gửi khảo sát thành công!',
                position: 'bottom',
            });
            return true;
        } catch (error: unknown) {
            const normalizedError = error as {
                type?: string;
                message?: string;
                statusCode?: number;
                data?: unknown;
            };

            Toast.show({
                type: 'error',
                text1: 'Gửi khảo sát thất bại',
                text2: normalizedError.message || 'Vui lòng thử lại.',
                position: 'bottom',
            });
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    return { submitSurvey, isSubmitting };
};
