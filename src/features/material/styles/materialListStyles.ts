import { StyleSheet } from 'react-native';
import { spacing } from '@/styles';

export const materialListStyles = StyleSheet.create({
    container: {
        flex: 1,
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
