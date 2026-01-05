import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    TouchableWithoutFeedback,
} from 'react-native';
import IconTrash from 'react-native-vector-icons/Feather';
import IconAdd from 'react-native-vector-icons/Ionicons';
import IconClose from 'react-native-vector-icons/Ionicons';
import ModalAddTurn from './ModalAddTurn';
import { colors } from '@/styles';

export interface ScheduleItem {
    id: string;
    startTime: Date | null;
    endTime: Date | null;
}

interface ActivityScheduleProps {
    schedules: ScheduleItem[];
    onUpdateSchedules: (newSchedules: ScheduleItem[]) => void;
}

export default function ActivitySchedule({ schedules, onUpdateSchedules }: ActivityScheduleProps) {
    const [isModalVisible, setModalVisible] = useState(false);
    const [tempStartTime, setTempStartTime] = useState<Date | null>(null);
    const [tempEndTime, setTempEndTime] = useState<Date | null>(null);

    // Mở modal
    const openAddModal = () => {
        setTempStartTime(null);
        setTempEndTime(null);
        setModalVisible(true);
    };

    // Đóng modal
    const closeAddModal = () => {
        setModalVisible(false);
    };

    // Xác nhận thêm từ Modal
    const handleConfirmAdd = () => {
        const newTurn: ScheduleItem = {
            id: Date.now().toString(),
            startTime: tempStartTime,
            endTime: tempEndTime,
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
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.headerTitle}>Lịch hoạt động</Text>
                <View style={styles.fullWidthDivider} />

                {/* Danh sách các lượt đã thêm */}
                {schedules.map((item, index) => (
                    <View key={item.id} style={styles.rowItem}>
                        <Text style={styles.labelTurn}>Lần {index + 1}</Text>

                        <View style={styles.timeInputsWrapper}>
                            <ModalAddTurn
                                value={item.startTime}
                                onChange={date => handleTimeChange(item.id, 'start', date)}
                                style={styles.timeInput}
                                placeholder="00:00"
                            />
                            <Text style={styles.dashSeparator}>-</Text>
                            <ModalAddTurn
                                value={item.endTime}
                                onChange={date => handleTimeChange(item.id, 'end', date)}
                                style={styles.timeInput}
                                placeholder="00:00"
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => handleDeleteTurn(item.id)}
                        >
                            <IconTrash name="trash" size={20} color={colors.text} />
                        </TouchableOpacity>
                    </View>
                ))}

                {/* Nút mở Popup thêm lượt */}
                <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
                    <IconAdd name="add" size={20} color={colors.textSecondary} />
                    <Text style={styles.addBtnText}>Thêm lượt</Text>
                </TouchableOpacity>
            </View>

            {/* --- MODAL POPUP --- */}
            <Modal
                visible={isModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={closeAddModal}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={closeAddModal}
                >
                    <TouchableWithoutFeedback>
                        <View style={styles.modalContent}>
                            {/* Header Modal */}
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>
                                    Thêm lượt - Lần {schedules.length + 1}
                                </Text>
                                <TouchableOpacity onPress={closeAddModal}>
                                    <IconClose
                                        name="close"
                                        size={20}
                                        color={colors.textSecondary}
                                    />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.modalSeparator} />

                            {/* Body Modal */}
                            <View style={styles.modalBody}>
                                <View style={styles.halfInput}>
                                    <ModalAddTurn
                                        label="Bắt đầu"
                                        value={tempStartTime}
                                        onChange={setTempStartTime}
                                        placeholder="Chọn thời gian"
                                    />
                                </View>

                                <View style={styles.spacer12} />

                                <View style={styles.halfInput}>
                                    <ModalAddTurn
                                        label="Kết thúc"
                                        value={tempEndTime}
                                        onChange={setTempEndTime}
                                        placeholder="Chọn thời gian"
                                    />
                                </View>
                            </View>

                            <View style={styles.modalSeparator} />

                            {/* Footer Modal */}
                            <View style={styles.modalFooter}>
                                <TouchableOpacity
                                    style={styles.btnModalCancel}
                                    onPress={closeAddModal}
                                >
                                    <Text style={styles.txtModalCancel}>Huỷ bỏ</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.btnModalConfirm}
                                    onPress={handleConfirmAdd}
                                >
                                    <Text style={styles.txtModalConfirm}>Thêm lượt</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginTop: 0 },
    headerTitle: {
        fontSize: 16,
        fontWeight: '700',
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
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    rowItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        justifyContent: 'space-between',
    },
    labelTurn: { fontSize: 14, color: colors.text, fontWeight: '500', width: 45 },
    timeInputsWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', marginHorizontal: 8 },
    timeInput: { flex: 1 },
    dashSeparator: { marginHorizontal: 8, color: colors.text, fontWeight: '500' },
    deleteButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
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
        borderColor: colors.gray[300],
        borderStyle: 'dashed',
        backgroundColor: colors.white,
        marginTop: 4,
    },
    addBtnText: { fontSize: 14, fontWeight: '400', color: colors.text, marginLeft: 8 },
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
        backgroundColor: colors.white,
    },
    txtModalCancel: { fontSize: 14, fontWeight: '400', color: colors.text },
    btnModalConfirm: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        backgroundColor: colors.primary,
    },
    txtModalConfirm: { fontSize: 14, fontWeight: '400', color: colors.white },
    modalSeparator: {
        height: 1,
        backgroundColor: colors.border,
        marginHorizontal: -16,
    },
});
