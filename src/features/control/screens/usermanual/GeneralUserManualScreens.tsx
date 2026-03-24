import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing } from '@/styles';
import { HeaderDevices } from '@/features/control/components/HeaderDevices';

// Import device card data
import { MANUAL_DATA, ManualItem } from '@/features/control/data/GeneraluserManualData';

// Helper function to get highlight color
const getHighlightColor = (text: string): string | undefined => {
    if (text.includes('xanh')) return colors.primary;
    if (text.includes('xám') || text.includes('mờ')) return colors.gray[500];
    if (text.includes('đỏ')) return colors.error;
    if (text.includes('Thủ công') || text.includes('Lịch trình') || text.includes('Tại chỗ'))
        return colors.primary;
    return undefined;
};

// Component for description row
const DescriptionRow: React.FC<{ index: number; text: string }> = ({ index, text }) => {
    // Split text by ':' to separate label and value
    const colonIndex = text.indexOf(':');
    if (colonIndex === -1) {
        return (
            <View style={styles.descriptionRow}>
                <Text style={styles.descriptionNumber}>{index}.</Text>
                <Text style={styles.descriptionText}>{text}</Text>
            </View>
        );
    }

    const label = text.substring(0, colonIndex + 1);
    const value = text.substring(colonIndex + 1);

    // Check for highlighted parts (bold text)
    const highlightColor = getHighlightColor(value);

    return (
        <View style={styles.descriptionRow}>
            <Text style={styles.descriptionNumber}>{index}.</Text>
            <Text style={styles.descriptionText}>
                {label}
                <Text
                    style={[
                        styles.descriptionHighlight,
                        highlightColor && { color: highlightColor },
                    ]}
                >
                    {value}
                </Text>
            </Text>
        </View>
    );
};

// Manual row component - renders each item with image and description
const ManualRow: React.FC<{ item: ManualItem; isLast: boolean }> = ({ item, isLast }) => {
    return (
        <View style={[styles.row, isLast && styles.rowLast]}>
            {/* Device Card Column */}
            <View style={styles.deviceCell}>
                <item.CardSvg width={120} height={80} style={{ marginTop: -17 }} />
            </View>

            {/* Description Column */}
            <View style={styles.descriptionCell}>
                {item.descriptions.map((desc, idx) => (
                    <DescriptionRow key={idx} index={idx + 1} text={desc} />
                ))}
                {/* Note as last description item */}
                {item.note && (
                    <View style={styles.descriptionRow}>
                        <Text style={styles.descriptionNumber}>
                            {item.descriptions.length + 1}.
                        </Text>
                        <Text style={styles.noteText}>{item.note}</Text>
                    </View>
                )}
            </View>
        </View>
    );
};

export const GeneralUserManualScreens: React.FC = () => {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <HeaderDevices
                title="Hướng Dẫn Sử Dụng"
                showBackButton={true}
                onBackPress={() => navigation.goBack()}
            />
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Single card wrapping the entire table */}
                <View style={styles.tableCard}>
                    {/* Table Header */}
                    <View style={styles.tableHeader}>
                        <View style={styles.headerDevice}>
                            <Text style={styles.headerText}>Hình minh họa</Text>
                        </View>
                        <View style={styles.headerDescription}>
                            <Text style={styles.headerText}>Mô tả</Text>
                        </View>
                    </View>

                    {/* Table Rows */}
                    {MANUAL_DATA.map((item, index) => (
                        <ManualRow
                            key={item.id}
                            item={item}
                            isLast={index === MANUAL_DATA.length - 1}
                        />
                    ))}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.md,
        paddingBottom: 40,
    },
    // Single card container wrapping full table
    tableCard: {
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.white,
        overflow: 'hidden',
    },
    // Table Header - bg: gray/100 (#F3F4F6), border: gray/200 (#E6E8EC)
    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.gray[100],
    },
    headerDevice: {
        width: 134,
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: 8,
        borderRightWidth: 1,
        borderRightColor: colors.border,
    },
    headerDescription: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: 8,
    },
    headerText: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.gray[950],
        lineHeight: 20,
    },
    // Table Row
    row: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        minHeight: 120,
    },
    rowLast: {
        borderBottomWidth: 0,
    },
    deviceCell: {
        width: 134,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingBottom: spacing.sm,
        paddingHorizontal: 4,
        borderRightWidth: 1,
        borderRightColor: colors.border,
    },
    descriptionCell: {
        flex: 1,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.sm,
        justifyContent: 'center',
    },
    // Description
    descriptionRow: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    descriptionNumber: {
        fontSize: 13,
        fontWeight: '400',
        color: colors.text,
        marginRight: 4,
        minWidth: 14,
    },
    descriptionText: {
        flex: 1,
        fontSize: 13,
        fontWeight: '400',
        color: colors.text,
        lineHeight: 18,
    },
    descriptionHighlight: {
        fontWeight: '700',
    },
    // Note
    noteText: {
        flex: 1,
        fontSize: 13,
        fontWeight: '400',
        color: colors.orange[600],
        lineHeight: 18,
    },
});
