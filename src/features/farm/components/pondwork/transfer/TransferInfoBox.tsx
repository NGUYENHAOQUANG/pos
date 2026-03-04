import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius } from '@/styles';
import { SelectionInfoBox } from '@/features/farm/components/pondwork/SelectionInfoBox';
import DeleteBlack from '@/assets/Icon/IconFarm/DeleteBlack.svg';
import { IconError } from '@/assets/icons';
import { DropDownItem } from '@/features/farm/components/DropDownButtonBasic';
import { ReceivingPondDropdown } from './ReceivingPondDropdown';
import { formatNumber } from '@/features/farm/utils/numberUtils';
import { Input } from '@/shared/components/forms/Input';

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
    pondOptions: DropDownItem[];
    containerStyle?: ViewStyle;
    onDropdownOpen?: () => void; // Callback when dropdown opens
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
            // If no total, just add empty row
            const newPond: ReceivingPondItem = {
                id: Date.now().toString(),
                quantity: '',
            };
            onReceivingPondsChange([...receivingPonds, newPond]);
            return;
        }

        // Calculate quantity per pond (divide totalEstimatedShrimp by number of ponds, rounded down)
        const quantityPerPond = Math.floor(totalEstimatedShrimp / newPondCount);

        // Calculate remainder (what's left after distributing evenly)
        const totalDistributed = quantityPerPond * newPondCount;
        const remainder = totalEstimatedShrimp - totalDistributed;

        // Update all existing ponds with calculated quantity
        // First pond gets quantityPerPond + remainder, others get quantityPerPond
        const updatedPonds = receivingPonds.map((pond, index) => ({
            ...pond,
            quantity: (index === 0 ? quantityPerPond + remainder : quantityPerPond).toString(),
        }));

        // Add new pond with calculated quantity
        const newPond: ReceivingPondItem = {
            id: Date.now().toString(),
            quantity: quantityPerPond.toString(),
        };

        onReceivingPondsChange([...updatedPonds, newPond]);
    };

    const handleDeleteRow = (id: string) => {
        // Find the index of the pond to delete
        const deleteIndex = receivingPonds.findIndex(pond => pond.id === id);
        if (deleteIndex === -1) return;

        // Get the quantity of the pond being deleted
        const deletedQuantity =
            parseFloat(receivingPonds[deleteIndex].quantity.replace(/\D/g, '')) || 0;

        // Remove the deleted pond
        const updatedPonds = receivingPonds.filter(pond => pond.id !== id);

        // If only 1 row remains, set quantity to totalEstimatedShrimp
        if (updatedPonds.length === 1 && totalEstimatedShrimp) {
            updatedPonds[0].quantity = totalEstimatedShrimp.toString();
        } else if (updatedPonds.length > 0 && deletedQuantity > 0) {
            // Add deleted quantity to the previous row (index - 1)
            // If deleting first row (index 0), add to the new first row (index 0 after deletion)
            const targetIndex = deleteIndex > 0 ? deleteIndex - 1 : 0;
            const targetQuantity =
                parseFloat(updatedPonds[targetIndex].quantity.replace(/\D/g, '')) || 0;
            updatedPonds[targetIndex].quantity = (targetQuantity + deletedQuantity).toString();
        }

        onReceivingPondsChange(updatedPonds);
    };

    const handleQuantityChange = (id: string, text: string) => {
        // Remove all non-numeric characters
        const numericValue = text.replace(/\D/g, '');
        onReceivingPondsChange(
            receivingPonds.map(pond =>
                pond.id === id ? { ...pond, quantity: numericValue } : pond
            )
        );
    };

    const handleReceivingPondSelect = (pondId: string, selectedPondId: string) => {
        onReceivingPondsChange(
            receivingPonds.map(pond =>
                pond.id === pondId ? { ...pond, receivingPond: selectedPondId } : pond
            )
        );
        onReceivingPondPress?.(pondId);
    };

    // List of selected pond IDs for filtering dropdown options
    const selectedPondIds = useMemo(() => {
        return receivingPonds.map(p => p.receivingPond).filter((id): id is string => !!id);
    }, [receivingPonds]);

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

                    // Filter options: Keep current selection + options not selected elsewhere
                    const availableOptions = pondOptions.filter(option => {
                        const isSelectedInOtherRow = selectedPondIds.some(
                            selectedId =>
                                selectedId === option.id.toString() &&
                                selectedId !== pond.receivingPond
                        );
                        return !isSelectedInOtherRow;
                    });

                    return (
                        <View key={pond.id} style={styles.rowContainer}>
                            {/* Receiving Pond */}
                            <View style={styles.column}>
                                {isFirstRow && (
                                    <Text style={styles.label}>
                                        <Text style={styles.required}>* </Text>
                                        Ao nhận
                                    </Text>
                                )}
                                <ReceivingPondDropdown
                                    pond={pond}
                                    onSelect={handleReceivingPondSelect}
                                    pondOptions={availableOptions}
                                    onDropdownOpen={onDropdownOpen}
                                />
                            </View>

                            {/* Quantity */}
                            <View style={styles.column}>
                                {isFirstRow && (
                                    <Text style={styles.label}>
                                        <Text style={styles.required}>* </Text>
                                        Số lượng
                                    </Text>
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
