import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

import { colors } from '@/styles';
import {
    EnvironmentParameterSection,
    EnvironmentParameter,
} from '@/features/farm/components/pondwork/environment/EnvironmentParameterSection';
import { ButtonBar } from '@/shared/components/layout/ButtonBar';
import { HeaderMenu } from '@/features/menu/components/HeaderMenu';
import { SettingEnvSkeleton } from '@/features/farm/components/skeleton/SettingEnvSkeleton';
import { DropDownButtonBasic, DropDownItem } from '@/features/farm/components/DropDownButtonBasic';

interface SettingEnvironmentFormProps {
    isLoading: boolean;
    isDirty: boolean;
    isSaving: boolean;
    parameters: EnvironmentParameter[];
    advancedParameters: EnvironmentParameter[];
    locationData: DropDownItem[];
    activeDropdownItem: DropDownItem | undefined;
    onBack: () => void;
    onSelectLocation: (item: DropDownItem) => void;
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
    locationData,
    activeDropdownItem,
    onBack,
    onSelectLocation,
    onToggleParameter,
    onToggleAdvancedParameter,
    onEdit,
    onSave,
    onReset,
    UnsavedChangesModal,
}) => {
    return (
        <View style={styles.container}>
            <HeaderMenu title="Thiết lập thông số môi trường" onBack={onBack} />

            {isLoading ? (
                <SettingEnvSkeleton />
            ) : (
                <View style={styles.content}>
                    <View style={styles.dropdownContainer}>
                        <Text style={styles.label}>Ao nuôi / Khu nuôi</Text>
                        <DropDownButtonBasic
                            data={locationData}
                            value={activeDropdownItem}
                            onSelect={onSelectLocation}
                            placeholder="Chọn khu nuôi"
                            showIcon={false}
                            disabled={true}
                        />
                    </View>

                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                    >
                        <EnvironmentParameterSection
                            title="Nhóm mặc định"
                            subtitle="Bộ thông số chuẩn khi đo môi trường."
                            parameters={parameters}
                            onToggleParameter={onToggleParameter}
                            onEdit={onEdit}
                        />

                        <EnvironmentParameterSection
                            title="Nhóm nâng cao"
                            subtitle="Bộ thông số mở rộng để theo dõi."
                            parameters={advancedParameters}
                            onToggleParameter={onToggleAdvancedParameter}
                            onEdit={onEdit}
                        />
                    </ScrollView>
                </View>
            )}

            <ButtonBar
                mode="double"
                primaryTitle="Lưu"
                secondaryTitle="Thiết lập lại"
                onPrimaryPress={onSave}
                onSecondaryPress={onReset}
                primaryButtonDisabled={!isDirty || isSaving}
                secondaryButtonStyle={{ flex: 1, minWidth: 0 }}
            />
            {UnsavedChangesModal}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
    },
    content: {
        flex: 1,
    },
    dropdownContainer: {
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: colors.white,
        marginHorizontal: 16,
        marginTop: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.gray[200],
    },
    label: {
        fontSize: 14,
        color: colors.text,
        marginBottom: 8,
        fontWeight: '500',
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
