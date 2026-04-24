export * from '../types/walkthrough.types';
import { FARM_STEPS } from './farm';
import { MATERIAL_STEPS } from './material';
import { ACCOUNT_STEPS } from './account';
import { REPORT_STEPS } from './report';
import { OnboardingStepConfig } from '../types/walkthrough.types';

export const DEFAULT_TOOLTIP_ANIMATION_DELAY = 350;

type AssertUnique<T1, T2, T3, T4> =
    | Extract<keyof T1, keyof T2 | keyof T3 | keyof T4>
    | Extract<keyof T2, keyof T3 | keyof T4>
    | Extract<keyof T3, keyof T4> extends never
    ? true
    : false;

const _preventKeyCollisions: AssertUnique<
    typeof FARM_STEPS,
    typeof MATERIAL_STEPS,
    typeof ACCOUNT_STEPS,
    typeof REPORT_STEPS
> = true;

export const APP_STEPS = {
    ...FARM_STEPS,
    ...MATERIAL_STEPS,
    ...ACCOUNT_STEPS,
    ...REPORT_STEPS,
} as const satisfies Record<string, OnboardingStepConfig>;

export type AppStepKey = keyof typeof APP_STEPS;
