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
import Toast from 'react-native-toast-message';
import { ConfirmationModal } from '@/shared/components/modal/ConfirmationModal';
import { DotingOverlay, DetectionDot } from '@/features/farm/components/boderbox/DotingOverlay';

const CountingShrimpScreen: React.FC = () => {
    const navigation = useNavigation();
    const [result, _setResult] = useState<string>('0');
    const [imageUri, _setImageUri] = useState<string | null>(null);
    const [countTimes, _setCountTimes] = useState(0);
    const [previousTotal, setPreviousTotal] = useState(0);
    const [isCountAdded, setIsCountAdded] = useState(false);

    // Calculate count from current image to add later
    const [currentImageCount, setCurrentImageCount] = useState<number>(0);
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

    const handleImageSelect = async (uri: string, base64?: string) => {
        _setImageUri(uri);
        // Reset current image specific states
        setDetections([]);
        setCurrentImageCount(0);
        setIsCountAdded(false);

        if (uri && base64) {
            try {
                setIsLoading(true);

                // --- RESTORED API CALL FOR DEBUGGING ---
                const fileName = uri.split('/').pop() || `image_${Date.now()}.jpg`;
                const contentType = 'image/jpeg'; // Assuming jpeg/png based on camera/library

                console.log('DEBUG: Starting uploadBase64...');
                console.log('DEBUG: fileName:', fileName);
                console.log('DEBUG: contentType:', contentType);
                console.log('DEBUG: base64 length:', base64.length);

                const response = await documentApi.uploadBase64({
                    base64Content: base64,
                    fileName: fileName,
                    contentType: contentType,
                    storageType: 'Azure',
                });

                console.log('DEBUG: uploadBase64 response:', JSON.stringify(response, null, 2));

                if (response && response.length > 0) {
                    console.log('DEBUG: Upload success, ID:', response[0].id);
                } else {
                    console.warn('DEBUG: Upload response empty or invalid');
                }

                await new Promise<void>(resolve => setTimeout(() => resolve(), 1500));
                const mockCount = Math.floor(Math.random() * 50) + 10;
                setCurrentImageCount(mockCount);
                const mockDetections: DetectionDot[] = [];
                for (let i = 0; i < mockCount; i++) {
                    mockDetections.push({
                        id: i,
                        center: {
                            x: Math.random() * 1024,
                            y: Math.random() * 1024,
                        },
                    });
                }
                setDetections(mockDetections);
                setImageDimensions({ width: 1024, height: 1024 });
            } catch (error: any) {
                console.error('AI processing failed:', error);
                Toast.show({
                    type: 'error',
                    text1: 'Lỗi',
                    text2: 'Không thể xử lý ảnh này',
                });
            } finally {
                setIsLoading(false);
            }
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
                                        setDetections([]);
                                        setCurrentImageCount(0);
                                        setIsCountAdded(false);
                                    }}
                                    returnBase64={true}
                                >
                                    {imageUri && detections.length > 0 && (
                                        <DotingOverlay
                                            detections={detections}
                                            displayWidth={displayDimensions.width}
                                            displayHeight={displayDimensions.width}
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
                                <TouchableOpacity
                                    style={[
                                        styles.actionButton,
                                        (isCountAdded || currentImageCount === 0) &&
                                            styles.disabledButton,
                                    ]}
                                    onPress={handleGetCount}
                                    disabled={isCountAdded || currentImageCount === 0}
                                >
                                    <Text
                                        style={[
                                            styles.actionButtonText,
                                            (isCountAdded || currentImageCount === 0) &&
                                                styles.disabledButtonText,
                                        ]}
                                    >
                                        {countTimes === 0
                                            ? `Lấy số lượng ${
                                                  currentImageCount > 0
                                                      ? `(${currentImageCount})`
                                                      : ''
                                              }`
                                            : `Cộng dồn (${currentImageCount})`}
                                    </Text>
                                </TouchableOpacity>
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
