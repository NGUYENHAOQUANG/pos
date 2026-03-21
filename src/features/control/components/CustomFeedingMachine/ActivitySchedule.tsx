import React, { useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import IconAdd from 'react-native-vector-icons/Ionicons';
import DeleteIcon from '@/assets/Icon/Delete.svg';
import ModalAddTurn from '@/features/control/components/CustomFeedingMachine/ModalAddTurn';
import { AddTurnModalUI } from '@/features/control/components/CustomFeedingMachine/AddTurnModalUI';
import { ConfirmationModalUI } from '@/shared/components/modal/ConfirmationModalUI';
import { colors } from '@/styles';
import { Button } from '@/shared/components/buttons/Button';
import { deviceApi } from '@/features/control/api/deviceApi';
import Toast from 'react-native-toast-message';

const MAX_TURNS = 15;

export interface ScheduleItem {
    id: string;
    startTime: Date | null;
    endTime: Date | null;
    isNew?: boolean;
}

interface ActivityScheduleProps {
    schedules: ScheduleItem[];
    onUpdateSchedules: (newSchedules: ScheduleItem[]) => void;
    style?: ViewStyle;
    titleStyle?: TextStyle;
}

export default function ActivitySchedule({
    schedules,
    onUpdateSchedules,
    style,
    titleStyle,
}: ActivityScheduleProps) {
    const [isModalVisible, setModalVisible] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<ScheduleItem | null>(null);

    const openAddModal = () => {
        setModalVisible(true);
    };

    const closeAddModal = () => {
        setModalVisible(false);
    };

    const handleConfirmAdd = (startTime: Date | null, endTime: Date | null) => {
        const newTurn: ScheduleItem = {
            id: Date.now().toString(),
            startTime,
            endTime,
            isNew: true,
        };
        onUpdateSchedules([...schedules, newTurn]);
        closeAddModal();
    };

    // Show confirmation modal before deleting
    const handleDeletePress = useCallback((item: ScheduleItem) => {
        setDeleteTarget(item);
    }, []);

    // Confirm delete — call API for existing schedules, remove from list
    const handleConfirmDelete = useCallback(async () => {
        if (!deleteTarget) return;

        // Only call API for schedules that exist on server (not new ones)
        if (!deleteTarget.isNew) {
            try {
                await deviceApi.deleteSchedule(deleteTarget.id);
                Toast.show({
                    type: 'success',
                    text1: 'Đã xóa lịch trình',
                });
            } catch {
                Toast.show({
                    type: 'error',
                    text1: 'Không thể xóa lịch trình',
                });
                setDeleteTarget(null);
                return;
            }
        }

        onUpdateSchedules(schedules.filter(item => item.id !== deleteTarget.id));
        setDeleteTarget(null);
    }, [deleteTarget, schedules, onUpdateSchedules]);

    // Edit time directly on the list
    const handleTimeChange = (id: string, type: 'start' | 'end', newDate: Date) => {
        const updatedSchedules = schedules.map(item => {
            if (item.id === id) {
                return {
                    ...item,
                    [type === 'start' ? 'startTime' : 'endTime']: newDate,
                };
            }
            return item;
        });
        onUpdateSchedules(updatedSchedules);
    };

    const isMaxReached = schedules.length >= MAX_TURNS;

    return (
        <View style={[styles.container, style]}>
            <View style={styles.card}>
                <View style={styles.headerRow}>
                    <Text style={[styles.headerTitle, titleStyle]}>Lịch hoạt động</Text>
                    <Text style={styles.turnCount}>
                        ({schedules.length}/{MAX_TURNS})
                    </Text>
                </View>

                {schedules.map((item, index) => (
                    <View key={item.id} style={styles.rowItem}>
                        <Text style={styles.labelTurn}>Lần {index + 1}</Text>

                        <View style={styles.timeInputsWrapper}>
                            <ModalAddTurn
                                value={item.startTime}
                                onChange={date => handleTimeChange(item.id, 'start', date)}
                                style={styles.timeInput}
                                placeholder="00:00:00"
                            />
                            <Text style={styles.dashSeparator}>-</Text>
                            <ModalAddTurn
                                value={item.endTime}
                                onChange={date => handleTimeChange(item.id, 'end', date)}
                                style={styles.timeInput}
                                placeholder="00:00:00"
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => handleDeletePress(item)}
                            activeOpacity={0.7}
                        >
                            <DeleteIcon width={20} height={20} color={colors.text} />
                        </TouchableOpacity>
                    </View>
                ))}

                {!isMaxReached && (
                    <Button
                        title="Thêm lượt"
                        variant="outline"
                        onPress={openAddModal}
                        renderLeftIcon={<IconAdd name="add" size={20} color={colors.text} />}
                        style={styles.addBtn}
                    />
                )}
            </View>

            {/* Add turn modal */}
            <AddTurnModalUI
                visible={isModalVisible}
                onClose={closeAddModal}
                onConfirm={handleConfirmAdd}
                turnIndex={schedules.length + 1}
            />

            {/* Delete confirmation modal */}
            <ConfirmationModalUI
                visible={!!deleteTarget}
                title="Xóa lịch trình"
                message="Bạn có chắc chắn muốn xóa lịch trình này không?"
                confirmText="Xóa"
                cancelText="Hủy"
                showSuccessToast={false}
                onConfirm={handleConfirmDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 16,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 6,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    turnCount: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.textSecondary,
    },
    card: {
        backgroundColor: colors.white,
        padding: 16,
        borderRadius: 16,
    },
    rowItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        justifyContent: 'space-between',
    },
    labelTurn: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '500',
        width: 45,
    },
    timeInputsWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 8,
    },
    timeInput: {
        flex: 1,
    },
    dashSeparator: {
        marginHorizontal: 8,
        color: colors.text,
        fontWeight: '500',
    },
    deleteButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 999,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.white,
    },
    addBtn: {
        marginTop: 4,
        borderColor: colors.border,
    },
});
