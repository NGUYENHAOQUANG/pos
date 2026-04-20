import React from 'react';
import { StyleProp, ViewStyle, InteractionManager } from 'react-native';
import { WalkthroughTooltip } from '@/features/walkthrough/components/WalkthroughTooltip';
import { useOnboardingStore } from '@/features/walkthrough/store/useOnboardingStore';
import {
    APP_STEPS,
    AppStepKey,
    OnboardingStepConfig,
} from '@/features/walkthrough/constants/onboarding';

interface OnboardingStepProps {
    /** Step key from APP_STEPS config */
    step: AppStepKey;
    /** Content to spotlight */
    children: React.ReactNode;
    /** Optional callback that runs AFTER nextStep/completeOnboarding */
    onNext?: () => void;
    /** Optional style override for the tooltip children wrapper */
    wrapperStyle?: StyleProp<ViewStyle>;
    /** Optional delay (ms) before showing tooltip — use when parent needs scroll time */
    visibilityDelay?: number;
}

/**
 * Smart onboarding wrapper — replaces verbose WalkthroughTooltip + store usage.
 *
 * Usage:
 * ```tsx
 * <OnboardingStep step="FARM_SELECTOR">
 *     <DropDownButton ... />
 * </OnboardingStep>
 * ```
 */
export const OnboardingStep: React.FC<OnboardingStepProps> = ({
    step,
    children,
    onNext,
    wrapperStyle,
    visibilityDelay = 0,
}) => {
    const config: OnboardingStepConfig = APP_STEPS[step];
    const { activeModule, currentStep, nextStep, completeOnboarding } = useOnboardingStore();

    const isVisibleRaw = activeModule === config.module && currentStep === config.stepIndex;
    const [isVisible, setIsVisible] = React.useState(false);

    React.useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        let interactionTask: { cancel: () => void } | null = null;

        if (isVisibleRaw) {
            interactionTask = InteractionManager.runAfterInteractions(() => {
                if (visibilityDelay > 0) {
                    timer = setTimeout(() => setIsVisible(true), visibilityDelay);
                } else {
                    setIsVisible(true);
                }
            });
        } else {
            setIsVisible(false);
        }

        return () => {
            if (timer) clearTimeout(timer);
            if (interactionTask) interactionTask.cancel();
        };
    }, [isVisibleRaw, visibilityDelay]);

    const handleNext = () => {
        if (config.isLastStep) {
            completeOnboarding(config.module);
        } else {
            nextStep();
        }
        onNext?.();
    };

    const handleSkip = () => {
        completeOnboarding(config.module);
    };

    return (
        <WalkthroughTooltip
            isVisible={isVisible}
            title={config.title}
            description={config.description}
            placement={config.placement}
            isLastStep={config.isLastStep}
            onSkip={handleSkip}
            onNext={handleNext}
            childrenWrapperStyle={wrapperStyle}
        >
            {children}
        </WalkthroughTooltip>
    );
};
