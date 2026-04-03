import { StyleSheet } from 'react-native';
import { Colors, spacing } from '@/styles';

export const getMaterialListStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.backgroundPrimary,
        },
        containerWithPadding: {
            flex: 1,
            paddingHorizontal: spacing.md,
        },
        listContent: {
            paddingBottom: 100,
            flexGrow: 1,
        },
        emptyContent: {
            flex: 1,
        },
        loaderFooter: {
            paddingVertical: spacing.md,
            alignItems: 'center',
        },
    });
