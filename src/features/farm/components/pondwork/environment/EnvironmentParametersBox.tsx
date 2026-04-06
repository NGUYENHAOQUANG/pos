import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { spacing, borderRadius } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { SelectionInfoBox } from '@/features/farm/components/pondwork/SelectionInfoBox';
import { Button } from '@/shared/components/buttons/Button';
import GearSix from '@/assets/Icon/GearSix.svg';
import WarningCircle from '@/assets/Icon/WarningCircle.svg';
import { ENVIRONMENT_METRIC_IDS } from '@/features/farm/types/farm.types';
import { IParameterLimits } from '@/features/farm/types/envMeasurement.types';
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
    limits?: IParameterLimits;
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
    const theme = useAppTheme();
    const styles = getStyles(theme);

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

    const getLabel = (baseName: string, _id: string, unit: string = '') => {
        return unit ? `${baseName} (${unit})` : baseName;
    };

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
                    <WarningCircle width={16} height={16} color={theme.error} />
                    <Text style={styles.errorText}>Vui lòng nhập ít nhất 1 chỉ số</Text>
                </View>
            )}
            <View>
                <Input
                    label={getLabel('pH', ENVIRONMENT_METRIC_IDS.PH, '1-14')}
                    value={pH}
                    placeholder="--"
                    inputFormat={InputFormat.DECIMAL}
                    onChangeText={onPHChange}
                    hint={getLimitError(pH, ENVIRONMENT_METRIC_IDS.PH)}
                    reserveErrorSpace
                    containerStyle={styles.inputContainer}
                />

                <Input
                    label={getLabel('DO', ENVIRONMENT_METRIC_IDS.DO, 'mg/L')}
                    value={doValue}
                    placeholder="--"
                    inputFormat={InputFormat.DECIMAL}
                    onChangeText={onDOChange}
                    hint={getLimitError(doValue, ENVIRONMENT_METRIC_IDS.DO)}
                    reserveErrorSpace
                    containerStyle={styles.inputContainer}
                />

                <Input
                    label={getLabel('Nhiệt độ', ENVIRONMENT_METRIC_IDS.TEMPERATURE, '°C')}
                    value={temperature}
                    placeholder="--"
                    inputFormat={InputFormat.DECIMAL}
                    onChangeText={onTemperatureChange}
                    hint={getLimitError(temperature, ENVIRONMENT_METRIC_IDS.TEMPERATURE)}
                    reserveErrorSpace
                    containerStyle={styles.inputContainer}
                />

                <Input
                    label={getLabel('Độ mặn', ENVIRONMENT_METRIC_IDS.SALINITY, 'ppt')}
                    value={salinity}
                    placeholder="--"
                    inputFormat={InputFormat.DECIMAL}
                    onChangeText={onSalinityChange}
                    hint={getLimitError(salinity, ENVIRONMENT_METRIC_IDS.SALINITY)}
                    reserveErrorSpace
                    containerStyle={styles.inputContainer}
                />

                <Input
                    label={getLabel('Độ kiềm', ENVIRONMENT_METRIC_IDS.ALKALINITY, 'mg/L')}
                    value={alkalinity}
                    placeholder="--"
                    inputFormat={InputFormat.DECIMAL}
                    onChangeText={onAlkalinityChange}
                    hint={getLimitError(alkalinity, ENVIRONMENT_METRIC_IDS.ALKALINITY)}
                    reserveErrorSpace
                    containerStyle={styles.inputContainer}
                />

                <Input
                    label={getLabel('Độ trong', ENVIRONMENT_METRIC_IDS.TRANSPARENCY, 'cm')}
                    value={transparency}
                    placeholder="--"
                    inputFormat={InputFormat.DECIMAL}
                    onChangeText={onTransparencyChange}
                    hint={getLimitError(transparency, ENVIRONMENT_METRIC_IDS.TRANSPARENCY)}
                    reserveErrorSpace
                    containerStyle={styles.inputContainer}
                />

                {advancedParameters.length > 0 &&
                    advancedParameters.map(param => {
                        const paramValue = getAdvancedParameterValue(param.id);
                        const paramOnChange = getAdvancedParameterOnChange(param.id);
                        if (!paramOnChange) return null;

                        return (
                            <Input
                                key={param.id}
                                label={param.name}
                                value={paramValue}
                                placeholder="--"
                                inputFormat={InputFormat.DECIMAL}
                                onChangeText={paramOnChange}
                                hint={getLimitError(paramValue, param.id)}
                                reserveErrorSpace
                                containerStyle={styles.inputContainer}
                            />
                        );
                    })}

                {onSetupPress && (
                    <Button
                        title="Thiết lập chỉ số môi trường"
                        variant="outline"
                        onPress={onSetupPress}
                        renderLeftIcon={
                            <GearSix width={16} height={16} color={theme.textSecondary} />
                        }
                        style={styles.setupButton}
                    />
                )}
            </View>
        </SelectionInfoBox>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        errorBox: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.errorBackground || 'rgba(239, 68, 68, 0.1)',
            borderWidth: 1,
            borderColor: theme.error,
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
            color: theme.text,
            flex: 1,
        },
        inputContainer: {
            marginBottom: 0,
        },
        setupButton: {
            marginTop: 4,
        },
    });
