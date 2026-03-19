import React, { useMemo } from 'react';
import { StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { WebView } from 'react-native-webview';

interface LeafletMapProps {
    /** Latitude of the center */
    latitude: number;
    /** Longitude of the center */
    longitude: number;
    /** Zoom level (default: 15) */
    zoom?: number;
    /** Map mode: 'map' for street view, 'satellite' for satellite imagery */
    mode?: 'map' | 'satellite';
    /** Container style */
    style?: StyleProp<ViewStyle>;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
    latitude,
    longitude,
    zoom = 15,
    mode = 'map',
    style,
}) => {
    const html = useMemo(() => {
        // Google Maps tile for normal map view
        const mapTile = 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
        // Google satellite tile (same imagery as Google Maps app)
        const satelliteTile = 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}';

        const tileUrl = mode === 'satellite' ? satelliteTile : mapTile;
        const attribution = '&copy; Google';

        return `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <style>
        * { margin: 0; padding: 0; }
        html, body, #map { width: 100%; height: 100%; background: #2d3a2a; }

        /* Fix tile seam lines on Android WebView */
        .leaflet-tile-container img {
            width: 256.1px !important;
            height: 256.1px !important;
        }
        .leaflet-tile-pane { background: #2d3a2a; }

        /* Zoom control container */
        .leaflet-control-zoom {
            border: none !important;
            border-radius: 12px !important;
            overflow: hidden;
            box-shadow: 0 2px 6px rgba(0,0,0,0.2) !important;
        }
        .leaflet-control-zoom a {
            width: 36px !important;
            height: 36px !important;
            line-height: 36px !important;
            font-size: 18px !important;
            color: #333 !important;
            border: none !important;
            background: white !important;
        }
        .leaflet-control-zoom a:hover { background: #f4f4f4 !important; }

        /* Locate button */
        .locate-btn {
            width: 36px; height: 36px;
            background: white;
            border: none;
            border-radius: 12px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            color: #333;
            box-shadow: 0 2px 6px rgba(0,0,0,0.2);
            margin-bottom: 8px !important;
        }
        .locate-btn:active { background: #f0f0f0; }
    </style>
</head>
<body>
    <div id="map"></div>
    <script>
        var lat = ${latitude}, lng = ${longitude}, defaultZoom = ${zoom};

        var map = L.map('map', {
            zoomControl: false,
            attributionControl: false
        }).setView([lat, lng], defaultZoom);

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        // Custom locate button - flies back to marker
        var LocateControl = L.Control.extend({
            options: { position: 'bottomright' },
            onAdd: function() {
                var btn = L.DomUtil.create('div', 'locate-btn');
                btn.innerHTML = '⌖';
                btn.title = 'Quay về vị trí ghim';
                L.DomEvent.disableClickPropagation(btn);
                btn.onclick = function() {
                    map.flyTo([lat, lng], defaultZoom, { duration: 0.5 });
                };
                return btn;
            }
        });
        new LocateControl().addTo(map);

        L.tileLayer('${tileUrl}', {
            maxZoom: 19,
            attribution: '${attribution}'
        }).addTo(map);
    </script>
</body>
</html>`;
    }, [latitude, longitude, zoom, mode]);

    return (
        <WebView
            source={{ html }}
            style={[styles.webview, style]}
            scrollEnabled={true}
            bounces={false}
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState
            originWhitelist={['*']}
            nestedScrollEnabled={true}
        />
    );
};

const styles = StyleSheet.create({
    webview: {
        flex: 1,
        backgroundColor: 'transparent',
    },
});
