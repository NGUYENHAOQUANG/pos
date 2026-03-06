import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Dimensions,
} from 'react-native';
import { colors, spacing, borderRadius } from '@/styles';
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
    const [deviceCode, setDeviceCode] = useState('');

    const handleConnect = () => {
        if (onConnect) {
            onConnect(deviceCode);
        }
        setDeviceCode(''); // Reset after connect
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    {/* Flash Button positioned absolutely in the overlay */}
                    {onToggleFlash && (
                        <TouchableOpacity
                            style={styles.flashButton}
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
                        style={styles.keyboardView}
                    >
                        <TouchableWithoutFeedback>
                            <View
                                style={[
                                    styles.container,
                                    { height: Math.max(320, height * CARD_HEIGHT_RATIO) },
                                ]}
                            >
                                <View style={styles.header}>
                                    <Text style={styles.title}>Kết nối thiết bị - {pondName}</Text>
                                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                        <Ionicons name="close" size={24} color={colors.gray[400]} />
                                    </TouchableOpacity>
                                </View>
                                {/* ... rest of content */}

                                <View style={styles.content}>
                                    <TouchableOpacity style={styles.qrSection}>
                                        <BarcodeIcon
                                            width={32}
                                            height={32}
                                            style={{ marginRight: spacing.sm }}
                                        />
                                        <Text style={styles.qrText}>
                                            Quét mã trên thiết bị để kết nối
                                        </Text>
                                    </TouchableOpacity>

                                    <View style={styles.dividerContainer}>
                                        <View style={styles.dividerLine} />
                                        <Text style={styles.dividerText}>hoặc</Text>
                                        <View style={styles.dividerLine} />
                                    </View>

                                    <View style={styles.inputSection}>
                                        <Text style={styles.inputLabel}>Nhập mã thiết bị</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Nhập mã thiết bị"
                                            placeholderTextColor={colors.gray[400]}
                                            value={deviceCode}
                                            onChangeText={setDeviceCode}
                                        />
                                    </View>

                                    <Button
                                        title="Kết nối"
                                        onPress={handleConnect}
                                        variant="primary"
                                        style={styles.connectButton}
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

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'transparent',
        justifyContent: 'flex-end',
    },
    keyboardView: {
        width: '100%',
    },
    container: {
        backgroundColor: colors.white,
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
        borderBottomColor: colors.borderLight,
    },
    title: {
        flex: 1,
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
        textAlign: 'left',
        marginRight: spacing.sm,
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
        // Add shadow for better visibility on transparent/overlay bg
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
    qrText: {
        fontSize: 14,
        color: colors.text,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: colors.border,
    },
    dividerText: {
        marginHorizontal: spacing.md,
        color: colors.textSecondary,
        fontSize: 14,
    },
    inputSection: {
        // marginBottom removed
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '400',
        color: colors.text,
        marginBottom: 4,
    },
    input: {
        height: 48,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.sm,
        paddingHorizontal: spacing.md,
        fontSize: 16,
        color: colors.text,
    },
    connectButton: {
        width: '100%',
    },
});
