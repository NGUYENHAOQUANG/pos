import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, borderRadius } from '@/styles';
import { HeaderFarm } from '@/features/farm/components/HeaderFarm';
import { ButtonBarFarm } from '@/features/farm/components/ButtonBarFarm';
import { Input } from '@/shared/components/forms/Input';
import { ImageUpload } from '@/shared/components/forms/ImageUpload';
import { Loading } from '@/shared/components/ui/Loading';
import { aiApi } from '@/features/farm/api/aiApi';
import Toast from 'react-native-toast-message';
import { ConfirmationModal } from '@/shared/components/modal/ConfirmationModal';
import { DotingOverlay, DetectionDot } from '@/features/farm/components/boderbox/DotingOverlay';
import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';

const CountingShrimpScreen: React.FC = () => {
    const navigation = useNavigation();
    const [result, _setResult] = useState<string>('0');
    const [imageUri, _setImageUri] = useState<string | null>(null);
    const [countTimes, _setCountTimes] = useState(0);
    const [previousTotal, setPreviousTotal] = useState(0);
    const [isCountAdded, setIsCountAdded] = useState(false);

    // Calculate count from current image to add later
    const [currentImageCount, setCurrentImageCount] = useState<number>(0);
    const [base64Image, setBase64Image] = useState<string | null>(null);
    const [isProcessed, setIsProcessed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isConfirmVisible, setIsConfirmVisible] = useState(false);
    const [detections, setDetections] = useState<DetectionDot[]>([]);
    const [imageDimensions, setImageDimensions] = useState({ width: 1, height: 1 });
    const [displayDimensions, setDisplayDimensions] = useState({ width: 1, height: 1 });

    const handleSave = () => {
        // Return accumulated count to previous screen
        (navigation as any).navigate({
            name: 'CreateCycle',
            params: { aiCount: parseInt(result || '0') },
            merge: true,
        });
    };

    const handleImageSelect = async (
        uri: string,
        base64?: string,
        _file?: { fileName: string; type: string },
        dimensions?: { width: number; height: number }
    ) => {
        _setImageUri(uri);
        if (base64) setBase64Image(base64);

        // Set dimensions immediately if available from asset (best for mapping AI coords)
        if (dimensions && dimensions.width > 0 && dimensions.height > 0) {
            setImageDimensions(dimensions);
        } else {
            // If dimensions missing, fetch them for overlay scaling
            Image.getSize(
                uri,
                (width, height) => {
                    console.log(`DEBUG: Fallback Image.getSize: ${width}x${height}`);
                    setImageDimensions({ width, height });
                },
                error => console.error('Failed to get image size:', error)
            );
        }

        // Reset current image specific states
        setDetections([]);
        setCurrentImageCount(0);
        setIsCountAdded(false);
        setIsProcessed(false);
    };

    const handleStartCounting = async () => {
        if (!base64Image || !imageUri) return;
        setIsLoading(true);
        try {
            console.log('DEBUG: Calling Base64 endpoint...');
            const fileName = imageUri.split('/').pop() || `image_${Date.now()}.jpg`;
            const payload = {
                base64Content: base64Image,
                fileName: fileName,
                contentType: 'image/jpeg',
                storageType: 'Azure',
            };

            // Step 1: Upload to get document ID
            const response = await apiClient.post(API_ENDPOINTS.DOCUMENT.UPLOAD_BASE64, payload);
            const data = response.data as any;

            // Get ID from Base64 response
            const documentId = data?.data?.document?.id;

            if (!documentId) {
                throw new Error('Could not retrieve document ID from uploaded image.');
            }

            // Step 2: Call AI API with documentId
            console.log('DEBUG: Calling AI API with documentId:', documentId);
            const aiResponse = await aiApi.countSeedstock({ documentId: documentId });
            console.log('DEBUG: AI Response:', JSON.stringify(aiResponse, null, 2));

            const count = aiResponse?.total_count || 0;
            setCurrentImageCount(count);

            if (
                aiResponse?.detections &&
                Array.isArray(aiResponse.detections) &&
                aiResponse.detections.length > 0
            ) {
                console.log(`DEBUG: Processing ${aiResponse.detections.length} detections...`);
                try {
                    const newDetections: DetectionDot[] = aiResponse.detections
                        .map((d: any, index: number) => {
                            if (!d || !d.center) {
                                return null;
                            }
                            return {
                                id: d.id || index,
                                center: {
                                    x: d.center.x,
                                    y: d.center.y,
                                },
                            };
                        })
                        .filter((d: any): d is DetectionDot => d !== null);

                    setDetections(newDetections);
                } catch (mapError) {
                    console.error('DEBUG: Error mapping detections:', mapError);
                }
            } else {
                setDetections([]);
            }
            setIsProcessed(true);
        } catch (error: any) {
            console.error('Base64 processing failed:', error);
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Không thể xử lý ảnh này',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleGetCount = () => {
        if (!imageUri) {
            Alert.alert('Chưa có ảnh', 'Vui lòng chụp hoặc chọn ảnh trước khi lấy số lượng.');
            return;
        }

        if (isCountAdded) {
            return;
        }

        // Case 1: First time count
        if (countTimes === 0) {
            setPreviousTotal(0);
            _setResult(currentImageCount.toString());
            _setCountTimes(1);
        } else {
            // Case 2: Accumulate count
            const currentTotal = parseInt(result || '0');
            setPreviousTotal(currentTotal);
            const newTotal = currentTotal + currentImageCount;
            _setResult(newTotal.toString());
            _setCountTimes(prev => prev + 1);
        }
        setIsCountAdded(true);
    };

    const handleReset = () => {
        setIsConfirmVisible(true);
    };

    const confirmReset = () => {
        // Case 3: Re-count / Reset
        if (currentImageCount > 0) {
            _setResult(currentImageCount.toString());
            _setCountTimes(1);
            setPreviousTotal(0);
            setIsCountAdded(true);
        } else {
            _setResult('0');
            _setCountTimes(0);
            setPreviousTotal(0);
            setIsCountAdded(false);
        }

        setIsConfirmVisible(false);
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
                                <Text style={styles.helperText}>
                                    Lần đếm trước: {previousTotal}
                                </Text>
                            </View>

                            <View
                                style={styles.imageWrapper}
                                onLayout={event => {
                                    const { width, height } = event.nativeEvent.layout;
                                    setDisplayDimensions({ width, height });
                                }}
                            >
                                <ImageUpload
                                    label="Hình ảnh xử lý"
                                    imageUri={imageUri}
                                    onImageSelect={handleImageSelect}
                                    onImageRemove={() => {
                                        _setImageUri(null);
                                        setBase64Image(null);
                                        setDetections([]);
                                        setCurrentImageCount(0);
                                        setIsCountAdded(false);
                                        setIsProcessed(false);
                                        setImageDimensions({ width: 1, height: 1 });
                                    }}
                                    returnBase64={true}
                                    aspectRatio={
                                        imageDimensions.width > 0 && imageDimensions.height > 0
                                            ? imageDimensions.width / imageDimensions.height
                                            : 1
                                    }
                                >
                                    {imageUri && detections.length > 0 && (
                                        <DotingOverlay
                                            detections={detections}
                                            displayWidth={displayDimensions.width}
                                            displayHeight={
                                                displayDimensions.width /
                                                (imageDimensions.width / imageDimensions.height)
                                            }
                                            originalWidth={imageDimensions.width}
                                            originalHeight={imageDimensions.height}
                                        />
                                    )}
                                </ImageUpload>
                            </View>

                            <View style={styles.actionButtonsRow}>
                                <TouchableOpacity
                                    onPress={handleReset}
                                    disabled={countTimes === 0}
                                    style={[
                                        styles.actionButton,
                                        countTimes === 0 && styles.disabledButton,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.actionButtonText,
                                            countTimes === 0 && styles.disabledButtonText,
                                        ]}
                                    >
                                        Đếm lại
                                    </Text>
                                </TouchableOpacity>
                                {(() => {
                                    const isStartCountingMode = !!imageUri && !isProcessed;
                                    const isDisabled =
                                        !isStartCountingMode &&
                                        (isCountAdded || currentImageCount === 0);

                                    return (
                                        <TouchableOpacity
                                            style={[
                                                styles.actionButton,
                                                isDisabled && styles.disabledButton,
                                            ]}
                                            onPress={
                                                isStartCountingMode
                                                    ? handleStartCounting
                                                    : handleGetCount
                                            }
                                            disabled={isDisabled}
                                        >
                                            <Text
                                                style={[
                                                    styles.actionButtonText,
                                                    isDisabled && styles.disabledButtonText,
                                                ]}
                                            >
                                                {isStartCountingMode
                                                    ? 'Bắt đầu đếm'
                                                    : countTimes === 0
                                                    ? `Lấy số lượng ${
                                                          currentImageCount > 0
                                                              ? `(${currentImageCount})`
                                                              : ''
                                                      }`
                                                    : `Cộng dồn (${currentImageCount})`}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })()}
                            </View>

                            <Text style={styles.countTimesText}>Số lần đếm: {countTimes}</Text>

                            <ConfirmationModal
                                visible={isConfirmVisible}
                                onConfirm={confirmReset}
                                onCancel={() => setIsConfirmVisible(false)}
                                type="transfer"
                                title="Xác nhận đếm lại"
                                message={
                                    <Text style={styles.message}>
                                        <Text style={{ color: colors.red[500] }}>* </Text>
                                        Đếm lại sẽ ghi đè lên TẤT CẢ các lần đếm trước đó, bạn có
                                        chắc chắn muốn đếm lại
                                    </Text>
                                }
                                confirmText="Đồng ý"
                                cancelText="Hủy"
                            />
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
        fontSize: 14,
        color: colors.text,
        marginTop: spacing.xs,
    },
    imageUploadContainer: {
        width: '100%',
        aspectRatio: 1,
        backgroundColor: colors.gray[200],
        borderRadius: borderRadius.md,
        overflow: 'hidden',
        position: 'relative',
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
    message: {
        fontSize: 14,
        fontWeight: '400',
        color: colors.text,
        lineHeight: 22,
    },
    imageWrapper: {
        width: '100%',
        position: 'relative',
    },
    disabledButton: {
        backgroundColor: colors.gray[100],
        borderColor: colors.gray[200],
    },
    disabledButtonText: {
        color: colors.textSecondary,
    },
});
