/**
 * @file SplashScreen.tsx
 * @description React Native Splash Screen Component
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing } from '@/styles';
import { Logo } from '@/shared/components/brand/Logo';
import { Loading } from '@/shared/components/ui/Loading';

interface SplashScreenProps {
    visible: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ visible }) => {
    if (!visible) return null;

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                {/* Logo */}
                <Logo size="large" />

                {/* Loading Indicator */}
                {/* Loading Indicator */}
                <View style={styles.loaderContainer}>
                    <Loading size="large" color={colors.primary} animateExit={false} />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colors.backgroundPrimary,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        width: '100%',
        height: '100%',
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        width: '100%',
    },

    loaderContainer: {
        marginTop: spacing.lg,
        height: 60, // Constrain the Loading component which is flex: 1
        width: 60,
    },
});
