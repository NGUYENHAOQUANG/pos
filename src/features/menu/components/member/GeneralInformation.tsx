import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { borderRadius, spacing } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { Input } from '@/shared/components/forms/Input';
import {
    DropDownButtonBasic as DropDownButton,
    DropDownItem,
} from '@/features/farm/components/DropDownButtonBasic';

interface GeneralInformationProps {
    name: string;
    onNameChange: (text: string) => void;
    contact: string;
    onContactChange: (text: string) => void;
    zoneId?: string;
    onZoneIdChange?: (text: string) => void;
    zones?: DropDownItem[];
    disabled?: boolean;
}

export const GeneralInformation: React.FC<GeneralInformationProps> = ({
    name,
    onNameChange,
    contact,
    onContactChange,
    zoneId,
    onZoneIdChange,
    zones = [],
    disabled = false,
}) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Thông tin chung</Text>
            </View>

            {/* Form Content */}
            <View style={[styles.content, disabled && styles.disabledContent]}>
                {/* Name Input */}
                <Input
                    label="Tên"
                    required={true}
                    value={name}
                    onChangeText={onNameChange}
                    placeholder="Tên"
                    editable={!disabled}
                    disabled={disabled}
                />

                {/* Contact Input */}
                <Input
                    label="Số điện thoại hoặc Email"
                    required={true}
                    value={contact}
                    onChangeText={onContactChange}
                    placeholder="Số điện thoại hoặc Email"
                    editable={!disabled}
                    disabled={disabled}
                />

                {/* Zone Input */}
                <View style={{ marginBottom: spacing.md }}>
                    <Text style={styles.label}>Trại nuôi (Tùy chọn)</Text>
                    <DropDownButton
                        placeholder="Chọn trại nuôi"
                        data={zones}
                        value={zones.find(z => z.id.toString() === zoneId)}
                        onSelect={(item: DropDownItem) => onZoneIdChange?.(item.id.toString())}
                        disabled={disabled}
                    />
                </View>
            </View>
        </View>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            backgroundColor: theme.background,
            overflow: 'hidden',
            borderRadius: borderRadius.md,
            borderWidth: 1,
            borderColor: theme.defaultBorder,
        },
        header: {
            paddingTop: spacing.md,
            paddingHorizontal: spacing.md,
        },
        headerTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.text,
        },
        content: {
            padding: spacing.md,
            paddingBottom: 0,
        },
        disabledContent: {
            // opacity: 0.6, // Removed to keep text dark
        },
        label: {
            fontSize: 14,
            fontWeight: '500',
            color: theme.textSecondary,
            marginBottom: 8,
        },
    });
