/**
 * @file layout.ts
 * @description Common layout styles
 * @author LinhDang
 * @created 2025-11-17
 */
import { ViewStyle } from 'react-native';

export const layout = {
    // Flex
    flex: {
        flex1: { flex: 1 } as ViewStyle,
        flexRow: { flexDirection: 'row' } as ViewStyle,
        flexColumn: { flexDirection: 'column' } as ViewStyle,
    },

    // Alignment
    align: {
        center: { alignItems: 'center' } as ViewStyle,
        start: { alignItems: 'flex-start' } as ViewStyle,
        end: { alignItems: 'flex-end' } as ViewStyle,
        stretch: { alignItems: 'stretch' } as ViewStyle,
    },

    justify: {
        center: { justifyContent: 'center' } as ViewStyle,
        start: { justifyContent: 'flex-start' } as ViewStyle,
        end: { justifyContent: 'flex-end' } as ViewStyle,
        between: { justifyContent: 'space-between' } as ViewStyle,
        around: { justifyContent: 'space-around' } as ViewStyle,
        evenly: { justifyContent: 'space-evenly' } as ViewStyle,
    },

    // Common combinations
    centered: {
        alignItems: 'center',
        justifyContent: 'center',
    } as ViewStyle,

    row: {
        flexDirection: 'row',
        alignItems: 'center',
    } as ViewStyle,

    rowBetween: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    } as ViewStyle,
} as const;

export type Layout = typeof layout;
