import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius } from '@/styles';
import { SelectionInfoBox } from '@/features/farm/components/pondwork/SelectionInfoBox';
import { OutlineButton } from '@/shared/components/buttons/OutlineButton';
import GearSix from '@/assets/Icon/GearSix.svg';
import WarningCircle from '@/assets/Icon/WarningCircle.svg';
import { ENVIRONMENT_METRIC_IDS } from '@/features/farm/types/farm.types';
import { Input } from '@/shared/components/forms/Input';

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

/** Parse limit string "min - max" into [min, max] or null */
function parseLimits(limitStr?: string): [number, number] | null {
    if (!limitStr) return null;
    const parts = limitStr.split('-').map(s => parseFloat(s.trim()));
    if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) return null;
    return [parts[0], parts[1]];
}

/** Check if value is outside the min/max range */
function isOutOfRange(value: string, limitStr?: string): boolean {
    if (!value || value === '') return false;
    const num = parseFloat(value);
    if (isNaN(num)) return false;
    const range = parseLimits(limitStr);
    if (!range) return false;
    return num < range[0] || num > range[1];
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

    const handleNumericInput = (text: string, callback: (val: string) => void) => {
        // 1. Remove any character that is not 0-9 or .
        let cleaned = text.replace(/[^0-9.]/g, '');

        // 2. Prevent . at the beginning
        if (cleaned.startsWith('.')) {
            cleaned = cleaned.substring(1);
        }

        // 3. Ensure only one . exists
        const parts = cleaned.split('.');
        if (parts.length > 2) {
            cleaned = parts[0] + '.' + parts.slice(1).join('');
        }

        callback(cleaned);
    };

    /** Render warning text below input if out of range */
    const renderWarning = (metricCode: string, value: string) => {
        const limitStr = limits[metricCode];
        if (!isOutOfRange(value, limitStr)) return null;
        return (
            <View style={styles.warningRow}>
                <WarningCircle width={14} height={14} color={colors.warning} />
                <Text style={styles.warningText}>Giá trị ngoài phạm vi cho phép ({limitStr})</Text>
            </View>
        );
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
                        keyboardType="default"
                        onChangeText={text => handleNumericInput(text, onPHChange)}
                    />
                    {renderWarning(ENVIRONMENT_METRIC_IDS.PH, pH)}
                </View>

                {/* DO */}
                <View style={styles.fullWidthRow}>
                    <Input
                        label={getLabel('DO', ENVIRONMENT_METRIC_IDS.DO, 'mg/L')}
                        value={doValue}
                        placeholder="--"
                        keyboardType="default"
                        onChangeText={text => handleNumericInput(text, onDOChange)}
                    />
                    {renderWarning(ENVIRONMENT_METRIC_IDS.DO, doValue)}
                </View>

                {/* Nhiệt độ */}
                <View style={styles.fullWidthRow}>
                    <Input
                        label={getLabel('Nhiệt độ', ENVIRONMENT_METRIC_IDS.TEMPERATURE, '°C')}
                        value={temperature}
                        placeholder="--"
                        keyboardType="default"
                        onChangeText={text => handleNumericInput(text, onTemperatureChange)}
                    />
                    {renderWarning(ENVIRONMENT_METRIC_IDS.TEMPERATURE, temperature)}
                </View>

                {/* Độ mặn */}
                <View style={styles.fullWidthRow}>
                    <Input
                        label={getLabel('Độ mặn', ENVIRONMENT_METRIC_IDS.SALINITY, 'ppt')}
                        value={salinity}
                        placeholder="--"
                        keyboardType="default"
                        onChangeText={text => handleNumericInput(text, onSalinityChange)}
                    />
                    {renderWarning(ENVIRONMENT_METRIC_IDS.SALINITY, salinity)}
                </View>

                {/* Độ kiềm */}
                <View style={styles.fullWidthRow}>
                    <Input
                        label={getLabel('Độ kiềm', ENVIRONMENT_METRIC_IDS.ALKALINITY, 'mg/L')}
                        value={alkalinity}
                        placeholder="--"
                        keyboardType="default"
                        onChangeText={text => handleNumericInput(text, onAlkalinityChange)}
                    />
                    {renderWarning(ENVIRONMENT_METRIC_IDS.ALKALINITY, alkalinity)}
                </View>

                {/* Độ trong */}
                <View style={styles.fullWidthRow}>
                    <Input
                        label={getLabel('Độ trong', ENVIRONMENT_METRIC_IDS.TRANSPARENCY, 'cm')}
                        value={transparency}
                        placeholder="--"
                        keyboardType="default"
                        onChangeText={text => handleNumericInput(text, onTransparencyChange)}
                    />
                    {renderWarning(ENVIRONMENT_METRIC_IDS.TRANSPARENCY, transparency)}
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
                                    keyboardType="default"
                                    onChangeText={text => handleNumericInput(text, paramOnChange)}
                                />
                                {renderWarning(param.id, paramValue)}
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
});
