import React, { useMemo, useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle, Keyboard } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius } from '@/styles';
import { SelectionInfoBox } from '@/features/farm/components/pondwork/SelectionInfoBox';
import DeleteBlack from '@/assets/Icon/IconFarm/DeleteBlack.svg';
import { IconError } from '@/assets/icons';
import { DropdownMaterial, DropdownOption } from '@/features/material/components/DropdownMaterial';
import { formatNumber } from '@/features/farm/utils/numberUtils';
import { Input, RequiredDot } from '@/shared/components/forms/Input';

export interface ReceivingPondItem {
    id: string;
    receivingPond?: string;
    quantity: string;
}

interface TransferInfoBoxProps {
    transferMethod?: string;
    onTransferMethodPress?: () => void;
    receivingPonds: ReceivingPondItem[];
    onReceivingPondsChange: (ponds: ReceivingPondItem[]) => void;
    onReceivingPondPress?: (id: string) => void;
    totalEstimatedShrimp?: number;
    pondOptions: DropdownOption[];
    containerStyle?: ViewStyle;
    onDropdownOpen?: () => void;
}

export const TransferInfoBox: React.FC<TransferInfoBoxProps> = ({
    transferMethod = 'Sang hết',
    onTransferMethodPress,
    receivingPonds,
    onReceivingPondsChange,
    onReceivingPondPress,
    totalEstimatedShrimp,
    pondOptions,
    containerStyle,
    onDropdownOpen,
}) => {
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
    // Calculate total quantity from all rows
    const totalQuantity = useMemo(() => {
        return receivingPonds.reduce((sum, pond) => {
            const qty = parseFloat(pond.quantity.replace(/\D/g, '')) || 0;
            return sum + qty;
        }, 0);
    }, [receivingPonds]);

    // Check if total quantity matches expected shrimp
    // Only show error when user has entered quantity (totalQuantity > 0)
    const showError = useMemo(() => {
        if (!totalEstimatedShrimp || totalEstimatedShrimp === 0) return false;
        if (totalQuantity === 0) return false;
        return totalQuantity !== totalEstimatedShrimp;
    }, [totalQuantity, totalEstimatedShrimp]);

    const handleAddRow = () => {
        const newPondCount = receivingPonds.length + 1;

        if (!totalEstimatedShrimp || totalEstimatedShrimp === 0) {
            const newPond: ReceivingPondItem = {
                id: Date.now().toString(),
                quantity: '',
            };
            onReceivingPondsChange([...receivingPonds, newPond]);
            return;
        }

        const quantityPerPond = Math.floor(totalEstimatedShrimp / newPondCount);

        const totalDistributed = quantityPerPond * newPondCount;
        const remainder = totalEstimatedShrimp - totalDistributed;

        const updatedPonds = receivingPonds.map((pond, index) => ({
            ...pond,
            quantity: (index === 0 ? quantityPerPond + remainder : quantityPerPond).toString(),
        }));

        const newPond: ReceivingPondItem = {
            id: Date.now().toString(),
            quantity: quantityPerPond.toString(),
        };

        onReceivingPondsChange([...updatedPonds, newPond]);
    };

    const handleDeleteRow = (id: string) => {
        const deleteIndex = receivingPonds.findIndex(pond => pond.id === id);
        if (deleteIndex === -1) return;

        const deletedQuantity =
            parseFloat(receivingPonds[deleteIndex].quantity.replace(/\D/g, '')) || 0;

        const updatedPonds = receivingPonds.filter(pond => pond.id !== id);

        if (updatedPonds.length === 1 && totalEstimatedShrimp) {
            updatedPonds[0].quantity = totalEstimatedShrimp.toString();
        } else if (updatedPonds.length > 0 && deletedQuantity > 0) {
            const targetIndex = deleteIndex > 0 ? deleteIndex - 1 : 0;
            const targetQuantity =
                parseFloat(updatedPonds[targetIndex].quantity.replace(/\D/g, '')) || 0;
            updatedPonds[targetIndex].quantity = (targetQuantity + deletedQuantity).toString();
        }

        onReceivingPondsChange(updatedPonds);
    };

    const handleQuantityChange = (id: string, text: string) => {
        const numericValue = text.replace(/\D/g, '').substring(0, 9);
        onReceivingPondsChange(
            receivingPonds.map(pond =>
                pond.id === id ? { ...pond, quantity: numericValue } : pond
            )
        );
    };

    const handleReceivingPondSelect = useCallback(
        (pondId: string, selectedValue: string | number) => {
            onReceivingPondsChange(
                receivingPonds.map(pond =>
                    pond.id === pondId ? { ...pond, receivingPond: String(selectedValue) } : pond
                )
            );
            onReceivingPondPress?.(pondId);
        },
        [receivingPonds, onReceivingPondsChange, onReceivingPondPress]
    );

    const handleToggleDropdown = useCallback(
        (pondId: string) => {
            Keyboard.dismiss();
            setOpenDropdownId(prev => {
                if (prev === pondId) {
                    return null;
                }
                onDropdownOpen?.();
                setTimeout(() => {
                    setOpenDropdownId(pondId);
                }, 400);
                return null;
            });
        },
        [onDropdownOpen]
    );

    const selectedPondIds = useMemo(() => {
        return receivingPonds.map(p => p.receivingPond).filter((id): id is string => !!id);
    }, [receivingPonds]);

    const getAvailableOptions = useCallback(
        (currentPondId: string | undefined): DropdownOption[] => {
            return pondOptions.filter(option => {
                const isSelectedInOtherRow = selectedPondIds.some(
                    selectedId =>
                        selectedId === String(option.value) && selectedId !== currentPondId
                );
                return !isSelectedInOtherRow;
            });
        },
        [pondOptions, selectedPondIds]
    );

    return (
        <SelectionInfoBox title="Thông tin chuyển đi" style={containerStyle}>
            <View style={styles.transferMethodContainer}>
                <Text style={styles.label}>Hình thức chuyển</Text>
                <TouchableOpacity style={styles.pillButton} onPress={onTransferMethodPress}>
                    <Text style={styles.pillButtonText}>{transferMethod}</Text>
                </TouchableOpacity>
            </View>

            {/* Error Warning */}
            {showError && totalEstimatedShrimp && (
                <View style={styles.errorBox}>
                    <IconError width={16} height={16} />
                    <Text style={styles.errorText}>
                        Tổng số lượng tôm chuyển đi phải bằng tổng tôm dự kiến trong ao (
                        {formatNumber(totalEstimatedShrimp.toString())}).{' '}
                        {totalQuantity > totalEstimatedShrimp
                            ? `Dư ${formatNumber(
                                  (totalQuantity - totalEstimatedShrimp).toString()
                              )} con.`
                            : `Thiếu ${formatNumber(
                                  (totalEstimatedShrimp - totalQuantity).toString()
                              )} con.`}
                    </Text>
                </View>
            )}

            <View style={styles.receivingPondContainer}>
                {/* Receiving Pond Rows */}
                {receivingPonds.map((pond, index) => {
                    const isFirstRow = index === 0;
                    const availableOptions = getAvailableOptions(pond.receivingPond);

                    return (
                        <View key={pond.id} style={styles.rowContainer}>
                            {/* Receiving Pond */}
                            <View style={styles.column}>
                                {isFirstRow && (
                                    <View style={styles.labelWrapper}>
                                        <Text style={styles.label}>Ao nhận</Text>
                                        <RequiredDot />
                                    </View>
                                )}
                                <DropdownMaterial
                                    value={pond.receivingPond}
                                    onChange={val => handleReceivingPondSelect(pond.id, val)}
                                    options={availableOptions}
                                    placeholder="Chọn"
                                    showAllOption={false}
                                    isOpen={openDropdownId === pond.id}
                                    onToggle={() => handleToggleDropdown(pond.id)}
                                    useAutoScroll={true}
                                />
                            </View>

                            {/* Quantity */}
                            <View style={styles.column}>
                                {isFirstRow && (
                                    <View style={styles.labelWrapper}>
                                        <Text style={styles.label}>Số lượng</Text>
                                        <RequiredDot />
                                    </View>
                                )}
                                <View style={styles.inputRow}>
                                    <View style={styles.inputContainer}>
                                        <Input
                                            value={formatNumber(pond.quantity)}
                                            onChangeText={text =>
                                                handleQuantityChange(pond.id, text)
                                            }
                                            keyboardType="numeric"
                                            placeholder="0"
                                            containerStyle={{ marginBottom: 0 }}
                                        />
                                    </View>
                                    {/* Delete Button - only show if more than 1 row */}
                                    {receivingPonds.length > 1 && (
                                        <TouchableOpacity
                                            style={styles.deleteButton}
                                            onPress={() => handleDeleteRow(pond.id)}
                                            activeOpacity={0.7}
                                        >
                                            <DeleteBlack width={18} height={18} />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        </View>
                    );
                })}

                {/* Add Receiving Pond Link */}
                <TouchableOpacity style={styles.addLink} onPress={handleAddRow} activeOpacity={0.7}>
                    <Ionicons name="add" size={16} color={colors.primary} />
                    <Text style={styles.addLinkText}>Thêm ao nhận</Text>
                </TouchableOpacity>
            </View>
        </SelectionInfoBox>
    );
};

const styles = StyleSheet.create({
    transferMethodContainer: {
        gap: spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
    },
    label: {
        fontSize: 14,
        fontWeight: '400',
        color: colors.text,
        lineHeight: 22,
    },
    labelWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    required: {
        color: colors.error,
    },
    pillButton: {
        height: 22,
        backgroundColor: colors.blue[50],
        paddingHorizontal: spacing.sm,
        borderRadius: borderRadius.xs,
        borderColor: colors.blue[400],
        borderWidth: 1,
    },
    pillButtonText: {
        fontSize: 12,
        fontWeight: '400',
        color: colors.primary,
        lineHeight: 20,
    },
    errorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.errorBackground,
        borderWidth: 1,
        borderColor: colors.error,
        borderRadius: borderRadius.sm,
        paddingVertical: 8,
        paddingHorizontal: 12,
        gap: spacing.sm,
    },
    errorText: {
        fontWeight: '400',
        fontStyle: 'normal',
        fontSize: 14,
        lineHeight: 22,
        color: colors.text,
        flex: 1,
    },
    rowContainer: {
        flexDirection: 'row',
        gap: spacing.sm,
        alignItems: 'flex-start',
    },
    receivingPondContainer: {
        gap: spacing.sm,
    },
    column: {
        flex: 1,
        gap: spacing.sm,
    },
    inputRow: {
        flexDirection: 'row',
        gap: spacing.sm,
        alignItems: 'center',
    },
    inputContainer: {
        flex: 1,
    },
    deleteButton: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.sm,
        borderWidth: 1,
        borderColor: colors.defaultBorder,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 11,
    },
    addLink: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        marginTop: spacing.xs,
    },
    addLinkText: {
        fontSize: 14,
        fontWeight: '400',
        color: colors.primary,
        marginLeft: spacing.xs,
    },
});
