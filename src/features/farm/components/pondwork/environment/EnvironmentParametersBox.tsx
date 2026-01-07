import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius } from '@/styles';
import { SelectionInfoBox } from '@/features/farm/components/pondwork/SelectionInfoBox';
import { IconError } from '@/assets/icons';
import { FarmInput } from '@/features/farm/components/pondwork/FarmInput';

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
    // Map advanced parameter IDs to render fields
    const getAdvancedParameterValue = (id: string): string => {
        if (id === '7') return kali;
        if (id === '8') return tan;
        if (id === '9') return magie;
        if (id === '10') return no3;
        return '';
    };

    const getAdvancedParameterOnChange = (id: string): ((value: string) => void) | undefined => {
        if (id === '7') return onKaliChange;
        if (id === '8') return onTanChange;
        if (id === '9') return onMagieChange;
        if (id === '10') return onNo3Change;
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
            <View style={styles.inputsContainer}>
                {/* Row 1 */}
                <View style={styles.row}>
                    <View style={styles.column}>
                        <FarmInput
                            label="pH (1-14)"
                            value={pH}
                            keyboardType="default"
                            onChangeText={text => handleNumericInput(text, onPHChange)}
                        />
                    </View>
                    <View style={styles.column}>
                        <FarmInput
                            label="DO (mg/L)"
                            value={doValue}
                            keyboardType="default"
                            onChangeText={text => handleNumericInput(text, onDOChange)}
                        />
                    </View>
                </View>

                {/* Row 2 */}
                <View style={styles.row}>
                    <View style={styles.column}>
                        <FarmInput
                            label="Nhiệt độ (°C)"
                            value={temperature}
                            keyboardType="default"
                            onChangeText={text => handleNumericInput(text, onTemperatureChange)}
                        />
                    </View>
                    <View style={styles.column}>
                        <FarmInput
                            label="Độ mặn (ppt)"
                            value={salinity}
                            keyboardType="default"
                            onChangeText={text => handleNumericInput(text, onSalinityChange)}
                        />
                    </View>
                </View>

                {/* Row 3 */}
                <View style={styles.row}>
                    <View style={styles.column}>
                        <FarmInput
                            label="Độ kiềm (mg/L)"
                            value={alkalinity}
                            keyboardType="default"
                            onChangeText={text => handleNumericInput(text, onAlkalinityChange)}
                        />
                    </View>
                    <View style={styles.column}>
                        <FarmInput
                            label="Độ trong (cm)"
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

                        return (
                            <View key={param.id} style={styles.fullWidthRow}>
                                <FarmInput
                                    label={param.name}
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
    inputsContainer: {
        gap: spacing.md,
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
