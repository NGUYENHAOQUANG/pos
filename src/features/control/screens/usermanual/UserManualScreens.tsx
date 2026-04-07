import React from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { useNavigation } from '@react-navigation/native';
import { spacing } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { HeaderDevices } from '@/features/control/components/HeaderDevices';

import { MANUAL_DATA, ManualItem } from '@/features/control/data/userManualData';

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
const ManualRow: React.FC<{ item: ManualItem; theme: Colors }> = ({ item, theme }) => {
    const themedStyles = getStyles(theme);
    return (
        <View style={themedStyles.row}>
            <View style={themedStyles.deviceCell}>
                <Image
                    source={item.icon}
                    style={{ width: 140, height: 105 }}
                    resizeMode="contain"
                />
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

export const UserManualScreens: React.FC = () => {
    const navigation = useNavigation();
    const theme = useAppTheme();
    const themedStyles = getStyles(theme);

    return (
        <View style={themedStyles.container}>
            <HeaderDevices
                title="Giải thích các thiết bị"
                showBackButton={true}
                onBackPress={() => navigation.goBack()}
            />
            <ScrollView
                style={staticStyles.scrollView}
                contentContainerStyle={staticStyles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={themedStyles.tableHeader}>
                    <View style={staticStyles.headerDevice}>
                        <Text style={themedStyles.headerText}>Hình minh họa</Text>
                    </View>
                    <View style={staticStyles.headerDescription}>
                        <Text style={themedStyles.headerText}>Giải thích</Text>
                    </View>
                </View>

                {MANUAL_DATA.map(item => (
                    <ManualRow key={item.id} item={item} theme={theme} />
                ))}
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
        paddingBottom: 40,
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
        tableHeader: {
            flexDirection: 'row',
            backgroundColor: theme.backgroundPrimary,
            borderBottomWidth: 2,
            borderBottomColor: theme.orange[600],
            paddingVertical: spacing.sm,
        },
        headerText: {
            fontSize: 14,
            fontWeight: '700',
            color: theme.text,
            textAlign: 'center',
        },
        row: {
            flexDirection: 'row',
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
            minHeight: 130,
        },
        deviceCell: {
            width: 150,
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: spacing.sm,
            paddingHorizontal: 4,
            borderRightWidth: 1,
            borderRightColor: theme.border,
        },
        descriptionNumber: {
            fontSize: 14,
            fontWeight: '400',
            color: theme.text,
            marginRight: 4,
            minWidth: 14,
        },
        descriptionText: {
            flex: 1,
            fontSize: 14,
            fontWeight: '400',
            color: theme.text,
            lineHeight: 18,
        },
        noteText: {
            flex: 1,
            fontSize: 14,
            fontWeight: '400',
            color: theme.orange[600],
            lineHeight: 18,
        },
    });
