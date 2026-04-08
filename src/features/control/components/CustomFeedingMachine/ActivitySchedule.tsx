import React, { useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import IconAdd from 'react-native-vector-icons/Ionicons';
import DeleteIcon from '@/assets/Icon/Delete.svg';
import ModalAddTurn from '@/features/control/components/CustomFeedingMachine/ModalAddTurn';
import { AddTurnModalUI } from '@/features/control/components/CustomFeedingMachine/AddTurnModalUI';
import { ConfirmationModalUI } from '@/shared/components/modal/ConfirmationModalUI';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { Button } from '@/shared/components/buttons/Button';
import { deviceApi } from '@/features/control/api/deviceApi';
import {
    showScheduleDeleteSuccessToast,
    showScheduleDeleteFailedToast,
    showScheduleCannotEditToast,
} from '@/features/farm/utils/toastMessages';

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
    const theme = useAppTheme();
    const themedStyles = getStyles(theme);
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

    const handleDeletePress = useCallback((item: ScheduleItem) => {
        setDeleteTarget(item);
    }, []);

    const handleConfirmDelete = useCallback(async () => {
        if (!deleteTarget) return;

        if (!deleteTarget.isNew) {
            try {
                await deviceApi.deleteSchedule(deleteTarget.id);
                showScheduleDeleteSuccessToast();
            } catch (err: unknown) {
                const normalized = err as { message?: string };
                showScheduleDeleteFailedToast(normalized?.message);
                setDeleteTarget(null);
                return;
            }
        }

        onUpdateSchedules(schedules.filter(item => item.id !== deleteTarget.id));
        setDeleteTarget(null);
    }, [deleteTarget, schedules, onUpdateSchedules]);

    const handleTimeChange = (id: string, type: 'start' | 'end', newDate: Date) => {
        const target = schedules.find(item => item.id === id);
        if (target && !target.isNew && target.endTime && target.endTime <= new Date()) {
            showScheduleCannotEditToast();
            return;
        }
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
        <View style={[themedStyles.container, style]}>
            <View style={themedStyles.card}>
                <View style={staticStyles.headerRow}>
                    <Text style={[themedStyles.headerTitle, titleStyle]}>Lịch hoạt động</Text>
                    <Text style={themedStyles.turnCount}>
                        ({schedules.length}/{MAX_TURNS})
                    </Text>
                </View>

                {schedules.map((item, index) => (
                    <View key={item.id} style={staticStyles.rowItem}>
                        <Text style={themedStyles.labelTurn}>Lần {index + 1}</Text>

                        <View style={staticStyles.timeInputsWrapper}>
                            <ModalAddTurn
                                value={item.startTime}
                                onChange={date => handleTimeChange(item.id, 'start', date)}
                                style={staticStyles.timeInput}
                                placeholder="00:00:00"
                            />
                            <Text style={themedStyles.dashSeparator}>-</Text>
                            <ModalAddTurn
                                value={item.endTime}
                                onChange={date => handleTimeChange(item.id, 'end', date)}
                                style={staticStyles.timeInput}
                                placeholder="00:00:00"
                            />
                        </View>

                        <TouchableOpacity
                            style={themedStyles.deleteButton}
                            onPress={() => handleDeletePress(item)}
                            activeOpacity={0.7}
                        >
                            <DeleteIcon width={20} height={20} color={theme.text} />
                        </TouchableOpacity>
                    </View>
                ))}

                {!isMaxReached && (
                    <Button
                        title="Thêm lượt"
                        variant="outline"
                        onPress={openAddModal}
                        renderLeftIcon={<IconAdd name="add" size={20} color={theme.text} />}
                        style={themedStyles.addBtn}
                    />
                )}
            </View>

            <AddTurnModalUI
                visible={isModalVisible}
                onClose={closeAddModal}
                onConfirm={handleConfirmAdd}
                turnIndex={schedules.length + 1}
            />

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

// Static styles
const staticStyles = StyleSheet.create({
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 6,
    },
    rowItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        justifyContent: 'space-between',
    },
    timeInputsWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 12,
    },
    timeInput: {
        flex: 1,
    },
});

// Dynamic styles
const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            backgroundColor: theme.background,
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: 16,
        },
        card: {
            backgroundColor: theme.background,
            padding: 16,
            borderRadius: 16,
        },
        headerTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.text,
        },
        turnCount: {
            fontSize: 14,
            fontWeight: '500',
            color: theme.textSecondary,
        },
        labelTurn: {
            fontSize: 14,
            color: theme.text,
            fontWeight: '500',
            width: 45,
        },
        dashSeparator: {
            marginHorizontal: 8,
            color: theme.text,
            fontWeight: '500',
        },
        deleteButton: {
            width: 40,
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 999,
            borderWidth: 1,
            borderColor: theme.border,
            backgroundColor: theme.background,
        },
        addBtn: {
            marginTop: 4,
            borderColor: theme.border,
        },
    });
