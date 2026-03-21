import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle, Platform } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius, typography, sizes } from '@/styles';

// Import WebView directly
import { WebView } from 'react-native-webview';

interface MapViewProps {
    latitude?: number;
    longitude?: number;
    onLocationChange?: (latitude: number, longitude: number) => void;
    onEditPress?: () => void;
    style?: ViewStyle;
    height?: number;
    editable?: boolean;
}

const DEFAULT_LATITUDE = 10.8231; // Ho Chi Minh City, Vietnam
const DEFAULT_LONGITUDE = 106.6297;

export function MapView({
    latitude = DEFAULT_LATITUDE,
    longitude = DEFAULT_LONGITUDE,
    onLocationChange,
    onEditPress,
    style,
    height = 200,
    editable = true,
}: MapViewProps) {
    const [currentLat, setCurrentLat] = useState(latitude);
    const [currentLng, setCurrentLng] = useState(longitude);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const webViewRef = useRef<WebView>(null);

    // Update coordinates when props change
    React.useEffect(() => {
        setCurrentLat(latitude);
        setCurrentLng(longitude);
        // Reload WebView when coordinates change
        if (webViewRef.current) {
            webViewRef.current.reload();
        }
    }, [latitude, longitude]);

    // OpenStreetMap Leaflet HTML - useMemo to regenerate when coordinates change
    const mapHtml = React.useMemo(() => {
        const lat = currentLat;
        const lng = currentLng;
        return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
            integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
            crossorigin=""/>
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
              integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
              crossorigin=""></script>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { width: 100%; height: 100%; overflow: hidden; }
        #map { width: 100%; height: 100%; }
        .leaflet-container { background: #f0f0f0; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        try {
          var map = L.map('map', {
            zoomControl: true,
            dragging: true,
            touchZoom: true,
            doubleClickZoom: true,
            scrollWheelZoom: true,
            boxZoom: true,
            keyboard: true
          }).setView([${lat}, ${lng}], 13);

          var marker = L.marker([${lat}, ${lng}], {
            draggable: true,
            icon: L.icon({
              iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
              shadowSize: [41, 41]
            })
          }).addTo(map);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
            tileSize: 256,
            zoomOffset: 0
          }).addTo(map);

          marker.on('dragend', function(e) {
            var position = marker.getLatLng();
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'locationChange',
                latitude: position.lat,
                longitude: position.lng
              }));
            }
          });

          map.on('click', function(e) {
            marker.setLatLng(e.latlng);
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'locationChange',
                latitude: e.latlng.lat,
                longitude: e.latlng.lng
              }));
            }
          });

          // Notify that map is loaded
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'mapLoaded'
            }));
          }
        } catch (error) {
          console.error('Map initialization error:', error);
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'error',
              message: error.message
            }));
          }
        }
      </script>
    </body>
    </html>
    `;
    }, [currentLat, currentLng]);

    const handleMessage = (event: any) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'locationChange') {
                setCurrentLat(data.latitude);
                setCurrentLng(data.longitude);
                onLocationChange?.(data.latitude, data.longitude);
            } else if (data.type === 'mapLoaded') {
                setIsLoading(false);
                setHasError(false);
            } else if (data.type === 'error') {
                console.error('Map error:', data.message);
                setHasError(true);
                setIsLoading(false);
            }
        } catch (error) {
            console.error('Error parsing map message:', error);
        }
    };

    const handleLoadStart = () => {
        setIsLoading(true);
        setHasError(false);
    };

    const handleLoadEnd = () => {
        setIsLoading(false);
    };

    const handleError = (syntheticEvent: any) => {
        const { nativeEvent } = syntheticEvent;
        console.error('WebView error: ', nativeEvent);
        setHasError(true);
        setIsLoading(false);
    };

    if (hasError) {
        return (
            <View style={[styles.container, style]}>
                <View style={[styles.mapContainer, { height }]}>
                    <View style={styles.placeholderContainer}>
                        <Ionicons
                            name="map-outline"
                            size={sizes.icon['2xl']}
                            color={colors.textSecondary}
                        />
                        <Text style={styles.placeholderText}>
                            Không thể tải bản đồ{'\n'}
                            Vui lòng kiểm tra kết nối internet
                        </Text>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, style]}>
            <View style={[styles.mapContainer, { height }]}>
                {isLoading && (
                    <View style={styles.loadingContainer}>
                        <Text style={styles.loadingText}>Đang tải bản đồ...</Text>
                    </View>
                )}
                <WebView
                    ref={webViewRef}
                    source={{ html: mapHtml }}
                    style={styles.webview}
                    onMessage={handleMessage}
                    onLoadStart={handleLoadStart}
                    onLoadEnd={handleLoadEnd}
                    onError={handleError}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    startInLoadingState={false}
                    scalesPageToFit={Platform.OS === 'android'}
                    originWhitelist={['*']}
                    mixedContentMode="always"
                    allowsInlineMediaPlayback={true}
                    mediaPlaybackRequiresUserAction={false}
                    cacheEnabled={true}
                    incognito={false}
                />
                {editable && (
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={onEditPress}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="pencil" size={sizes.icon.sm} color={colors.white} />
                        <Text style={styles.editButtonText}>Chỉnh sửa</Text>
                    </TouchableOpacity>
                )}
                <View style={styles.mapLabel}>
                    <Text style={styles.mapLabelText}>Bản đồ</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    mapContainer: {
        width: '100%',
        borderRadius: borderRadius.md,
        overflow: 'hidden',
        backgroundColor: colors.gray[200],
        position: 'relative',
    },
    webview: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    editButton: {
        position: 'absolute',
        bottom: spacing.md,
        right: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        gap: spacing.xs,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
            },
            android: {
                elevation: 5,
            },
        }),
    },
    editButtonText: {
        color: colors.white,
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
    },
    mapLabel: {
        position: 'absolute',
        bottom: spacing.md,
        left: spacing.md,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
    },
    mapLabelText: {
        fontSize: typography.fontSize.xs,
        color: colors.textSecondary,
    },
    placeholderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
    },
    placeholderText: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: spacing.md,
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.gray[100],
        zIndex: 1,
    },
    loadingText: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        marginTop: spacing.sm,
    },
});
