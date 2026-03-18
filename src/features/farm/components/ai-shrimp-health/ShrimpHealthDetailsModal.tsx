import React from 'react';
import { View, StyleSheet, ScrollView, Modal, TouchableWithoutFeedback } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import Animated, { SlideInDown } from 'react-native-reanimated';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { colors, spacing, borderRadius } from '@/styles';
import {
    getStatusColor,
    getStatusIcon,
    HealthCheckItem,
    HealthCheckResult,
} from '@/features/farm/services/shrimp-health-ai.service';

interface Props {
    visible: boolean;
    countTimes: number;
    results: HealthCheckResult[];
    onClose: () => void;
}

export const ShrimpHealthDetailsModal: React.FC<Props> = ({
    visible,
    countTimes,
    results,
    onClose,
}) => {
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <TouchableWithoutFeedback onPress={onClose}>
                    <View style={StyleSheet.absoluteFill} />
                </TouchableWithoutFeedback>
                <Animated.View entering={SlideInDown.duration(300)} style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <View style={styles.modalIndicator} />
                        <Text style={styles.modalTitle}>
                            Chi tiết tình trạng tôm - Lần kiểm tra {countTimes}
                        </Text>
                    </View>
                    <ScrollView
                        style={styles.modalList}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.modalListContent}
                    >
                        {results
                            .reduce<HealthCheckItem[]>((acc, r) => acc.concat(r.items), [])
                            .map((item, index) => {
                                const color = getStatusColor(item.status);
                                return (
                                    <View key={item.id} style={styles.cardContainer}>
                                        <View style={styles.cardRow}>
                                            <View
                                                style={[
                                                    styles.indexBadge,
                                                    { backgroundColor: color + '20' },
                                                ]}
                                            >
                                                <Text style={[styles.indexText, { color }]}>
                                                    {index + 1}
                                                </Text>
                                            </View>

                                            <View style={styles.cardCenter}>
                                                <Text style={styles.diagnosisText}>
                                                    {item.diagnosis}
                                                </Text>
                                                <View style={styles.progressRow}>
                                                    <View style={styles.progressBarBackground}>
                                                        <View
                                                            style={[
                                                                styles.progressBarFill,
                                                                {
                                                                    width: `${item.confidence}%`,
                                                                    backgroundColor: color,
                                                                },
                                                            ]}
                                                        />
                                                    </View>
                                                    <Text
                                                        style={[
                                                            styles.confidencePercent,
                                                            { color },
                                                        ]}
                                                    >
                                                        {item.confidence}%
                                                    </Text>
                                                </View>
                                            </View>

                                            <View
                                                style={[
                                                    styles.statusIconContainer,
                                                    { backgroundColor: color + '15' },
                                                ]}
                                            >
                                                <Ionicons
                                                    name={getStatusIcon(item.status)}
                                                    size={20}
                                                    color={color}
                                                />
                                            </View>
                                        </View>
                                    </View>
                                );
                            })}
                    </ScrollView>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.white,
        borderTopLeftRadius: borderRadius.lg,
        borderTopRightRadius: borderRadius.lg,
        height: '60%',
        paddingBottom: spacing.xl,
    },
    modalHeader: {
        alignItems: 'center',
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    modalIndicator: {
        width: 40,
        height: 4,
        backgroundColor: colors.gray[300],
        borderRadius: 2,
        marginBottom: spacing.md,
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
    },
    modalList: {
        flex: 1,
    },
    modalListContent: {
        padding: spacing.md,
    },
    cardContainer: {
        backgroundColor: colors.white,
        borderRadius: 12,
        borderColor: colors.defaultBorder,
        borderWidth: 1,
        paddingVertical: 12,
        paddingHorizontal: 14,
        marginBottom: 10,
    },
    cardRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    indexBadge: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    indexText: {
        fontSize: 13,
        fontWeight: '700',
    },
    cardCenter: {
        flex: 1,
    },
    diagnosisText: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 4,
    },
    progressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    progressBarBackground: {
        flex: 1,
        height: 6,
        backgroundColor: colors.gray[200],
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    confidencePercent: {
        fontSize: 11,
        fontWeight: '600',
        width: 32,
        textAlign: 'right',
    },
    statusIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
});
