import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useForm, useWatch, FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Toast from 'react-native-toast-message';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import { GeneralInformation } from '@/features/menu/components/member/GeneralInformation';
import { FeaturePermissions } from '@/features/menu/components/member/FeaturePermissions';
import { ButtonBarMenu } from '@/features/menu/components/ButtonBarMenu';
import { Button } from '@/shared/components/buttons/Button';
import { spacing } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { IRole } from '@/features/menu/types/member.types';
import { memberSchema, MemberFormValues } from '@/features/menu/schemas/member.schema';
import { memberService } from '@/features/menu/services/memberService';

interface AddMemberContentProps {
    isEditMode: boolean;
    isLoadingDetail?: boolean;
    initialData?: MemberFormValues;
    availableRoles: IRole[];
    isPaused: boolean;
    isPending: boolean;

    setModalVisible?: (visible: boolean) => void;

    onSubmit: (data: MemberFormValues) => void;
    onBack: () => void;
    onSuspendPress: () => void;
    onResendPress: () => void;
    onActivatePress: () => void;
}

export const AddMemberContent: React.FC<AddMemberContentProps> = ({
    isEditMode,
    isLoadingDetail,
    initialData,
    availableRoles,
    isPaused,
    isPending,
    onSubmit,
    onBack,
    onSuspendPress,
    onResendPress,
    onActivatePress,
}) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    const { control, handleSubmit, setValue, reset } = useForm<MemberFormValues>({
        resolver: zodResolver(memberSchema),
        defaultValues: memberService.createDefaultFormValues(),
    });

    React.useEffect(() => {
        if (isEditMode && initialData) {
            reset(initialData);
        }
    }, [isEditMode, initialData, reset]);

    const formValues = useWatch({
        control,
        name: ['name', 'contact', 'roles', 'permissions'],
    });

    const [name, contact, roles, permissions] = formValues as [string, string, string[], string[]];

    const onError = (formErrors: FieldErrors<MemberFormValues>) => {
        if (formErrors.name) {
            Toast.show({ type: 'error', text1: 'Lỗi', text2: formErrors.name.message });
        } else if (formErrors.contact) {
            Toast.show({ type: 'error', text1: 'Lỗi', text2: formErrors.contact.message });
        } else if (formErrors.roles) {
            Toast.show({ type: 'error', text1: 'Lỗi', text2: formErrors.roles.message });
        } else if (formErrors.permissions) {
            Toast.show({ type: 'error', text1: 'Lỗi', text2: formErrors.permissions.message });
        }
    };

    const handleNameChange = React.useCallback(
        (val: string) => setValue('name', val, { shouldValidate: true }),
        [setValue]
    );
    const handleContactChange = React.useCallback(
        (val: string) => setValue('contact', val, { shouldValidate: true }),
        [setValue]
    );
    const handleRolesChange = React.useCallback(
        (val: string[]) => setValue('roles', val, { shouldValidate: true }),
        [setValue]
    );
    const handlePermissionsChange = React.useCallback(
        (val: string[]) => setValue('permissions', val, { shouldValidate: true }),
        [setValue]
    );

    if (isLoadingDetail) {
        return (
            <View style={styles.container}>
                <ScrollView contentContainerStyle={styles.contentEdit}>
                    <View style={styles.section}>
                        <Skeleton height={20} width={120} style={{ marginBottom: 8 }} />
                        <Skeleton height={48} borderRadius={8} style={{ marginBottom: 16 }} />

                        <Skeleton height={20} width={100} style={{ marginBottom: 8 }} />
                        <Skeleton height={48} borderRadius={8} style={{ marginBottom: 16 }} />

                        <Skeleton height={20} width={150} style={{ marginBottom: 8 }} />
                        <Skeleton height={60} borderRadius={8} />
                    </View>
                    <View style={styles.section}>
                        <Skeleton height={20} width={150} style={{ marginBottom: 16 }} />
                        <Skeleton height={400} borderRadius={12} />
                    </View>
                </ScrollView>
                <View style={styles.footerEdit}>
                    <Skeleton height={48} borderRadius={8} style={{ margin: 16 }} />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={isEditMode ? styles.contentEdit : styles.content}>
                <GeneralInformation
                    name={name}
                    onNameChange={handleNameChange}
                    contact={contact}
                    onContactChange={handleContactChange}
                    disabled={isEditMode && isPaused}
                />

                <FeaturePermissions
                    selectedRoles={roles}
                    onRolesChange={handleRolesChange}
                    availableRoles={availableRoles}
                    selectedPermissions={permissions}
                    onPermissionsChange={handlePermissionsChange}
                    disabled={isEditMode && isPaused}
                />

                {isEditMode && !isPaused && (
                    <View style={styles.actionContainer}>
                        {isPending ? (
                            <Button
                                title="Gửi lại lời mời"
                                onPress={onResendPress}
                                variant="outline"
                                fullWidth
                                style={styles.actionButton}
                                textStyle={styles.actionButtonText}
                            />
                        ) : (
                            <Button
                                title="Tạm ngưng tài khoản"
                                onPress={onSuspendPress}
                                variant="outline"
                                fullWidth
                                style={styles.actionButton}
                                textStyle={styles.actionButtonText}
                            />
                        )}
                    </View>
                )}
            </ScrollView>

            <ButtonBarMenu
                primaryTitle={
                    isEditMode
                        ? isPaused
                            ? 'Kích hoạt lại'
                            : 'Cập nhật thông tin'
                        : 'Thêm thành viên'
                }
                onPrimaryPress={isPaused ? onActivatePress : handleSubmit(onSubmit, onError)}
                secondaryTitle="Huỷ"
                onSecondaryPress={onBack}
                style={isEditMode ? styles.footerEdit : styles.footer}
            />
        </View>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.backgroundPrimary,
        },
        content: {
            paddingVertical: spacing.sm,
            paddingHorizontal: 16,
            gap: spacing.sm,
            paddingBottom: 100,
        },
        contentEdit: {
            paddingVertical: spacing.sm,
            paddingHorizontal: 16,
            gap: spacing.sm,
            paddingBottom: 120,
        },
        footer: {
            borderTopWidth: 1,
            borderTopColor: theme.border,
            backgroundColor: theme.background,
        },
        footerEdit: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            borderTopWidth: 1,
            borderTopColor: theme.border,
            backgroundColor: theme.background,
        },
        actionContainer: {
            paddingHorizontal: 0,
            marginTop: spacing.sm,
        },
        actionButton: {
            borderWidth: 1,
            borderColor: theme.border,
            backgroundColor: theme.white,
        },
        actionButtonText: {
            color: theme.text,
        },
        section: {
            backgroundColor: theme.white,
            padding: 16,
            borderRadius: 12,
            marginBottom: 16,
        },
    });
