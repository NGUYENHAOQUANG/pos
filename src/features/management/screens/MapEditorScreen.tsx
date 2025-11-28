/**
 * @file MapEditorScreen.tsx
 * @description Map Editor Screen - Full screen map for location selection
 * @author Auto
 * @created 2025-01-27
 */
import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import {
  SafeAreaView,
} from 'react-native-safe-area-context';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {RootStackNavigationProp, RootStackParamList} from '@/app/navigation/types';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Input} from '@/shared/components';
import {WebView} from 'react-native-webview';
import {colors, spacing, borderRadius, typography, sizes} from '@/styles';

type MapEditorRouteProp = RouteProp<RootStackParamList, 'MapEditor'>;

const DEFAULT_LATITUDE = 10.8231;
const DEFAULT_LONGITUDE = 106.6297;

export function MapEditorScreen() {
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute<MapEditorRouteProp>();
  const webViewRef = useRef<WebView>(null);

  const params = route.params || {};
  const initialLat = params.latitude || DEFAULT_LATITUDE;
  const initialLng = params.longitude || DEFAULT_LONGITUDE;

  const [currentLat, setCurrentLat] = useState(initialLat);
  const [currentLng, setCurrentLng] = useState(initialLng);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapZoom, setMapZoom] = useState(13);
  const [isLoading, setIsLoading] = useState(true);

  // Map HTML with satellite view option
  const mapHtml = React.useMemo(() => {
    const lat = currentLat;
    const lng = currentLng;
    const zoom = mapZoom;
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { width: 100%; height: 100%; overflow: hidden; }
        #map { width: 100%; height: 100%; }
        .leaflet-container { background: #f0f0f0; }
        .custom-marker {
          background-color: ${colors.primary};
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        try {
          var map = L.map('map', {
            zoomControl: false,
            dragging: true,
            touchZoom: true,
            doubleClickZoom: true,
            scrollWheelZoom: true,
            boxZoom: true,
            keyboard: true
          }).setView([${lat}, ${lng}], ${zoom});

          // Satellite/Street map layers
          var streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
          });

          var satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: '© Esri',
            maxZoom: 19
          });

          // Start with satellite view
          satelliteLayer.addTo(map);

          // Create custom orange marker
          var orangeIcon = L.divIcon({
            className: 'custom-marker',
            html: '',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
          });

          var marker = L.marker([${lat}, ${lng}], {
            draggable: true,
            icon: orangeIcon
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

          map.on('zoomend', function() {
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'zoomChange',
                zoom: map.getZoom()
              }));
            }
          });

          // Notify that map is loaded
          setTimeout(function() {
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'mapLoaded'
              }));
            }
          }, 500);
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
  }, [currentLat, currentLng, mapZoom]);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'locationChange') {
        setCurrentLat(data.latitude);
        setCurrentLng(data.longitude);
      } else if (data.type === 'mapLoaded') {
        setIsLoading(false);
      } else if (data.type === 'zoomChange') {
        setMapZoom(data.zoom);
      }
    } catch (error) {
      console.error('Error parsing map message:', error);
    }
  };

  const handleZoomIn = () => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        if (window.map) {
          window.map.zoomIn();
        }
      `);
    }
  };

  const handleZoomOut = () => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        if (window.map) {
          window.map.zoomOut();
        }
      `);
    }
  };

  const handleDone = () => {
    // Navigate back to CreateFarm with updated location
    navigation.navigate('CreateFarm', {
      updatedLocation: {
        latitude: currentLat,
        longitude: currentLng,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Ionicons name="arrow-back" size={sizes.icon.md} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tạo vùng nuôi</Text>
        <TouchableOpacity
          style={styles.doneButton}
          onPress={handleDone}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Input
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Tìm kiếm theo địa chỉ"
          icon="search-outline"
          containerStyle={styles.searchInput}
        />
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        {isLoading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Đang tải bản đồ...</Text>
          </View>
        )}
        <WebView
          ref={webViewRef}
          source={{html: mapHtml}}
          style={styles.webview}
          onMessage={handleMessage}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          originWhitelist={['*']}
          mixedContentMode="always"
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          cacheEnabled={true}
        />

        {/* Zoom Controls */}
        <View style={styles.zoomControls}>
          <TouchableOpacity
            style={styles.zoomButton}
            onPress={handleZoomIn}
            activeOpacity={0.7}>
            <Ionicons name="add" size={sizes.icon.md} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.zoomButton}
            onPress={handleZoomOut}
            activeOpacity={0.7}>
            <Ionicons name="remove" size={sizes.icon.md} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Instruction Overlay */}
        <View style={styles.instructionOverlay}>
          <Text style={styles.instructionText}>
            Nhấn giữ trên bản đồ để thêm điểm. Nhấn giữ & kéo trên bản đồ để di chuyển
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
    flex: 1,
    textAlign: 'center',
  },
  doneButton: {
    padding: spacing.xs,
  },
  doneButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  searchContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInput: {
    marginBottom: 0,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
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
  zoomControls: {
    position: 'absolute',
    bottom: spacing.xl + 60,
    right: spacing.md,
    gap: spacing.sm,
    zIndex: 10,
  },
  zoomButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  instructionOverlay: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    zIndex: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  instructionText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.fontSize.xs * 1.4,
  },
});
