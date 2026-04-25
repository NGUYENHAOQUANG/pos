import React, { useEffect, useRef, useState } from 'react';
import { StyleProp, ViewStyle, InteractionManager } from 'react-native';
import { WalkthroughTooltip } from '@/features/walkthrough/components/WalkthroughTooltip';
import { useOnboardingStore } from '@/features/walkthrough/store/useOnboardingStore';
import {
    APP_STEPS,
    AppStepKey,
    OnboardingStepConfig,
    DEFAULT_TOOLTIP_ANIMATION_DELAY,
} from '@/features/walkthrough/constants/onboarding';

import { useNavigation } from '@react-navigation/native';

interface OnboardingStepProps {
    step: AppStepKey;
    children: React.ReactNode;
    onNext?: () => void;
    wrapperStyle?: StyleProp<ViewStyle>;
    /** Optional explicit active state (useful for Modals/BottomSheets where isFocused is unreliable) */
    isActive?: boolean;
    /** Callback triggered when this step becomes active (useful for scrolling lists to index) */
    onStepActive?: () => void;
}

export const OnboardingStep: React.FC<OnboardingStepProps> = ({
    step,
    children,
    onNext,
    wrapperStyle,
    isActive,
    onStepActive,
}) => {
    const config: OnboardingStepConfig = APP_STEPS[step];
    const isTargetStep = useOnboardingStore(
        s =>
            s._hasHydrated && s.activeModule === config.module && s.currentStep === config.stepIndex
    );
    const completeOnboarding = useOnboardingStore(s => s.completeOnboarding);
    const nextStepAction = useOnboardingStore(s => s.nextStep);

    const [isVisible, setIsVisible] = useState(false);
    const mountedRef = useRef(true);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const onStepActiveRef = useRef(onStepActive);
    const navigation = useNavigation();

    useEffect(() => {
        onStepActiveRef.current = onStepActive;
    }, [onStepActive]);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        if (!isTargetStep || isActive === false) {
            setIsVisible(false);
            return undefined;
        }

        const showTooltip = () => {
            onStepActiveRef.current?.();

            const delay = config.delay ?? DEFAULT_TOOLTIP_ANIMATION_DELAY;
            const interactionHandle = InteractionManager.runAfterInteractions(() => {
                timerRef.current = setTimeout(() => {
                    if (mountedRef.current) {
                        setIsVisible(true);
                    }
                }, delay);
            });

            return () => {
                interactionHandle.cancel();
                if (timerRef.current) {
                    clearTimeout(timerRef.current);
                    timerRef.current = null;
                }
            };
        };

        let cleanup: (() => void) | undefined;

        if (navigation.isFocused()) {
            cleanup = showTooltip();
        }

        const unsubscribeFocus = navigation.addListener('focus', () => {
            cleanup = showTooltip();
        });

        const unsubscribeBlur = navigation.addListener('blur', () => {
            if (cleanup) cleanup();
            setIsVisible(false);
        });

        return () => {
            unsubscribeFocus();
            unsubscribeBlur();
            if (cleanup) cleanup();
        };
    }, [isTargetStep, config.delay, isActive, navigation]);

    const handleNext = React.useCallback(() => {
        setIsVisible(false);
        if (config.isLastStep) {
            completeOnboarding(config.module);
        } else {
            nextStepAction();
        }
        onNext?.();
    }, [config.isLastStep, config.module, completeOnboarding, nextStepAction, onNext]);

    const handleSkip = React.useCallback(() => {
        setIsVisible(false);
        completeOnboarding(config.module);
    }, [config.module, completeOnboarding]);

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
            allowChildInteraction={config.allowInteraction ?? false}
        >
            {children}
        </WalkthroughTooltip>
    );
};
