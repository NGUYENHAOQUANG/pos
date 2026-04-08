import React, { useState, useMemo, useCallback } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/shared/components';
import { HeaderSection } from '@/shared/components/layout/HeaderSection';

import { borderRadius, spacing } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { useNavigation } from '@react-navigation/native';
import { AuthStackNavigationProp } from '@/app/navigation/types';

// ─── SVG Icons ───────────────────────────────────────────────────────────────

import CheckCircleGreenIcon from '@/assets/Icon/IconPolicy/CheckCircleGreen.svg';
import DatabaseIcon from '@/assets/Icon/IconPolicy/Database.svg';
import ProhibitIcon from '@/assets/Icon/IconPolicy/Prohibit.svg';
import CheckFatIcon from '@/assets/Icon/IconPolicy/CheckFat.svg';
import ClockIcon from '@/assets/Icon/IconPolicy/Clock.svg';
import UserIcon from '@/assets/Icon/IconPolicy/User.svg';
import CheckCircleIcon from '@/assets/Icon/IconPolicy/CheckCircle.svg';
import CaretUpIcon from '@/assets/Icon/IconPolicy/CaretUp.svg';
import FilePdfIcon from '@/assets/Icon/IconPolicy/FilePdf.svg';
import DownloadIcon from '@/assets/Icon/IconPolicy/Download.svg';

// ─── Types ───────────────────────────────────────────────────────────────────

interface PolicySection {
    id: string;
    title: string;
    icon: React.FC<{ width: number; height: number; color?: string }>;
    content: string;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const POLICY_SECTIONS: PolicySection[] = [
    {
        id: '1',
        title: 'Điều 1 - Phạm vi thu nhập dữ liệu',
        icon: DatabaseIcon,
        content:
            'Mebieco thu thập các thông tin cá nhân mà bạn cung cấp khi đăng ký tài khoản, bao gồm: họ tên, số điện thoại, email, địa chỉ. Ngoài ra, dữ liệu liên quan đến vận hành ao nuôi tôm cũng được thu thập nhằm phục vụ việc quản lý và tối ưu hóa quy trình sản xuất.',
    },
    {
        id: '2',
        title: 'Điều 2 - Dữ liệu tuyệt đối không thu nhập',
        icon: ProhibitIcon,
        content:
            'Mebieco cam kết tuyệt đối không thu thập các dữ liệu nhạy cảm như: thông tin tài chính cá nhân, mật khẩu ngân hàng, dữ liệu sinh trắc học, thông tin y tế, hoặc bất kỳ dữ liệu nào không liên quan đến hoạt động quản lý ao nuôi tôm.',
    },
    {
        id: '3',
        title: 'Điều 3 - Mục đích xử lý dữ liệu',
        icon: CheckCircleIcon,
        content:
            'Dữ liệu của bạn được sử dụng nhằm: cung cấp và cải thiện dịch vụ quản lý ao nuôi, phân tích và đưa ra khuyến nghị vận hành, hỗ trợ kỹ thuật, và liên lạc khi cần thiết. Mebieco không sử dụng dữ liệu của bạn cho mục đích thương mại với bên thứ ba.',
    },
    {
        id: '4',
        title: 'Title',
        icon: CheckFatIcon,
        content:
            'Dữ liệu cá nhân của bạn sẽ được lưu trữ trong suốt thời gian bạn sử dụng dịch vụ. Sau khi tài khoản bị xóa hoặc ngừng hoạt động, dữ liệu sẽ được bảo quản tối đa 30 ngày trước khi xóa vĩnh viễn khỏi hệ thống.',
    },
    {
        id: '5',
        title: 'Title',
        icon: UserIcon,
        content:
            'Bạn có quyền: truy cập, chỉnh sửa, xóa dữ liệu cá nhân của mình bất cứ lúc nào; yêu cầu ngừng xử lý dữ liệu; và rút lại sự đồng ý đã cấp trước đó. Mọi yêu cầu sẽ được xử lý trong vòng 72 giờ làm việc.',
    },
    {
        id: '6',
        title: 'Title',
        icon: ClockIcon,
        content:
            'Mebieco áp dụng các biện pháp bảo mật tiêu chuẩn ngành bao gồm mã hóa dữ liệu, kiểm soát truy cập, và giám sát liên tục nhằm bảo vệ dữ liệu cá nhân của bạn khỏi truy cập trái phép, mất mát hoặc hư hỏng.',
    },
];

// ─── Accordion Item Component ────────────────────────────────────────────────

interface AccordionItemProps {
    section: PolicySection;
    isExpanded: boolean;
    onToggle: () => void;
    theme: Colors;
}

const AccordionItem: React.FC<AccordionItemProps> = React.memo(
    ({ section, isExpanded, onToggle, theme }) => {
        const styles = useMemo(() => getStyles(theme), [theme]);
        const IconComponent = section.icon;

        return (
            <View style={styles.accordionCard}>
                <TouchableOpacity
                    style={styles.accordionHeader}
                    onPress={onToggle}
                    activeOpacity={0.7}
                >
                    <View style={styles.accordionHeaderLeft}>
                        <IconComponent width={20} height={20} color={theme.text} />
                        <Text style={styles.accordionTitle}>{section.title}</Text>
                    </View>
                    <View style={[styles.caretIcon, !isExpanded && styles.caretIconDown]}>
                        <CaretUpIcon width={14} height={14} color={theme.textSecondary} />
                    </View>
                </TouchableOpacity>
                {isExpanded && (
                    <View style={styles.accordionContent}>
                        <Text style={styles.accordionText}>{section.content}</Text>
                    </View>
                )}
            </View>
        );
    }
);

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function DataPolicyScreen() {
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['1', '2', '3']));

    const navigation = useNavigation<AuthStackNavigationProp>();
    const theme = useAppTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);

    const toggleSection = useCallback((id: string) => {
        setExpandedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    const handleAgreeAndContinue = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <HeaderSection title="Chính Sách Bảo Vệ Dữ Liệu" includeSafeArea={false} />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header description card */}
                <View style={styles.headerCard}>
                    <CheckCircleGreenIcon width={32} height={32} />
                    <Text style={styles.headerTitle}>Chính Sách Bảo Vệ Dữ Liệu</Text>
                    <Text style={styles.headerDescription}>
                        Mebieco cam kết bảo vệ quyền lợi của người nuôi tôm. Dữ liệu vận hành ao của
                        bạn thuộc về bạn theo Nghị định 13/2023/NĐ-CP
                    </Text>
                </View>

                {/* Accordion section cards */}
                {POLICY_SECTIONS.map(section => (
                    <AccordionItem
                        key={section.id}
                        section={section}
                        isExpanded={expandedIds.has(section.id)}
                        onToggle={() => toggleSection(section.id)}
                        theme={theme}
                    />
                ))}

                {/* PDF attachment card */}
                <View style={styles.pdfCard}>
                    <View style={styles.pdfIconContainer}>
                        <FilePdfIcon width={32} height={32} />
                    </View>
                    <View style={styles.pdfInfo}>
                        <Text style={styles.pdfFileName}>Chính sách.pdf</Text>
                        <Text style={styles.pdfFileSize}>148 KB</Text>
                    </View>
                    <TouchableOpacity activeOpacity={0.7}>
                        <DownloadIcon width={20} height={20} color={theme.textSecondary} />
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Footer button */}
            <View style={styles.footer}>
                <Button
                    title="Đồng ý và tiếp tục"
                    onPress={handleAgreeAndContinue}
                    variant="primary"
                    fullWidth
                />
            </View>
        </SafeAreaView>
    );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.backgroundPrimary,
        },
        scrollView: {
            flex: 1,
        },
        scrollContent: {
            paddingHorizontal: spacing.md,
            paddingBottom: spacing.xl,
            gap: spacing.sm,
        },

        // ─── Header description card ────────────────────────────────
        headerCard: {
            backgroundColor: theme.background,
            borderRadius: borderRadius.sm,
            borderWidth: 1,
            borderColor: theme.border,
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.sm,
            marginTop: spacing.xs,
        },
        headerTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.text,
            lineHeight: 28,
            marginTop: spacing.sm,
        },
        headerDescription: {
            fontSize: 14,
            fontWeight: '400',
            color: theme.textSecondary,
            lineHeight: 20,
            marginTop: spacing.xs,
        },

        // ─── Accordion cards ────────────────────────────────────────
        accordionCard: {
            backgroundColor: theme.background,
            borderRadius: borderRadius.sm,
            borderWidth: 1,
            borderColor: theme.border,
            overflow: 'hidden',
        },
        accordionHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 14,
            paddingHorizontal: spacing.md,
        },
        accordionHeaderLeft: {
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
            marginRight: spacing.sm,
        },
        accordionTitle: {
            fontSize: 14,
            fontWeight: '600',
            color: theme.text,
            marginLeft: spacing.sm,
            flex: 1,
        },
        caretIcon: {
            // Default: pointing up (expanded)
        },
        caretIconDown: {
            transform: [{ rotate: '180deg' }],
        },
        accordionContent: {
            paddingHorizontal: spacing.md,
            paddingBottom: spacing.md,
        },
        accordionText: {
            fontSize: 14,
            fontWeight: '400',
            color: theme.textSecondary,
            lineHeight: 20,
        },

        // ─── PDF attachment card ────────────────────────────────────
        pdfCard: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.background,
            borderRadius: borderRadius.sm,
            borderWidth: 1,
            borderColor: theme.border,
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.md,
        },
        pdfIconContainer: {
            marginRight: spacing.sm,
        },
        pdfInfo: {
            flex: 1,
        },
        pdfFileName: {
            fontSize: 14,
            fontWeight: '500',
            color: theme.text,
        },
        pdfFileSize: {
            fontSize: 12,
            fontWeight: '400',
            color: theme.textSecondary,
            marginTop: 2,
        },

        // ─── Footer ────────────────────────────────────────────────
        footer: {
            paddingHorizontal: spacing.md,
            paddingBottom: spacing.xl + spacing.sm + 12,
            paddingTop: spacing.sm,
        },
    });
