import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { Button } from '@/shared/components/buttons/Button';
import { colors, spacing } from '@/styles';

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
                <View style={styles.container}>
                    {/* Content area - centered */}
                    <View style={styles.content}>
                        <Text style={styles.title}>😔 Oops! Có lỗi xảy ra</Text>
                        <Text style={styles.message}>
                            Chúng tôi xin lỗi vì sự bất tiện này. Ứng dụng đã gặp lỗi không mong
                            muốn.
                        </Text>

                        {__DEV__ && this.state.error && (
                            <View style={styles.errorDetails}>
                                <Text style={styles.errorTitle}>Error Details (Dev Mode):</Text>
                                <Text style={styles.errorText}>{this.state.error.toString()}</Text>
                                {this.state.errorInfo && (
                                    <Text style={styles.errorStack}>
                                        {this.state.errorInfo.componentStack}
                                    </Text>
                                )}
                            </View>
                        )}
                    </View>

                    {/* Button area - pinned to bottom */}
                    <View style={styles.buttonContainer}>
                        <Button
                            title="Thử lại"
                            onPress={this.handleReset}
                            variant="primary"
                            size="large"
                            fullWidth
                        />
                    </View>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
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
        color: colors.text,
    },
    message: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: spacing.lg,
        color: colors.textSecondary,
        lineHeight: 24,
    },
    errorDetails: {
        backgroundColor: colors.backgroundPrimary,
        padding: spacing.md,
        borderRadius: 8,
        maxHeight: 300,
        width: '100%',
    },
    errorTitle: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: spacing.sm,
        color: colors.text,
    },
    errorText: {
        fontSize: 12,
        color: colors.error,
        marginBottom: spacing.sm,
    },
    errorStack: {
        fontSize: 10,
        color: colors.textSecondary,
    },
    buttonContainer: {
        paddingHorizontal: spacing.xl,
        paddingBottom: 40,
    },
});
