import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import IconAdd from 'react-native-vector-icons/Ionicons';
import DeleteIcon from '@/assets/Icon/Delete.svg';
import ModalAddTurn from './ModalAddTurn';
import { AddTurnModalUI } from './AddTurnModalUI';
import { colors } from '@/styles';

export interface ScheduleItem {
    id: string;
    startTime: Date | null;
    endTime: Date | null;
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

    // Mở modal
    const openAddModal = () => {
        setModalVisible(true);
    };

    // Đóng modal
    const closeAddModal = () => {
        setModalVisible(false);
    };

    // Xác nhận thêm từ Modal
    const handleConfirmAdd = (startTime: Date | null, endTime: Date | null) => {
        const newTurn: ScheduleItem = {
            id: Date.now().toString(),
            startTime,
            endTime,
        };
        onUpdateSchedules([...schedules, newTurn]);
        closeAddModal();
    };

    // Xóa lượt
    const handleDeleteTurn = (id: string) => {
        onUpdateSchedules(schedules.filter(item => item.id !== id));
    };

    // Sửa giờ trực tiếp trên danh sách
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

    return (
        <View style={[styles.container, style]}>
            <View style={styles.card}>
                <Text style={[styles.headerTitle, titleStyle]}>Lịch hoạt động</Text>

                {/* Danh sách các lượt đã thêm */}
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
                            onPress={() => handleDeleteTurn(item.id)}
                            activeOpacity={0.7}
                        >
                            <DeleteIcon width={20} height={20} color={colors.text} />
                        </TouchableOpacity>
                    </View>
                ))}

                {/* Nút mở Popup thêm lượt */}
                <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
                    <IconAdd name="add" size={20} color={colors.text} />
                    <Text style={styles.addBtnText}>Thêm lượt</Text>
                </TouchableOpacity>
            </View>

            {/* --- MODAL POPUP --- */}
            <AddTurnModalUI
                visible={isModalVisible}
                onClose={closeAddModal}
                onConfirm={handleConfirmAdd}
                turnIndex={schedules.length + 1}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 0,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 16,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 12,
    },
    fullWidthDivider: {
        height: 1,
        backgroundColor: colors.border,
        marginHorizontal: -16,
        marginBottom: 16,
    },
    card: {
        backgroundColor: colors.white,
        padding: 16,
        marginTop: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.borderSubtle || colors.gray[100],
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 40,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: colors.border,
        borderStyle: 'solid',
        backgroundColor: colors.white,
        marginTop: 4,
    },
    addBtnText: {
        fontSize: 14,
        fontWeight: '400',
        color: colors.text,
        marginLeft: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: colors.overlay,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    modalContent: {
        width: '100%',
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 16,
        elevation: 5,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 12,
    },
    modalTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
    modalBody: { flexDirection: 'row', marginTop: 16, marginBottom: 16 },
    halfInput: { flex: 1 },
    spacer12: { width: 12 },
    modalFooter: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, paddingTop: 16 },
    btnModalCancel: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },
});
