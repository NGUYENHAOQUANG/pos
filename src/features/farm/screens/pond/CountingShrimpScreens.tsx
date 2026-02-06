import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, borderRadius } from '@/styles';
import { HeaderFarm } from '@/features/farm/components/HeaderFarm';
import { ButtonBarFarm } from '@/features/farm/components/ButtonBarFarm';
import { Input } from '@/shared/components/forms/Input';
import { ImageUpload } from '@/shared/components/forms/ImageUpload';
import { Loading } from '@/shared/components/ui/Loading';
import { documentApi } from '@/features/material/api/documentApi';

const CountingShrimpScreen: React.FC = () => {
    const navigation = useNavigation();
    const [result, _setResult] = useState<string>('0');
    const [imageUri, _setImageUri] = useState<string | null>(null);
    const [countTimes, _setCountTimes] = useState(0);

    // Calculate count from current image to add later
    const [currentImageCount, setCurrentImageCount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = () => {
        // Return accumulated count to previous screen
        (navigation as any).navigate({
            name: 'CreateCycle',
            params: { aiCount: parseInt(result || '0') },
            merge: true,
        });
    };

    const handleImageSelect = async (uri: string, base64?: string) => {
        _setImageUri(uri);

        if (uri && base64) {
            try {
                setIsLoading(true);
                const fileName = uri.split('/').pop() || `image_${Date.now()}.jpg`;
                const contentType = 'image/jpeg';

                console.log('Request Payload Info:', {
                    fileName,
                    contentType,
                    storageType: 'Azure',
                    base64Length: base64.length,
                });

                const response = await documentApi.uploadBase64({
                    base64Content: base64,
                    fileName: fileName,
                    contentType: contentType,
                    storageType: 'Azure',
                });

                if (response && response.length > 0) {
                    const documentId = response[0].id;
                    console.log('Upload ID:', documentId);

                    Alert.alert('Thành công', `Đã upload ảnh.\nID: ${documentId}`);
                } else {
                    console.warn('Không tìm thấy ID trong response:', response);
                }
            } catch (error: any) {
                console.error('Upload thất bại:', error);
                Alert.alert('Lỗi', 'Không thể upload ảnh');
            } finally {
                setIsLoading(false);
            }
        }

        // Reset count logic if needed
        setCurrentImageCount(0);
    };

    const handleGetCount = () => {
        if (!imageUri) {
            Alert.alert('Chưa có ảnh', 'Vui lòng chụp hoặc chọn ảnh trước khi lấy số lượng.');
            return;
        }
        Alert.alert('Info', 'Logic đếm tôm sẽ được tích hợp với API sau.');
    };

    return (
        <View style={styles.container}>
            <Loading isLoading={isLoading}>
                <HeaderFarm
                    title="Kiểm đếm tôm giống bằng AI"
                    onBack={() => navigation.goBack()}
                    type="simple"
                />

                <View style={styles.content}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={styles.card}>
                            <View style={styles.section}>
                                <Text style={styles.label}>
                                    <Text style={styles.required}>* </Text>Tổng số lượng thả (PLs) -
                                    AI
                                </Text>
                                <Input
                                    placeholder="0"
                                    value={result}
                                    editable={false}
                                    inputContainerStyle={styles.resultInput}
                                />
                                <Text style={styles.helperText}>Số lần cộng dồn: {countTimes}</Text>
                            </View>

                            <View style={styles.section}>
                                <ImageUpload
                                    label="Hình ảnh"
                                    imageUri={imageUri}
                                    onImageSelect={handleImageSelect}
                                    onImageRemove={() => _setImageUri(null)}
                                    returnBase64={true}
                                />
                            </View>

                            <View style={styles.actionButtonsRow}>
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => {
                                        _setResult('0');
                                        _setCountTimes(0);
                                        setCurrentImageCount(0);
                                        _setImageUri(null);
                                    }}
                                >
                                    <Text style={styles.actionButtonText}>Đếm lại</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={handleGetCount}
                                >
                                    <Text style={styles.actionButtonText}>
                                        {countTimes === 0
                                            ? 'Lấy số lượng'
                                            : `Cộng dồn (${currentImageCount})`}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.countTimesText}>Số lần đếm: {countTimes}</Text>
                        </View>
                    </ScrollView>
                </View>

                <ButtonBarFarm
                    primaryTitle="Lưu và Quay lại"
                    secondaryTitle="Hủy"
                    onPrimaryPress={handleSave}
                    onSecondaryPress={() => navigation.goBack()}
                    secondaryType="default"
                />
            </Loading>
        </View>
    );
};

export default CountingShrimpScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
    },
    content: {
        flex: 1,
    },
    section: {
        marginBottom: spacing.md,
    },
    label: {
        fontSize: 14,
        color: colors.text,
        marginBottom: spacing.xs,
        fontWeight: '400',
    },
    required: {
        color: colors.red[500],
    },
    resultInput: {
        backgroundColor: colors.white,
    },
    helperText: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
    imageUploadContainer: {
        width: '100%',
        aspectRatio: 1,
        backgroundColor: colors.gray[200],
        borderRadius: borderRadius.md,
        overflow: 'hidden',
        position: 'relative', // Ensure relative positioning for overlay
    },
    uploadPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: borderRadius.md,
    },
    uploadedImage: {
        width: '100%',
        height: '100%',
    },
    plusIconContainer: {
        width: '50%',
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: colors.gray[400],
        borderStyle: 'dashed',
        borderRadius: borderRadius.md,
    },
    plusIconText: {
        fontSize: 40,
        color: colors.textSecondary,
        fontWeight: '300',
    },
    actionButtonsRow: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    actionButton: {
        flex: 1,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.gray[300],
        borderRadius: borderRadius.sm,
        paddingVertical: spacing.sm,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionButtonText: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '500',
    },
    countTimesText: {
        fontSize: 16,
        color: colors.text,
    },
    card: {
        backgroundColor: colors.white,
        padding: spacing.md,
        marginTop: 8,
    },
});
