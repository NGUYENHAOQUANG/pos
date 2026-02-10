import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius } from '@/styles';
import { SelectionInfoBox } from '@/features/farm/components/pondwork/SelectionInfoBox';
import { IconError } from '@/assets/icons';
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
    limits?: Record<string, string>; // ID -> Limit string (e.g., "7.5 - 8.5")
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
    return (
        <SelectionInfoBox title="Chỉ số môi trường">
            {showError && (
                <View style={styles.errorBox}>
                    <IconError width={16} height={16} />
                    <Text style={styles.errorText}>Vui lòng nhập ít nhất 1 chỉ số</Text>
                </View>
            )}
            <View>
                {/* Row 1 */}
                <View style={styles.row}>
                    <View style={styles.column}>
                        <Input
                            label={getLabel('pH', ENVIRONMENT_METRIC_IDS.PH)}
                            value={pH}
                            keyboardType="default"
                            onChangeText={text => handleNumericInput(text, onPHChange)}
                        />
                    </View>
                    <View style={styles.column}>
                        <Input
                            label={getLabel('DO', ENVIRONMENT_METRIC_IDS.DO, 'mg/L')}
                            value={doValue}
                            keyboardType="default"
                            onChangeText={text => handleNumericInput(text, onDOChange)}
                        />
                    </View>
                </View>

                {/* Row 2 */}
                <View style={styles.row}>
                    <View style={styles.column}>
                        <Input
                            label={getLabel('Nhiệt độ', ENVIRONMENT_METRIC_IDS.TEMPERATURE, '°C')}
                            value={temperature}
                            keyboardType="default"
                            onChangeText={text => handleNumericInput(text, onTemperatureChange)}
                        />
                    </View>
                    <View style={styles.column}>
                        <Input
                            label={getLabel('Độ mặn', ENVIRONMENT_METRIC_IDS.SALINITY, 'ppt')}
                            value={salinity}
                            keyboardType="default"
                            onChangeText={text => handleNumericInput(text, onSalinityChange)}
                        />
                    </View>
                </View>

                {/* Row 3 */}
                <View style={styles.row}>
                    <View style={styles.column}>
                        <Input
                            label={getLabel('Độ kiềm', ENVIRONMENT_METRIC_IDS.ALKALINITY, 'mg/L')}
                            value={alkalinity}
                            keyboardType="default"
                            onChangeText={text => handleNumericInput(text, onAlkalinityChange)}
                        />
                    </View>
                    <View style={styles.column}>
                        <Input
                            label={getLabel('Độ trong', ENVIRONMENT_METRIC_IDS.TRANSPARENCY, 'cm')}
                            value={transparency}
                            keyboardType="default"
                            onChangeText={text => handleNumericInput(text, onTransparencyChange)}
                        />
                    </View>
                </View>

                {/* Advanced Parameters */}
                {advancedParameters.length > 0 &&
                    advancedParameters.map(param => {
                        const paramValue = getAdvancedParameterValue(param.id);
                        const paramOnChange = getAdvancedParameterOnChange(param.id);
                        if (!paramOnChange) return null;

                        // Advanced params usually come as "Name (Unit)" (e.g. "Kali (mg/L)")
                        // If limit exists using same logic:
                        // const limit = limits[param.id];
                        let label = param.name;

                        // if (limit) {
                        //     // Extract unit if present in (...)
                        //     const match = param.name.match(/\((.*?)\)/);
                        //     const unit = match ? match[1] : '';
                        //     const baseName = param.name.split(' (')[0];
                        //     label = `${baseName} (${limit} ${unit})`.trim().replace(' )', ')');
                        // }

                        return (
                            <View key={param.id} style={styles.fullWidthRow}>
                                <Input
                                    label={label}
                                    value={paramValue}
                                    keyboardType="default"
                                    onChangeText={text => handleNumericInput(text, paramOnChange)}
                                />
                            </View>
                        );
                    })}
            </View>

            <View style={styles.divider} />

            {/* Setup Button */}
            {onSetupPress && (
                <TouchableOpacity
                    style={styles.setupButton}
                    onPress={onSetupPress}
                    activeOpacity={0.8}
                >
                    <Ionicons name="settings-outline" size={16} color={colors.primary} />
                    <Text style={styles.setupButtonText}>Thiết lập chỉ số môi trường</Text>
                </TouchableOpacity>
            )}
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
    divider: {
        height: 1,
        backgroundColor: colors.borderLight,
        marginHorizontal: -spacing.md,
    },
    setupButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.primary,
        borderRadius: 6,
        paddingVertical: spacing.xs,
        gap: spacing.sm,
        height: 32,
    },
    setupButtonText: {
        fontSize: 14,
        fontWeight: '400',
        color: colors.primary,
        lineHeight: 22,
    },
});
