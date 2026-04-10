import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HeaderSection } from '@/shared/components/layout/HeaderSection';
import { useAppTheme } from '@/styles/themeContext';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import { ENV } from '@/core/config/env';
import { AppToast } from '@/features/farm/utils/toastMessages';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

type SourceType = 'sop' | 'faq' | 'guide' | 'manual';
const SOURCE_TYPES: { value: SourceType; label: string }[] = [
    { value: 'sop', label: 'SOP' },
    { value: 'faq', label: 'FAQ' },
    { value: 'guide', label: 'Guide' },
    { value: 'manual', label: 'Manual' },
];

export const IngestScreen: React.FC = () => {
    const insets = useSafeAreaInsets();
    const theme = useAppTheme();

    const [selectedFile, setSelectedFile] = useState<{
        uri: string;
        name: string;
        type: string;
    } | null>(null);
    const [sourceType, setSourceType] = useState<SourceType>('sop');
    const [farmId, setFarmId] = useState('');
    const [loading, setLoading] = useState(false);

    // Mock function to simulate file selection since document picker is currently removed
    const handleSelectFile = () => {
        setSelectedFile({
            uri: 'file://mock/path/to/document.pdf',
            name: 'document_mock.pdf',
            type: 'application/pdf',
        });
        AppToast({
            type: 'success',
            text1: 'Mô phỏng đính kèm',
            text2: 'Đã chọn file ảo document_mock.pdf',
        });
    };

    const handleClearFile = () => {
        setSelectedFile(null);
    };

    const handleSubmit = async () => {
        if (!selectedFile) {
            AppToast({
                type: 'error',
                text1: 'Lỗi xác thực',
                text2: 'Vui lòng chọn file nạp dữ liệu (Required)',
            });
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();

            // Append binary file
            formData.append('file', {
                uri: selectedFile.uri,
                name: selectedFile.name,
                type: selectedFile.type,
            } as any);

            // Append required source_type
            formData.append('source_type', sourceType);

            // Append optional farm_id
            if (farmId.trim()) {
                formData.append('farm_id', farmId.trim());
            }

            const response = await fetch(`${ENV.CHATBOT_API_URL}${API_ENDPOINTS.CHATBOT.INGEST}`, {
                method: 'POST',
                // Fetch takes care of generating the correct boundary for multipart/form-data
                body: formData,
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => null);
                console.error('Server error response:', errData);
                throw new Error(`HTTP ${response.status}`);
            }

            AppToast({
                type: 'success',
                text1: 'Thành công',
                text2: 'Đã nạp file dữ liệu vào Backend',
            });

            // Reset form on success
            setSelectedFile(null);
            setFarmId('');
        } catch (error: any) {
            console.error('Ingest API Error:', error);
            AppToast({
                type: 'error',
                text1: 'Lỗi',
                text2: `Không thể nạp dữ liệu: ${error.message}`,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: theme.backgroundPrimary }]}
            behavior="padding"
        >
            <HeaderSection title="Ingest" showBackButton />

            <ScrollView style={styles.formContainer} contentContainerStyle={styles.formContent}>
                {/* 1. File Upload (Required) */}
                <View style={styles.fieldSection}>
                    <Text style={[styles.fieldLabel, { color: theme.text }]}>
                        File Đính Kèm <Text style={{ color: theme.error }}>*</Text>
                    </Text>
                    <Text style={[styles.fieldHint, { color: theme.textTertiary }]}>
                        Định dạng binary
                    </Text>

                    {!selectedFile ? (
                        <TouchableOpacity
                            style={[
                                styles.uploadBox,
                                { borderColor: theme.border, backgroundColor: theme.background },
                            ]}
                            onPress={handleSelectFile}
                            activeOpacity={0.7}
                        >
                            <MaterialCommunityIcons
                                name="cloud-upload-outline"
                                size={32}
                                color={theme.textSecondary}
                            />
                            <Text style={[styles.uploadText, { color: theme.textSecondary }]}>
                                Nhấn để chọn file (Mock)
                            </Text>
                        </TouchableOpacity>
                    ) : (
                        <View
                            style={[
                                styles.fileCard,
                                {
                                    backgroundColor: theme.backgroundSecondary,
                                    borderColor: theme.border,
                                },
                            ]}
                        >
                            <MaterialCommunityIcons
                                name="file-document-outline"
                                size={24}
                                color={theme.primaryOrange}
                            />
                            <Text
                                style={[styles.fileName, { color: theme.text }]}
                                numberOfLines={1}
                            >
                                {selectedFile.name}
                            </Text>
                            <TouchableOpacity onPress={handleClearFile} style={styles.clearFileBtn}>
                                <MaterialCommunityIcons
                                    name="close-circle"
                                    size={20}
                                    color={theme.textTertiary}
                                />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* 2. Source Type (Required) */}
                <View style={styles.fieldSection}>
                    <Text style={[styles.fieldLabel, { color: theme.text }]}>
                        Source Type <Text style={{ color: theme.error }}>*</Text>
                    </Text>
                    <Text style={[styles.fieldHint, { color: theme.textTertiary }]}>
                        Định dạng tài liệu
                    </Text>

                    <View style={styles.pillContainer}>
                        {SOURCE_TYPES.map(type => {
                            const isSelected = sourceType === type.value;
                            return (
                                <TouchableOpacity
                                    key={type.value}
                                    style={[
                                        styles.pill,
                                        {
                                            backgroundColor: isSelected
                                                ? theme.primaryOrange
                                                : theme.backgroundSecondary,
                                            borderColor: isSelected
                                                ? theme.primaryOrange
                                                : theme.border,
                                        },
                                    ]}
                                    onPress={() => setSourceType(type.value)}
                                >
                                    <Text
                                        style={[
                                            styles.pillText,
                                            { color: isSelected ? '#FFF' : theme.text },
                                        ]}
                                    >
                                        {type.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* 3. Farm ID (Optional) */}
                <View style={styles.fieldSection}>
                    <Text style={[styles.fieldLabel, { color: theme.text }]}>Farm ID</Text>
                    <Text style={[styles.fieldHint, { color: theme.textTertiary }]}>
                        ID Trại (Tùy chọn)
                    </Text>

                    <View
                        style={[
                            styles.inputWrapper,
                            {
                                backgroundColor: theme.backgroundSecondary,
                                borderColor: theme.border,
                            },
                        ]}
                    >
                        <TextInput
                            style={[styles.input, { color: theme.text }]}
                            placeholder="Nhập Farm ID (nếu có)"
                            placeholderTextColor={theme.textTertiary}
                            value={farmId}
                            onChangeText={setFarmId}
                        />
                    </View>
                </View>
            </ScrollView>

            <View
                style={[
                    styles.footer,
                    {
                        paddingBottom: Math.max(insets.bottom, 16),
                        backgroundColor: theme.background,
                        borderTopColor: theme.border,
                    },
                ]}
            >
                <TouchableOpacity
                    style={[
                        styles.submitButton,
                        { backgroundColor: selectedFile ? theme.primaryOrange : theme.gray[300] },
                    ]}
                    onPress={handleSubmit}
                    disabled={!selectedFile || loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFF" size="small" />
                    ) : (
                        <Text style={styles.submitButtonText}>Thực thi Ingest / Nạp dữ liệu</Text>
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    formContainer: {
        flex: 1,
    },
    formContent: {
        padding: 20,
    },
    fieldSection: {
        marginBottom: 24,
    },
    fieldLabel: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 4,
    },
    fieldHint: {
        fontSize: 12,
        marginBottom: 12,
    },
    uploadBox: {
        borderWidth: 1,
        borderStyle: 'dashed',
        borderRadius: 12,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    uploadText: {
        marginTop: 8,
        fontSize: 14,
        fontWeight: '500',
    },
    fileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    fileName: {
        flex: 1,
        marginLeft: 12,
        fontSize: 14,
        fontWeight: '500',
    },
    clearFileBtn: {
        padding: 4,
    },
    pillContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    pill: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
    },
    pillText: {
        fontSize: 14,
        fontWeight: '500',
    },
    inputWrapper: {
        borderWidth: 1,
        borderRadius: 12,
        overflow: 'hidden',
    },
    input: {
        height: 48,
        paddingHorizontal: 16,
        fontSize: 15,
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
    },
    submitButton: {
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    submitButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
