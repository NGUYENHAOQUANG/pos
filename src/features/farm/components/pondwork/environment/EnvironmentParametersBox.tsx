import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius } from '@/styles';
import { SelectionInfoBox } from '@/features/farm/components/pondwork/SelectionInfoBox';
import { OutlineButton } from '@/shared/components/buttons/OutlineButton';
import GearSix from '@/assets/Icon/GearSix.svg';
import WarningCircle from '@/assets/Icon/WarningCircle.svg';
import { ENVIRONMENT_METRIC_IDS } from '@/features/farm/types/farm.types';
import { Input, InputFormat } from '@/shared/components/forms/Input';

interface EnvironmentParametersBoxProps {
    pH: string;
    onPHChange: (value: string) => void;
    do: string;
    onDOChange: (value: string) => void;
    temperature: string;
    onTemperatureChange: (value: string) => void;
    salinity: string;
    onSalinityChange: (value: string) => void;
    alkalinity: string;
    onAlkalinityChange: (value: string) => void;
    transparency: string;
    onTransparencyChange: (value: string) => void;
    onSetupPress?: () => void;
    showError?: boolean;
    advancedParameters?: Array<{ id: string; name: string }>;
    kali?: string;
    onKaliChange?: (value: string) => void;
    tan?: string;
    onTanChange?: (value: string) => void;
    magie?: string;
    onMagieChange?: (value: string) => void;
    no3?: string;
    onNo3Change?: (value: string) => void;
    limits?: Record<string, string>; // Code -> Limit string (e.g., "7.5 - 8.5")
}

export const EnvironmentParametersBox: React.FC<EnvironmentParametersBoxProps> = ({
    pH,
    onPHChange,
    do: doValue,
    onDOChange,
    temperature,
    onTemperatureChange,
    salinity,
    onSalinityChange,
    alkalinity,
    onAlkalinityChange,
    transparency,
    onTransparencyChange,
    onSetupPress,
    showError = false,
    advancedParameters = [],
    kali = '',
    onKaliChange,
    tan = '',
    onTanChange,
    magie = '',
    onMagieChange,
    no3 = '',
    onNo3Change,
    limits = {},
}) => {
    // Parse limit string "min - max" and validate input value
    const getLimitError = (value: string, metricCode: string): string | undefined => {
        if (!value || !limits[metricCode]) return undefined;
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return undefined;

        const parts = limits[metricCode].split('-').map(s => s.trim());
        if (parts.length !== 2) return undefined;

        const min = parseFloat(parts[0]);
        const max = parseFloat(parts[1]);
        if (isNaN(min) || isNaN(max)) return undefined;

        if (numValue < min) return `Thấp quá giới hạn dưới: ${min}`;
        if (numValue > max) return `Vượt quá giới hạn trên: ${max}`;
        return undefined;
    };
    // Helper to generate label
    const getLabel = (baseName: string, id: string, unit: string = '') => {
        return unit ? `${baseName} (${unit})` : baseName;
    };

    // Map advanced parameter IDs to render fields
    const getAdvancedParameterValue = (id: string): string => {
        if (id === ENVIRONMENT_METRIC_IDS.KALI) return kali;
        if (id === ENVIRONMENT_METRIC_IDS.TAN) return tan;
        if (id === ENVIRONMENT_METRIC_IDS.MAGIE) return magie;
        if (id === ENVIRONMENT_METRIC_IDS.NO3) return no3;
        return '';
    };

    const getAdvancedParameterOnChange = (id: string): ((value: string) => void) | undefined => {
        if (id === ENVIRONMENT_METRIC_IDS.KALI) return onKaliChange;
        if (id === ENVIRONMENT_METRIC_IDS.TAN) return onTanChange;
        if (id === ENVIRONMENT_METRIC_IDS.MAGIE) return onMagieChange;
        if (id === ENVIRONMENT_METRIC_IDS.NO3) return onNo3Change;
        return undefined;
    };

    return (
        <SelectionInfoBox title="Chỉ số môi trường">
            {showError && (
                <View style={styles.errorBox}>
                    <WarningCircle width={16} height={16} />
                    <Text style={styles.errorText}>Vui lòng nhập ít nhất 1 chỉ số</Text>
                </View>
            )}
            <View>
                {/* pH */}
                <View style={styles.fullWidthRow}>
                    <Input
                        label={getLabel('pH', ENVIRONMENT_METRIC_IDS.PH, '1-14')}
                        value={pH}
                        placeholder="--"
                        keyboardType="numeric"
                        inputFormat={InputFormat.DECIMAL}
                        onChangeText={onPHChange}
                        containerStyle={{
                            marginBottom: getLimitError(pH, ENVIRONMENT_METRIC_IDS.PH)
                                ? 0
                                : undefined,
                        }}
                    />
                    {getLimitError(pH, ENVIRONMENT_METRIC_IDS.PH) && (
                        <Text style={styles.warningHintText}>
                            {getLimitError(pH, ENVIRONMENT_METRIC_IDS.PH)}
                        </Text>
                    )}
                </View>

                {/* DO */}
                <View style={styles.fullWidthRow}>
                    <Input
                        label={getLabel('DO', ENVIRONMENT_METRIC_IDS.DO, 'mg/L')}
                        value={doValue}
                        placeholder="--"
                        keyboardType="numeric"
                        inputFormat={InputFormat.DECIMAL}
                        onChangeText={onDOChange}
                        containerStyle={{
                            marginBottom: getLimitError(doValue, ENVIRONMENT_METRIC_IDS.DO)
                                ? 0
                                : undefined,
                        }}
                    />
                    {getLimitError(doValue, ENVIRONMENT_METRIC_IDS.DO) && (
                        <Text style={styles.warningHintText}>
                            {getLimitError(doValue, ENVIRONMENT_METRIC_IDS.DO)}
                        </Text>
                    )}
                </View>

                {/* Nhiệt độ */}
                <View style={styles.fullWidthRow}>
                    <Input
                        label={getLabel('Nhiệt độ', ENVIRONMENT_METRIC_IDS.TEMPERATURE, '°C')}
                        value={temperature}
                        placeholder="--"
                        keyboardType="numeric"
                        inputFormat={InputFormat.DECIMAL}
                        onChangeText={onTemperatureChange}
                        containerStyle={{
                            marginBottom: getLimitError(
                                temperature,
                                ENVIRONMENT_METRIC_IDS.TEMPERATURE
                            )
                                ? 0
                                : undefined,
                        }}
                    />
                    {getLimitError(temperature, ENVIRONMENT_METRIC_IDS.TEMPERATURE) && (
                        <Text style={styles.warningHintText}>
                            {getLimitError(temperature, ENVIRONMENT_METRIC_IDS.TEMPERATURE)}
                        </Text>
                    )}
                </View>

                {/* Độ mặn */}
                <View style={styles.fullWidthRow}>
                    <Input
                        label={getLabel('Độ mặn', ENVIRONMENT_METRIC_IDS.SALINITY, 'ppt')}
                        value={salinity}
                        placeholder="--"
                        keyboardType="numeric"
                        inputFormat={InputFormat.DECIMAL}
                        onChangeText={onSalinityChange}
                        containerStyle={{
                            marginBottom: getLimitError(salinity, ENVIRONMENT_METRIC_IDS.SALINITY)
                                ? 0
                                : undefined,
                        }}
                    />
                    {getLimitError(salinity, ENVIRONMENT_METRIC_IDS.SALINITY) && (
                        <Text style={styles.warningHintText}>
                            {getLimitError(salinity, ENVIRONMENT_METRIC_IDS.SALINITY)}
                        </Text>
                    )}
                </View>

                {/* Độ kiềm */}
                <View style={styles.fullWidthRow}>
                    <Input
                        label={getLabel('Độ kiềm', ENVIRONMENT_METRIC_IDS.ALKALINITY, 'mg/L')}
                        value={alkalinity}
                        placeholder="--"
                        keyboardType="numeric"
                        inputFormat={InputFormat.DECIMAL}
                        onChangeText={onAlkalinityChange}
                        containerStyle={{
                            marginBottom: getLimitError(
                                alkalinity,
                                ENVIRONMENT_METRIC_IDS.ALKALINITY
                            )
                                ? 0
                                : undefined,
                        }}
                    />
                    {getLimitError(alkalinity, ENVIRONMENT_METRIC_IDS.ALKALINITY) && (
                        <Text style={styles.warningHintText}>
                            {getLimitError(alkalinity, ENVIRONMENT_METRIC_IDS.ALKALINITY)}
                        </Text>
                    )}
                </View>

                {/* Độ trong */}
                <View style={styles.fullWidthRow}>
                    <Input
                        label={getLabel('Độ trong', ENVIRONMENT_METRIC_IDS.TRANSPARENCY, 'cm')}
                        value={transparency}
                        placeholder="--"
                        keyboardType="numeric"
                        inputFormat={InputFormat.DECIMAL}
                        onChangeText={onTransparencyChange}
                        containerStyle={{
                            marginBottom: getLimitError(
                                transparency,
                                ENVIRONMENT_METRIC_IDS.TRANSPARENCY
                            )
                                ? 0
                                : undefined,
                        }}
                    />
                    {getLimitError(transparency, ENVIRONMENT_METRIC_IDS.TRANSPARENCY) && (
                        <Text style={styles.warningHintText}>
                            {getLimitError(transparency, ENVIRONMENT_METRIC_IDS.TRANSPARENCY)}
                        </Text>
                    )}
                </View>

                {/* Advanced Parameters */}
                {advancedParameters.length > 0 &&
                    advancedParameters.map(param => {
                        const paramValue = getAdvancedParameterValue(param.id);
                        const paramOnChange = getAdvancedParameterOnChange(param.id);
                        if (!paramOnChange) return null;

                        let label = param.name;

                        return (
                            <View key={param.id} style={styles.fullWidthRow}>
                                <Input
                                    label={label}
                                    value={paramValue}
                                    placeholder="--"
                                    keyboardType="numeric"
                                    inputFormat={InputFormat.DECIMAL}
                                    onChangeText={paramOnChange}
                                    containerStyle={{
                                        marginBottom: getLimitError(paramValue, param.id)
                                            ? 0
                                            : undefined,
                                    }}
                                />
                                {getLimitError(paramValue, param.id) && (
                                    <Text style={styles.warningHintText}>
                                        {getLimitError(paramValue, param.id)}
                                    </Text>
                                )}
                            </View>
                        );
                    })}
                {/* Setup Button */}
                {onSetupPress && (
                    <OutlineButton
                        label="Thiết lập chỉ số môi trường"
                        onPress={onSetupPress}
                        prefix={<GearSix width={16} height={16} color={colors.textSecondary} />}
                        style={styles.setupButton}
                    />
                )}
            </View>
        </SelectionInfoBox>
    );
};

const styles = StyleSheet.create({
    errorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.errorBackground,
        borderWidth: 1,
        borderColor: colors.error,
        borderRadius: borderRadius.sm,
        paddingVertical: 8,
        paddingHorizontal: 12,
        gap: spacing.sm,
    },
    errorText: {
        fontWeight: '400',
        fontStyle: 'normal',
        fontSize: 14,
        lineHeight: 22,
        color: colors.text,
        flex: 1,
    },
    row: {
        flexDirection: 'row',
        gap: 8,
    },
    column: {
        flex: 1,
    },
    fullWidthRow: {
        width: '100%',
    },
    setupButton: {
        marginTop: 4,
    },
    warningRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    warningText: {
        fontSize: 12,
        color: colors.warning,
        flex: 1,
    },
    warningHintText: {
        fontSize: 12,
        color: colors.error,
        marginTop: 2,
        marginBottom: 12,
    },
});
