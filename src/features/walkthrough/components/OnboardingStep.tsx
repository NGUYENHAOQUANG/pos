import React, { useEffect, useRef, useState } from 'react';
import { StyleProp, ViewStyle, InteractionManager } from 'react-native';
import { WalkthroughTooltip } from '@/features/walkthrough/components/WalkthroughTooltip';
import { useOnboardingStore } from '@/features/walkthrough/store/useOnboardingStore';
import {
    APP_STEPS,
    AppStepKey,
    OnboardingStepConfig,
} from '@/features/walkthrough/constants/onboarding';

interface OnboardingStepProps {
    step: AppStepKey;
    children: React.ReactNode;
    onNext?: () => void;
    wrapperStyle?: StyleProp<ViewStyle>;
}

export const OnboardingStep: React.FC<OnboardingStepProps> = ({
    step,
    children,
    onNext,
    wrapperStyle,
}) => {
    const config: OnboardingStepConfig = APP_STEPS[step];
    const isVisibleRaw = useOnboardingStore(
        s => s.activeModule === config.module && s.currentStep === config.stepIndex
    );
    const completeOnboarding = useOnboardingStore(s => s.completeOnboarding);
    const nextStepAction = useOnboardingStore(s => s.nextStep);

    const [isVisible, setIsVisible] = useState(false);
    const mountedRef = useRef(true);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        if (isVisibleRaw) {
            const interactionHandle = InteractionManager.runAfterInteractions(() => {
                timerRef.current = setTimeout(() => {
                    if (mountedRef.current) {
                        setIsVisible(true);
                    }
                }, 250);
            });

            return () => {
                interactionHandle.cancel();
                if (timerRef.current) {
                    clearTimeout(timerRef.current);
                    timerRef.current = null;
                }
            };
        }

        setIsVisible(false);
        return undefined;
    }, [isVisibleRaw]);

    const handleNext = () => {
        setIsVisible(false);
        if (config.isLastStep) {
            completeOnboarding(config.module);
        } else {
            nextStepAction();
        }
        onNext?.();
    };

    const handleSkip = () => {
        setIsVisible(false);
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
