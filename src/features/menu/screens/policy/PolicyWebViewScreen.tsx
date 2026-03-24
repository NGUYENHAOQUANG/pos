import React, { useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '@/app/navigation/AppStack';
import { HeaderSection } from '@/shared/components/layout/HeaderSection';
import { colors } from '@/styles';

type PolicyWebViewScreenProps = NativeStackScreenProps<AppStackParamList, 'PolicyWebView'>;

// Inject CSS to hide website chrome (header, footer, nav) and show only content
const INJECTED_CSS = `
    header, footer, nav,
    [class*="header"], [class*="Header"],
    [class*="footer"], [class*="Footer"],
    [class*="navbar"], [class*="Navbar"],
    [class*="sidebar"], [class*="Sidebar"],
    [class*="menu"], [class*="Menu"],
    [class*="breadcrumb"], [class*="Breadcrumb"],
    [id*="header"], [id*="footer"], [id*="nav"],
    [id*="menu"], [id*="sidebar"] {
        display: none !important;
    }
    body {
        padding: 12px !important;
        padding-top: 0 !important;
        margin: 0 !important;
    }
    body > div:first-child,
    main, [class*="content"], [class*="Content"],
    [class*="container"], [class*="Container"],
    [class*="wrapper"], [class*="Wrapper"] {
        padding-top: 0 !important;
        margin-top: 0 !important;
    }
`;

const INJECTED_JS = `
    (function() {
        // Inject CSS to hide site chrome
        var style = document.createElement('style');
        style.textContent = \`${INJECTED_CSS}\`;
        document.head.appendChild(style);
    })();
    true;
`;

/**
 * PolicyWebViewScreen - Display policy/terms pages in a WebView
 * Hides website navigation elements and blocks link navigation
 */
export const PolicyWebViewScreen: React.FC<PolicyWebViewScreenProps> = ({ route }) => {
    const { url, title } = route.params;
    const initialUrl = useRef(url);

    return (
        <View style={styles.container}>
            <HeaderSection title={title} />
            <WebView
                source={{ uri: url }}
                style={styles.webview}
                startInLoadingState
                injectedJavaScript={INJECTED_JS}
                onShouldStartLoadWithRequest={request => {
                    // Allow initial page to load inside WebView
                    if (request.url === initialUrl.current) {
                        return true;
                    }
                    // Open other links in external browser
                    Linking.openURL(request.url);
                    return false;
                }}
                renderLoading={() => (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    webview: {
        flex: 1,
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.white,
    },
});
