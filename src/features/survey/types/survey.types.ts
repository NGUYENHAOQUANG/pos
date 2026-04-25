export type QuestionType = 'single_choice' | 'multi_select' | 'number_slider' | 'contact_info';

export interface SurveyOption {
    label: string;
    value: string | number;
}

export interface ContactInfo {
    name: string;
    phone: string;
    province?: string;
    note?: string;
}

export type AnswerType = string | number | string[] | ContactInfo;

export interface SurveyQuestion {
    id: string;
    type: QuestionType;
    question: string;
    suggestion?: string;
    options?: SurveyOption[];
    min?: number;
    max?: number;
    unit?: string;
    maxSelections?: number;
}

export interface SurveyState {
    questions: SurveyQuestion[];
    currentIndex: number;
    answers: Record<string, AnswerType>;
    setAnswer: (questionId: string, answer: AnswerType) => void;
    nextQuestion: () => void;
    prevQuestion: () => void;
    resetSurvey: () => void;
}

export interface SurveySubmitPayload {
    branchType: 'A' | 'B';
    fullName: string;
    phoneNumber: string;
    province: string;
    note: string;
    answers: Record<string, string | string[]>;
}

export interface SurveySubmitResult {
    success: boolean;
    surveyId?: string;
    message?: string;
}

export interface SurveyStatusResult {
    completed: boolean;
    branch?: string;
    submittedAt?: string;
}
