import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { colors } from '@/styles/colors';
import { PondIndexCard } from './PondIndexCard';

export interface PondData {
    id: string;
    name: string;
    value: string;
    color: string;
}

interface PondIndexProps {
    data?: PondData[];
}

const DEFAULT_DATA: PondData[] = [
    { id: '1', name: 'N01', value: '{chỉ số}', color: colors.orange[700] },
    { id: '2', name: 'N02', value: '{chỉ số}', color: colors.green[300] },
    { id: '3', name: 'N03', value: '{chỉ số}', color: colors.blue[700] },
    { id: '4', name: 'V01', value: '{chỉ số}', color: colors.green[800] },
    { id: '5', name: 'V02', value: '{chỉ số}', color: colors.brown[900] },
    { id: '6', name: 'V03', value: '{chỉ số}', color: colors.blue[300] },
    { id: '7', name: 'V04', value: '{chỉ số}', color: colors.yellow[800] },
];

export const PondIndex = ({ data = DEFAULT_DATA }: PondIndexProps) => {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            style={styles.scrollView}
        >
            {data.map(item => (
                <PondIndexCard key={item.id} item={item} />
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollView: {
        flexGrow: 0,
    },
    scrollContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
});
