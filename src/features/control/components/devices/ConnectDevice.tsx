import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    Modal,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Dimensions,
} from 'react-native';
import { TextInput } from '@/shared/components/typography/AppTextInput';
import { Text } from '@/shared/components/typography/Text';
import { spacing, borderRadius } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { Button } from '@/shared/components/buttons/Button';
import Ionicons from 'react-native-vector-icons/Ionicons';
import BarcodeIcon from '@/assets/Icon/IconDevices/Barcode.svg';

const { height } = Dimensions.get('window');
const CARD_HEIGHT_RATIO = 360 / 812;

interface ConnectDeviceProps {
    visible: boolean;
    onClose: () => void;
    pondName: string;
    onConnect?: (deviceCode: string) => void;
    isFlashOn?: boolean;
    onToggleFlash?: () => void;
}

export const ConnectDevice: React.FC<ConnectDeviceProps> = ({
    visible,
    onClose,
    pondName,
    onConnect,
    isFlashOn,
    onToggleFlash,
}) => {
    const theme = useAppTheme();
    const themedStyles = getStyles(theme);
    const [deviceCode, setDeviceCode] = useState('');

    const handleConnect = () => {
        if (onConnect) {
            onConnect(deviceCode);
        }
        setDeviceCode('');
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={staticStyles.overlay}>
                    {/* Flash Button positioned absolutely in the overlay */}
                    {onToggleFlash && (
                        <TouchableOpacity
                            style={staticStyles.flashButton}
                            onPress={onToggleFlash}
                            activeOpacity={0.8}
                        >
                            <Ionicons
                                name={isFlashOn ? 'flash' : 'flash-outline'}
                                size={24}
                                color="black"
                            />
                        </TouchableOpacity>
                    )}

                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={staticStyles.keyboardView}
                    >
                        <TouchableWithoutFeedback>
                            <View
                                style={[
                                    themedStyles.container,
                                    { height: Math.max(320, height * CARD_HEIGHT_RATIO) },
                                ]}
                            >
                                <View style={themedStyles.header}>
                                    <Text style={themedStyles.title}>
                                        Kết nối thiết bị - {pondName}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={onClose}
                                        style={staticStyles.closeButton}
                                    >
                                        <Ionicons
                                            name="close"
                                            size={24}
                                            color={theme.textSecondary}
                                        />
                                    </TouchableOpacity>
                                </View>

                                <View style={staticStyles.content}>
                                    <TouchableOpacity style={staticStyles.qrSection}>
                                        <BarcodeIcon
                                            width={32}
                                            height={32}
                                            style={{ marginRight: spacing.sm }}
                                        />
                                        <Text style={themedStyles.qrText}>
                                            Quét mã trên thiết bị để kết nối
                                        </Text>
                                    </TouchableOpacity>

                                    <View style={staticStyles.dividerContainer}>
                                        <View style={themedStyles.dividerLine} />
                                        <Text style={themedStyles.dividerText}>hoặc</Text>
                                        <View style={themedStyles.dividerLine} />
                                    </View>

                                    <View style={staticStyles.inputSection}>
                                        <Text style={themedStyles.inputLabel}>
                                            Nhập mã thiết bị
                                        </Text>
                                        <TextInput
                                            style={themedStyles.input}
                                            placeholder="Nhập mã thiết bị"
                                            placeholderTextColor={theme.textSecondary}
                                            value={deviceCode}
                                            onChangeText={setDeviceCode}
                                        />
                                    </View>

                                    <Button
                                        title="Kết nối"
                                        onPress={handleConnect}
                                        variant="primary"
                                        style={staticStyles.connectButton}
                                        disabled={!deviceCode}
                                    />
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </KeyboardAvoidingView>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

// Static styles
const staticStyles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'transparent',
        justifyContent: 'flex-end',
    },
    keyboardView: {
        width: '100%',
    },
    closeButton: {
        padding: 4,
        marginTop: -4,
    },
    content: {
        padding: spacing.md,
        flex: 1,
        justifyContent: 'space-around',
    },
    flashButton: {
        position: 'absolute',
        top: Platform.select({
            ios: 60,
            android: 24,
            default: 24,
        }),
        right: 20,
        width: 40,
        height: 40,
        borderRadius: borderRadius.full,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    qrSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    inputSection: {},
    connectButton: {
        width: '100%',
    },
});

// Dynamic styles
const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            backgroundColor: theme.background,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            paddingBottom: Platform.OS === 'ios' ? 40 : 24,
            width: '100%',
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            padding: spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: theme.borderLight,
        },
        title: {
            flex: 1,
            fontSize: 16,
            fontWeight: '700',
            color: theme.text,
            textAlign: 'left',
            marginRight: spacing.sm,
        },
        qrText: {
            fontSize: 14,
            color: theme.text,
        },
        dividerLine: {
            flex: 1,
            height: 1,
            backgroundColor: theme.border,
        },
        dividerText: {
            marginHorizontal: spacing.md,
            color: theme.textSecondary,
            fontSize: 14,
        },
        inputLabel: {
            fontSize: 14,
            fontWeight: '400',
            color: theme.text,
            marginBottom: 4,
        },
        input: {
            height: 48,
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: borderRadius.sm,
            paddingHorizontal: spacing.md,
            fontSize: 16,
            color: theme.text,
        },
    });
