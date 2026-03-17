import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing } from '@/styles';
import { HeaderDevices } from '@/features/control/components/HeaderDevices';

// Import device card SVGs
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

// Manual row component
const ManualRow: React.FC<{ item: ManualItem }> = ({ item }) => {
    const CardSvg = item.CardSvg;

    return (
        <View style={styles.row}>
            {/* Device Card Column */}
            <View style={styles.deviceCell}>
                <CardSvg width={140} height={105} />
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
                {MANUAL_DATA.map(item => (
                    <ManualRow key={item.id} item={item} />
                ))}
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
        paddingBottom: 40,
    },
    // Table Header
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: colors.backgroundPrimary,
        borderBottomWidth: 2,
        borderBottomColor: colors.orange[600],
        paddingVertical: spacing.sm,
    },
    headerDevice: {
        width: 150,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.xs,
    },
    headerDescription: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.xs,
    },
    headerText: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.text,
        textAlign: 'center',
    },
    // Table Row
    row: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        minHeight: 130,
    },
    deviceCell: {
        width: 150,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: spacing.sm,
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
        fontSize: 14,
        fontWeight: '400',
        color: colors.text,
        marginRight: 4,
        minWidth: 14,
    },
    descriptionText: {
        flex: 1,
        fontSize: 14,
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
        fontSize: 14,
        fontWeight: '400',
        color: colors.orange[600],
        lineHeight: 18,
    },
});
