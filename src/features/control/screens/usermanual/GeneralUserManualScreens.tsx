import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { useNavigation } from '@react-navigation/native';
import { spacing } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { HeaderDevices } from '@/features/control/components/HeaderDevices';

import { MANUAL_DATA, ManualItem } from '@/features/control/data/GeneraluserManualData';

// Helper function to get highlight color
const getHighlightColor = (text: string, theme: Colors): string | undefined => {
    if (text.includes('xanh')) return theme.primary;
    if (text.includes('xám') || text.includes('mờ')) return theme.gray[500];
    if (text.includes('đỏ')) return theme.error;
    if (text.includes('Thủ công') || text.includes('Lịch trình') || text.includes('Tại chỗ'))
        return theme.primary;
    return undefined;
};

// Component for description row
const DescriptionRow: React.FC<{ index: number; text: string; theme: Colors }> = ({
    index,
    text,
    theme,
}) => {
    const themedStyles = getStyles(theme);
    const colonIndex = text.indexOf(':');
    if (colonIndex === -1) {
        return (
            <View style={staticStyles.descriptionRow}>
                <Text style={themedStyles.descriptionNumber}>{index}.</Text>
                <Text style={themedStyles.descriptionText}>{text}</Text>
            </View>
        );
    }

    const label = text.substring(0, colonIndex + 1);
    const value = text.substring(colonIndex + 1);
    const highlightColor = getHighlightColor(value, theme);

    return (
        <View style={staticStyles.descriptionRow}>
            <Text style={themedStyles.descriptionNumber}>{index}.</Text>
            <Text style={themedStyles.descriptionText}>
                {label}
                <Text
                    style={[
                        staticStyles.descriptionHighlight,
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
const ManualRow: React.FC<{ item: ManualItem; isLast: boolean; theme: Colors }> = ({
    item,
    isLast,
    theme,
}) => {
    const themedStyles = getStyles(theme);
    return (
        <View style={[themedStyles.row, isLast && staticStyles.rowLast]}>
            <View style={themedStyles.deviceCell}>
                <item.CardSvg width={120} height={80} style={{ marginTop: -17 }} />
            </View>

            <View style={staticStyles.descriptionCell}>
                {item.descriptions.map((desc, idx) => (
                    <DescriptionRow key={idx} index={idx + 1} text={desc} theme={theme} />
                ))}
                {item.note && (
                    <View style={staticStyles.descriptionRow}>
                        <Text style={themedStyles.descriptionNumber}>
                            {item.descriptions.length + 1}.
                        </Text>
                        <Text style={themedStyles.noteText}>{item.note}</Text>
                    </View>
                )}
            </View>
        </View>
    );
};

export const GeneralUserManualScreens: React.FC = () => {
    const navigation = useNavigation();
    const theme = useAppTheme();
    const themedStyles = getStyles(theme);

    return (
        <View style={themedStyles.container}>
            <HeaderDevices
                title="Hướng Dẫn Sử Dụng"
                showBackButton={true}
                onBackPress={() => navigation.goBack()}
            />
            <ScrollView
                style={staticStyles.scrollView}
                contentContainerStyle={staticStyles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={themedStyles.tableCard}>
                    <View style={themedStyles.tableHeader}>
                        <View style={themedStyles.headerDevice}>
                            <Text style={themedStyles.headerText}>Hình minh họa</Text>
                        </View>
                        <View style={staticStyles.headerDescription}>
                            <Text style={themedStyles.headerText}>Mô tả</Text>
                        </View>
                    </View>

                    {MANUAL_DATA.map((item, index) => (
                        <ManualRow
                            key={item.id}
                            item={item}
                            isLast={index === MANUAL_DATA.length - 1}
                            theme={theme}
                        />
                    ))}
                </View>
            </ScrollView>
        </View>
    );
};

// Static styles
const staticStyles = StyleSheet.create({
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.md,
        paddingBottom: 40,
    },
    headerDescription: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: 8,
    },
    rowLast: {
        borderBottomWidth: 0,
    },
    descriptionCell: {
        flex: 1,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.sm,
        justifyContent: 'center',
    },
    descriptionRow: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    descriptionHighlight: {
        fontWeight: '700',
    },
});

// Dynamic styles
const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.background,
        },
        tableCard: {
            borderRadius: 8,
            borderWidth: 1,
            borderColor: theme.border,
            backgroundColor: theme.background,
            overflow: 'hidden',
        },
        tableHeader: {
            flexDirection: 'row',
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
            backgroundColor: theme.gray[100],
        },
        headerDevice: {
            width: 134,
            justifyContent: 'center',
            alignItems: 'flex-start',
            padding: 8,
            borderRightWidth: 1,
            borderRightColor: theme.border,
        },
        headerText: {
            fontSize: 14,
            fontWeight: '500',
            color: theme.gray[950],
            lineHeight: 20,
        },
        row: {
            flexDirection: 'row',
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
            minHeight: 120,
        },
        deviceCell: {
            width: 134,
            justifyContent: 'flex-start',
            alignItems: 'center',
            paddingBottom: spacing.sm,
            paddingHorizontal: 4,
            borderRightWidth: 1,
            borderRightColor: theme.border,
        },
        descriptionNumber: {
            fontSize: 13,
            fontWeight: '400',
            color: theme.text,
            marginRight: 4,
            minWidth: 14,
        },
        descriptionText: {
            flex: 1,
            fontSize: 13,
            fontWeight: '400',
            color: theme.text,
            lineHeight: 18,
        },
        noteText: {
            flex: 1,
            fontSize: 13,
            fontWeight: '400',
            color: theme.orange[600],
            lineHeight: 18,
        },
    });
