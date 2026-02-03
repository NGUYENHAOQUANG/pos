import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    LayoutChangeEvent,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, borderRadius } from '@/styles';
import { HeaderFarm } from '@/features/farm/components/HeaderFarm';
import { ButtonBarFarm } from '@/features/farm/components/ButtonBarFarm';
import { Input } from '@/shared/components/forms/Input';
import { ImagePickerActionSheet } from '@/shared/components/forms/ImagePickerActionSheet';
import { launchCamera, launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import {
    BoundingBoxOverlay,
    Detection,
} from '@/features/farm/components/boderbox/BoundingBoxOverlay';
import { getMockResponse } from '@/features/farm/data/mockAiResponse';
import { Loading } from '@/shared/components/ui/Loading';

const CountingShrimpScreen: React.FC = () => {
    const navigation = useNavigation();
    const [result, _setResult] = useState<string>('0');
    const [imageUri, _setImageUri] = useState<string | null>(null);
    const [countTimes, _setCountTimes] = useState(0);
    const [isPickerVisible, setIsPickerVisible] = useState(false);

    // State for AI Bounding Box
    const [detections, setDetections] = useState<Detection[]>([]);
    const [layout, setLayout] = useState<{ width: number; height: number } | null>(null);
    const [originalSize, setOriginalSize] = useState<{ width: number; height: number } | null>(
        null
    );
    const [isLoading, setIsLoading] = useState(false);

    // Calculate count from current image to add later
    const [currentImageCount, setCurrentImageCount] = useState<number>(0);

    const handleSave = () => {
        // Return accumulated count to previous screen
        (navigation as any).navigate({
            name: 'CreateCycle',
            params: { aiCount: parseInt(result || '0') },
            merge: true,
        });
    };

    const handleImageResponse = (response: ImagePickerResponse) => {
        if (response.didCancel) {
            console.log('User cancelled image picker');
        } else if (response.errorCode) {
            console.log('ImagePicker Error: ', response.errorMessage);
        } else if (response.assets && response.assets.length > 0) {
            const asset = response.assets[0];
            const uri = asset.uri || null;
            const fileName = asset.fileName || null;

            _setImageUri(uri);
            _setImageUri(uri);

            // Reset detections when new image is picked
            setDetections([]);
            setCurrentImageCount(0);

            if (uri) {
                setIsLoading(true);
                /*
                Image.getSize(uri, (width, height) => {
                    setOriginalSize({ width, height });
                    // api
                }, (error) => {
                     console.error("Lỗi lấy kích thước ảnh:", error);
                });
                */

                const mockData = getMockResponse(fileName, uri, asset.fileSize || 0);
                const MOCK_WIDTH = 3072;
                const MOCK_HEIGHT = 3072;

                setOriginalSize({ width: MOCK_WIDTH, height: MOCK_HEIGHT });

                // Simulate API delay and auto-process
                setTimeout(() => {
                    // Auto draw bounding boxes
                    setDetections(mockData.detections as Detection[]);

                    // Store the count for this image but don't add to total yet
                    setCurrentImageCount(mockData.total_count);

                    setIsLoading(false);
                }, 1500);
            }
        }
    };

    const handleTakePhoto = () => {
        launchCamera(
            {
                mediaType: 'photo',
                quality: 0.8,
                includeBase64: false,
            },
            handleImageResponse
        );
    };

    const handleChooseFromLibrary = () => {
        launchImageLibrary(
            {
                mediaType: 'photo',
                quality: 0.8,
                includeBase64: false,
            },
            handleImageResponse
        );
    };

    const onLayout = (event: LayoutChangeEvent) => {
        const { width, height } = event.nativeEvent.layout;
        setLayout({ width, height });
    };

    const handleGetCount = () => {
        if (!imageUri) {
            Alert.alert('Chưa có ảnh', 'Vui lòng chụp hoặc chọn ảnh trước khi lấy số lượng.');
            return;
        }

        if (detections.length === 0) {
            Alert.alert('Thông báo', 'Đang xử lý hình ảnh, vui lòng đợi...');
            return;
        }

        // Accumulate count
        const currentTotal = parseInt(result || '0');
        const newTotal = currentTotal + currentImageCount;
        _setResult(newTotal.toString());
        _setCountTimes(prev => prev + 1);
        setCurrentImageCount(0);
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
                                <Text style={styles.label}>Hình ảnh</Text>

                                <View style={styles.imageUploadContainer} onLayout={onLayout}>
                                    {imageUri ? (
                                        <>
                                            <Image
                                                source={{ uri: imageUri }}
                                                style={styles.uploadedImage}
                                                resizeMode="contain"
                                            />
                                            {layout && originalSize && detections.length > 0 && (
                                                <BoundingBoxOverlay
                                                    detections={detections}
                                                    displayWidth={layout.width}
                                                    displayHeight={layout.height}
                                                    originalWidth={originalSize.width}
                                                    originalHeight={originalSize.height}
                                                />
                                            )}
                                        </>
                                    ) : (
                                        <TouchableOpacity
                                            style={styles.uploadPlaceholder}
                                            onPress={() => setIsPickerVisible(true)}
                                        >
                                            <View style={styles.plusIconContainer}>
                                                <Text style={styles.plusIconText}>+</Text>
                                            </View>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>

                            <View style={styles.actionButtonsRow}>
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => setIsPickerVisible(true)}
                                >
                                    <Text style={styles.actionButtonText}>Chụp lại</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => {
                                        setDetections([]);
                                        _setResult('0');
                                        _setCountTimes(0);
                                        setCurrentImageCount(0);
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

                            <ImagePickerActionSheet
                                visible={isPickerVisible}
                                onClose={() => setIsPickerVisible(false)}
                                onTakePhoto={handleTakePhoto}
                                onChooseFromLibrary={handleChooseFromLibrary}
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
