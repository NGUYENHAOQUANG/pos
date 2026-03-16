import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { colors, typography } from '@/styles';

export const PondInfor = () => {
    // Mock data based on the image requirement
    const data = {
        area: '2.500 m²',
        stockingDate: '01/01/2025',
        doc: 45,
        quantity: 400000,
        breed: 'Tôm thẻ chân trắng – SIS PL12',
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>
                    {data.area} - {data.stockingDate}
                </Text>
            </View>
            <View style={styles.body}>
                <View style={styles.row}>
                    <Text style={styles.label}>Ngày nuôi (DOC):</Text>
                    <Text style={styles.value}>{data.doc}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Số lượng thả (Pls):</Text>
                    <Text style={styles.value}>{data.quantity.toLocaleString('vi-VN')}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Tôm giống:</Text>
                    <Text style={styles.value}>{data.breed}</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        marginBottom: 8,
    },
    header: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    headerTitle: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.bold,
        color: colors.text,
        textAlign: 'center', // Image looks like it might be centered or left, usually headers are left but the format [area] - [date] suggests a centered or prominent display. Let's keep it default left or check image again. Image shows it's just text. Let's stick to standard left align for header titles usually, but the image shows "[diện tích] - [ngày thả]" which looks like a title.
        // Actually looking at the uploaded image: "[diện tích] - [ngày thả]" is at the top.
        // Since it's a "Pond Info" card, consistent with others.
        textTransform: 'uppercase', // Based on other headers like TỔNG QUAN? No, the image text "[diện tích] - [ngày thả]" doesn't look uppercase in the prompt description but let's check the image.
        // Image text: "[diện tích] - [ngày thả]"
        // It looks like a section header.
        // Let's use standard header style.
    },
    body: {
        padding: 16,
        gap: 8,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '500', // Looks slightly bold
    },
    value: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '400',
    },
});
