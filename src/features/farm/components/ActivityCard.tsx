import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { colors } from '@/styles/colors';
import { DataRow } from './DataRow';
import { CardHeader } from './CardHeader';
import { borderRadius } from '@/styles';

export interface ActivityData {
    label: string;
    value: string | number;
    unit?: string;
    isWarning?: boolean;
}

interface ActivityCardProps {
    title: string;
    data: ActivityData[];
    onEdit?: () => void;
    note?: string;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({ title, data, onEdit, note }) => {
    const [expanded, setExpanded] = useState(false);
    const MAX_VISIBLE_ITEMS = 4;
    const shouldCollapse = data.length > MAX_VISIBLE_ITEMS;

    // Lọc data hiển thị
    const visibleData = expanded || !shouldCollapse ? data : data.slice(0, MAX_VISIBLE_ITEMS);

    return (
        <View style={styles.card}>
            {/* 1. Header Component */}
            <CardHeader title={title} onEdit={onEdit} />

            {/* 2. Body Content */}
            {/* 2. Body Content */}
            <View style={styles.body}>
                {/* Note Area - Moved to top as per requirement */}
                {note && (
                    <View style={styles.noteBox}>
                        <Text style={styles.noteLabel}>
                            {note.includes('|') ? note.split('|')[0] : 'Ghi chú'}
                        </Text>
                        <Text style={styles.noteContent}>
                            {note.includes('|') ? note.split('|').slice(1).join('|') : note}
                        </Text>
                    </View>
                )}

                {visibleData.map((item, index) => (
                    <DataRow
                        key={index}
                        label={item.label}
                        value={item.value}
                        unit={item.unit}
                        isWarning={item.isWarning}
                    />
                ))}

                {/* 3. Footer Toggle (Xem thêm/Thu gọn) */}
                {shouldCollapse && (
                    <TouchableOpacity
                        style={styles.toggleButton}
                        onPress={() => setExpanded(!expanded)}
                    >
                        <Text style={styles.toggleText}>{expanded ? 'Thu gọn' : 'Xem thêm'}</Text>
                        <Icon
                            name={expanded ? 'chevron-up' : 'chevron-down'}
                            size={16}
                            color={colors.primary}
                        />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.white,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
    },
    body: {
        paddingVertical: 4,
        gap: 2,
    },
    noteBox: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        marginHorizontal: 8,
        backgroundColor: colors.backgroundPrimary,
        borderRadius: borderRadius.sm,
        borderWidth: 1,
        borderColor: colors.defaultBorder,
    },
    noteLabel: {
        fontSize: 12,
        color: colors.textSecondary,
        fontWeight: '400',
        lineHeight: 22,
    },
    noteContent: {
        fontSize: 14,
        color: colors.text,
        lineHeight: 22,
        fontWeight: '400',
    },
    toggleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    toggleText: {
        fontSize: 14,
        color: colors.primary,
        fontWeight: '400',
        gap: 8,
        lineHeight: 22,
    },
});
