import React, { useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import {
    EnvironmentParameterSection,
    EnvironmentParameter,
} from '@/features/farm/components/pondwork/environment/EnvironmentParameterSection';
import { ButtonBar } from '@/shared/components/layout/ButtonBar';
import { HeaderMenu } from '@/features/menu/components/HeaderMenu';
import { SettingEnvSkeleton } from '@/features/farm/components/skeleton/SettingEnvSkeleton';
import { OnboardingStep } from '@/features/walkthrough/components/OnboardingStep';

interface SettingEnvironmentFormProps {
    isLoading: boolean;
    isDirty: boolean;
    isSaving: boolean;
    parameters: EnvironmentParameter[];
    advancedParameters: EnvironmentParameter[];
    onBack: () => void;
    onToggleParameter: (id: string) => void;
    onToggleAdvancedParameter: (id: string) => void;
    onEdit: (parameter: EnvironmentParameter) => void;
    onSave: () => void;
    onReset: () => void;
    UnsavedChangesModal: React.ReactNode;
}

export const SettingEnvironmentForm: React.FC<SettingEnvironmentFormProps> = ({
    isLoading,
    isDirty,
    isSaving,
    parameters,
    advancedParameters,
    onBack,
    onToggleParameter,
    onToggleAdvancedParameter,
    onEdit,
    onSave,
    onReset,
    UnsavedChangesModal,
}) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    const renderCheckboxOnboarding = useCallback(
        (param: any, defaultNode: React.ReactNode, index: number) => {
            return index === 0 ? (
                <OnboardingStep
                    step="ENV_CHECKBOX_BUTTON"
                    wrapperStyle={{ borderRadius: 6, backgroundColor: theme.background }}
                >
                    {defaultNode}
                </OnboardingStep>
            ) : (
                defaultNode
            );
        },
        [theme.background]
    );

    const renderEditButtonOnboarding = useCallback(
        (param: any, defaultNode: React.ReactNode, index: number) => {
            return index === 0 ? (
                <OnboardingStep step="ENV_EDIT_BUTTON" wrapperStyle={{ borderRadius: 16 }}>
                    {defaultNode}
                </OnboardingStep>
            ) : (
                defaultNode
            );
        },
        []
    );

    return (
        <View style={styles.container}>
            <HeaderMenu
                title="Thiết lập thông số môi trường"
                onBack={onBack}
                backButtonDisabled={isSaving}
            />

            {isLoading ? (
                <SettingEnvSkeleton />
            ) : (
                <View style={styles.content}>
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                    >
                        <OnboardingStep
                            step="ENV_DEFAULT_GROUP"
                            wrapperStyle={{ borderRadius: 12 }}
                        >
                            <EnvironmentParameterSection
                                title="Nhóm mặc định"
                                subtitle="Bộ thông số chuẩn khi đo môi trường."
                                parameters={parameters}
                                onToggleParameter={onToggleParameter}
                                onEdit={onEdit}
                                renderCheckbox={renderCheckboxOnboarding}
                                renderEditButton={renderEditButtonOnboarding}
                            />
                        </OnboardingStep>

                        <OnboardingStep
                            step="ENV_ADVANCED_GROUP"
                            wrapperStyle={{ borderRadius: 12 }}
                        >
                            <EnvironmentParameterSection
                                title="Nhóm nâng cao"
                                subtitle="Bộ thông số mở rộng để theo dõi."
                                parameters={advancedParameters}
                                onToggleParameter={onToggleAdvancedParameter}
                                onEdit={onEdit}
                            />
                        </OnboardingStep>
                    </ScrollView>
                </View>
            )}

            <OnboardingStep step="ENV_SAVE_BUTTON" onNext={onBack}>
                <ButtonBar
                    mode="double"
                    primaryTitle="Lưu thông tin"
                    secondaryTitle="Thiết lập lại"
                    onPrimaryPress={onSave}
                    onSecondaryPress={onReset}
                    primaryButtonDisabled={!isDirty || isSaving}
                    secondaryButtonDisabled={isSaving}
                    primaryButtonLoading={isSaving}
                    secondaryButtonStyle={{ flex: 1, minWidth: 0 }}
                />
            </OnboardingStep>
            {UnsavedChangesModal}
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

        scrollView: {
            flex: 1,
        },
        scrollContent: {
            padding: 16,
            gap: 8,
            paddingBottom: 20,
        },
    });
