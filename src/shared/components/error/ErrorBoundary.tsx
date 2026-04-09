import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { Button } from '@/shared/components/buttons/Button';
import { spacing } from '@/styles';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        // Log to error reporting service (e.g., Sentry)
        // logErrorToService(error, errorInfo);

        this.setState({
            error,
            errorInfo,
        });
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <ErrorBoundaryFallback
                    error={this.state.error}
                    errorInfo={this.state.errorInfo}
                    onReset={this.handleReset}
                />
            );
        }

        return this.props.children;
    }
}

// ─── Functional Fallback Component (Supports Theme Hooks) ───────────
import { useAppTheme } from '@/styles/themeContext';
import { NavigationContext } from '@react-navigation/native';

interface ErrorBoundaryFallbackProps {
    error: Error | null;
    errorInfo: ErrorInfo | null;
    onReset: () => void;
}

const ErrorBoundaryFallback: React.FC<ErrorBoundaryFallbackProps> = ({
    error,
    errorInfo,
    onReset,
}) => {
    const theme = useAppTheme();
    const themedStyles = getStyles(theme);
    const navigation = React.useContext(NavigationContext);

    const handleBack = () => {
        onReset();
        if (navigation && navigation.canGoBack()) {
            navigation.goBack();
        }
    };

    return (
        <View style={themedStyles.container}>
            {/* Content area - centered */}
            <View style={themedStyles.content}>
                <Text style={themedStyles.title}>😔 Oops! Có lỗi xảy ra</Text>
                <Text style={themedStyles.message}>
                    Chúng tôi xin lỗi vì sự bất tiện này. Ứng dụng đã gặp lỗi không mong muốn.
                </Text>

                {__DEV__ && error && (
                    <View style={themedStyles.errorDetails}>
                        <Text style={themedStyles.errorTitle}>Error Details (Dev Mode):</Text>
                        <Text style={themedStyles.errorText}>{error.toString()}</Text>
                        {errorInfo && (
                            <Text style={themedStyles.errorStack}>{errorInfo.componentStack}</Text>
                        )}
                    </View>
                )}
            </View>

            {/* Button area - pinned to bottom */}
            <View style={themedStyles.buttonContainer}>
                {__DEV__ ? (
                    <Button
                        title="Thử lại"
                        onPress={onReset}
                        variant="primary"
                        size="large"
                        fullWidth
                    />
                ) : (
                    <Button
                        title="Quay lại"
                        onPress={handleBack}
                        variant="primary"
                        size="large"
                        fullWidth
                    />
                )}
            </View>
        </View>
    );
};

const getStyles = (theme: ReturnType<typeof useAppTheme>) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.background,
        },
        content: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: spacing.xl,
        },
        title: {
            fontSize: 24,
            fontWeight: '700',
            marginBottom: spacing.sm,
            textAlign: 'center',
            color: theme.text,
        },
        message: {
            fontSize: 16,
            textAlign: 'center',
            marginBottom: spacing.lg,
            color: theme.textSecondary,
            lineHeight: 24,
        },
        errorDetails: {
            backgroundColor: theme.backgroundSecondary,
            padding: spacing.md,
            borderRadius: 8,
            maxHeight: 300,
            width: '100%',
            borderWidth: 1,
            borderColor: theme.border,
        },
        errorTitle: {
            fontSize: 14,
            fontWeight: '700',
            marginBottom: spacing.sm,
            color: theme.text,
        },
        errorText: {
            fontSize: 12,
            color: theme.error,
            marginBottom: spacing.sm,
        },
        errorStack: {
            fontSize: 10,
            color: theme.textSecondary,
        },
        buttonContainer: {
            paddingHorizontal: spacing.xl,
            paddingBottom: 40,
        },
    });
