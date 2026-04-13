import { useAppTheme } from '@/styles/themeContext';

export const useChartStyles = () => {
    const theme = useAppTheme();
    return {
        container: {
            backgroundColor: theme.background,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: theme.border,
        },
    };
};
