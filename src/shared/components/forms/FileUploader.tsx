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

export interface FileUploaderRef {
    markAsSaved: () => void;
}

export const FileUploader = React.forwardRef<FileUploaderRef, FileUploaderProps>(
    (
        {
            files,
            onFilesSelected,
            // maxFiles = 10, // Unused for now
            title = 'Tệp đính kèm',
            allowedTypes = [types.allFiles],
        },
        ref
    ) => {
        const [uploadingFiles, setUploadingFiles] = React.useState<DocumentPickerResponse[]>([]);
        const [isPicking, setIsPicking] = React.useState(false);
        const [deletingFileIndex, setDeletingFileIndex] = React.useState<number | null>(null);

        // Track files uploaded in this session for cleanup
        const sessionUploadedFileIds = React.useRef<string[]>([]);
        const isSaved = React.useRef(false);

        React.useImperativeHandle(ref, () => ({
            markAsSaved: () => {
                isSaved.current = true;
            },
        }));

        // Cleanup on unmount
        React.useEffect(() => {
            return () => {
                if (!isSaved.current && sessionUploadedFileIds.current.length > 0) {
                    console.log(
                        `[FileUploader] Auto-cleanup: Deleting ${sessionUploadedFileIds.current.length} unsaved files...`
                    );
                    // Delete all files uploaded in this session if not saved
                    sessionUploadedFileIds.current.forEach(id => {
                        documentApi
                            .delete(id)
                            .then(() =>
                                console.log(`[FileUploader] Delete success (cleanup): ${id}`)
                            )
                            .catch(err =>
                                console.error(`[FileUploader] Delete failed (cleanup): ${id}`, err)
                            );
                    });
                } else {
                    console.log('[FileUploader] No cleanup needed (Files saved or none uploaded).');
                }
            };
        }, []);

        // Check if component is still mounted
        const isMounted = React.useRef(true);
        React.useEffect(() => {
            return () => {
                isMounted.current = false;
            };
        }, []);

        const handlePickFiles = useCallback(async () => {
            if (isPicking) return;
            setIsPicking(true);

            try {
                const result = await pick({
                    allowMultiSelection: true,
                    type: allowedTypes,
                    presentationStyle: 'fullScreen',
                });

                if (result && result.length > 0) {
                    // Set loading state
                    setUploadingFiles(result);

                    // Process uploads individually
                    const uploadPromises = result.map(async file => {
                        try {
                            const uploadedDocs = await documentApi.upload([file]);

                            // Check if upload returned a valid document
                            // Note: documentApi.upload returns an array even for single file
                            if (uploadedDocs && uploadedDocs.length > 0) {
                                const uploadedDoc = uploadedDocs[0];

                                // If component unmounted during upload, delete immediately
                                if (!isMounted.current) {
                                    console.log(
                                        `[FileUploader] Component unmounted. Deleting orphaned file: ${uploadedDoc.id}`
                                    );
                                    if (uploadedDoc.id) {
                                        documentApi
                                            .delete(uploadedDoc.id)
                                            .catch(err =>
                                                console.error(
                                                    `[FileUploader] Delete failed (orphaned): ${uploadedDoc.id}`,
                                                    err
                                                )
                                            );
                                    }
                                    return null;
                                }

                                // Track uploaded ID for session cleanup
                                if (uploadedDoc.id) {
                                    sessionUploadedFileIds.current.push(uploadedDoc.id);
                                }

                                // Return the complete file object with ID
                                return {
                                    ...file,
                                    id: uploadedDoc.id,
                                };
                            }
                            return null;
                        } catch (error) {
                            console.error(
                                `[FileUploader] Failed to upload file: ${file.name}`,
                                error
                            );
                            return null;
                        }
                    });

                    // Wait for all uploads to complete (success or fail)
                    const results = await Promise.all(uploadPromises);

                    // Filter out failed uploads (null values)
                    const successfulFiles = results.filter(
                        r => r !== null
                    ) as (DocumentPickerResponse & { id: string })[];

                    if (isMounted.current) {
                        if (successfulFiles.length > 0) {
                            // Update parent state with SUCCESSFUL files only
                            onFilesSelected([...files, ...successfulFiles]);
                        }

                        // If some files failed, show an alert
                        if (successfulFiles.length < result.length) {
                            Alert.alert(
                                'Thông báo',
                                `Đã tải lên ${successfulFiles.length}/${result.length} tệp. Một số tệp bị lỗi không thể tải lên.`
                            );
                        }
                    }
                }
            } catch (err) {
                if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) {
                    // User cancelled
                }
            } finally {
                if (isMounted.current) {
                    setUploadingFiles([]); // Clear loading state
                    setIsPicking(false);
                }
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
                            const id = (fileToRemove as any).id;
                            await documentApi.delete(id);
                            // Remove from session tracking if present
                            sessionUploadedFileIds.current = sessionUploadedFileIds.current.filter(
                                fid => fid !== id
                            );
                        } catch (e) {
                            if ((e as any).statusCode === 404) {
                                // Remove from session tracking even if 404
                                const id = (fileToRemove as any).id;
                                sessionUploadedFileIds.current =
                                    sessionUploadedFileIds.current.filter(fid => fid !== id);
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
                                            <LinkIcon
                                                width={16}
                                                height={16}
                                                style={styles.fileIcon}
                                            />
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
                                                isDeleting
                                                    ? colors.textTertiary
                                                    : colors.textTertiary
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
                                            style={[
                                                styles.fileName,
                                                { color: colors.textSecondary },
                                            ]}
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
    }
);

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
