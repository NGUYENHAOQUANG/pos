/**
 * @file FileUploader.tsx
 * @description Reusable file upload component with preview
 * @created 2026-01-27
 */
import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import {
    pick,
    types,
    isErrorWithCode,
    errorCodes,
    DocumentPickerResponse,
} from '@react-native-documents/picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '@/styles/colors';
import LinkIcon from '@/assets/Icon/Link.svg';
import UploadIcon from '@/assets/Icon/Upload.svg';
import { documentApi } from '@/features/material/api/documentApi';

interface FileUploaderProps {
    files: DocumentPickerResponse[];
    onFilesSelected: (files: DocumentPickerResponse[]) => void;
    maxFiles?: number;
    title?: string;
    allowedTypes?: string[];
}

export const FileUploader = ({
    files,
    onFilesSelected,
    // maxFiles = 10, // Unused for now
    title = 'Tệp đính kèm',
    allowedTypes = [types.allFiles],
}: FileUploaderProps) => {
    const [uploadingFiles, setUploadingFiles] = React.useState<DocumentPickerResponse[]>([]);
    const [isPicking, setIsPicking] = React.useState(false);
    const [deletingFileIndex, setDeletingFileIndex] = React.useState<number | null>(null);

    const handlePickFiles = useCallback(async () => {
        if (isPicking) return;
        setIsPicking(true);

        try {
            const result = await pick({
                allowMultiSelection: true,
                type: allowedTypes,
                presentationStyle: 'fullScreen',
            });

            if (result) {
                // Set loading state
                setUploadingFiles(result);

                try {
                    const uploadedDocs = await documentApi.upload(result);

                    // Map uploaded docs to file format with ID
                    if (uploadedDocs && uploadedDocs.length === result.length) {
                        const newFiles = result.map((r, i) => ({
                            ...r,
                            id: uploadedDocs[i]?.id,
                        }));
                        // Update parent state with SUCCESSFUL files only
                        onFilesSelected([...files, ...newFiles]);
                    }
                } catch (_uploadErr) {
                    Alert.alert('Lỗi', 'Tải tệp lên thất bại');
                } finally {
                    // Clear loading state
                    setUploadingFiles([]);
                }
            }
        } catch (err) {
            if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) {
                // User cancelled
            }
        } finally {
            setIsPicking(false);
        }
    }, [files, onFilesSelected, allowedTypes, isPicking]);

    const handleRemoveFile = useCallback(
        async (indexToRemove: number) => {
            const fileToRemove = files[indexToRemove];

            // Set loading state for this file
            setDeletingFileIndex(indexToRemove);

            try {
                if ((fileToRemove as any).id) {
                    try {
                        await documentApi.delete((fileToRemove as any).id);
                    } catch (e) {
                        if ((e as any).statusCode === 404) {
                        } else {
                            Alert.alert('Lỗi', 'Không thể xóa tệp');
                            return;
                        }
                    }
                }

                const newFiles = files.filter((_, index) => index !== indexToRemove);
                onFilesSelected(newFiles);
            } finally {
                // Clear loading state
                setDeletingFileIndex(null);
            }
        },
        [files, onFilesSelected]
    );

    return (
        <View style={{ marginBottom: 16 }}>
            <Text style={styles.label}>{title}</Text>

            {(files.length > 0 || uploadingFiles.length > 0) && (
                <View style={styles.fileList}>
                    {/* Render Existing (Uploaded) Files */}
                    {files.map((file, index) => {
                        const isDeleting = deletingFileIndex === index;
                        return (
                            <View key={`${file.uri}-${index}`} style={styles.fileItem}>
                                <View style={styles.fileInfo}>
                                    {isDeleting ? (
                                        <ActivityIndicator
                                            size="small"
                                            color={colors.primary}
                                            style={styles.fileIcon}
                                        />
                                    ) : (
                                        <LinkIcon width={16} height={16} style={styles.fileIcon} />
                                    )}
                                    <View style={styles.fileDetails}>
                                        <Text
                                            style={[
                                                styles.fileName,
                                                isDeleting && { color: colors.textSecondary },
                                            ]}
                                            numberOfLines={1}
                                            ellipsizeMode="middle"
                                        >
                                            {file.name}
                                            {isDeleting && ' (Đang xóa...)'}
                                        </Text>
                                    </View>
                                </View>
                                <TouchableOpacity
                                    onPress={() => handleRemoveFile(index)}
                                    hitSlop={8}
                                    disabled={isDeleting}
                                >
                                    <Icon
                                        name="close-circle"
                                        size={16}
                                        color={
                                            isDeleting ? colors.textTertiary : colors.textTertiary
                                        }
                                        style={{ opacity: isDeleting ? 0.5 : 1 }}
                                    />
                                </TouchableOpacity>
                            </View>
                        );
                    })}

                    {/* Render Uploading Files */}
                    {uploadingFiles.map((file, index) => (
                        <View key={`uploading-${index}`} style={styles.fileItem}>
                            <View style={styles.fileInfo}>
                                {/* Loading Spinner or Text */}
                                <ActivityIndicator
                                    size="small"
                                    color={colors.primary}
                                    style={styles.fileIcon}
                                />
                                <View style={styles.fileDetails}>
                                    <Text
                                        style={[styles.fileName, { color: colors.textSecondary }]}
                                        numberOfLines={1}
                                        ellipsizeMode="middle"
                                    >
                                        {file.name} (Đang tải...)
                                    </Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
            )}

            <TouchableOpacity
                style={styles.uploadButton}
                onPress={handlePickFiles}
                disabled={uploadingFiles.length > 0 || isPicking}
            >
                <UploadIcon width={16} height={16} style={styles.uploadIcon} />
                <Text style={styles.uploadButtonText}>
                    {uploadingFiles.length > 0 || isPicking ? 'Đang xử lý...' : 'Tải lên'}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    label: {
        fontSize: 14,
        color: colors.text,
        marginBottom: 8,
    },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    uploadIcon: {
        marginRight: 8,
    },
    uploadButtonText: {
        fontSize: 14,
        color: colors.text,
    },
    fileList: {
        marginBottom: 8,
        gap: 8,
    },
    fileItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    fileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 12,
    },
    fileIcon: {
        marginRight: 12,
    },
    fileDetails: {
        flex: 1,
    },
    fileName: {
        fontSize: 14,
        color: colors.blue[600], // Link blue color
        marginBottom: 2,
    },
});
