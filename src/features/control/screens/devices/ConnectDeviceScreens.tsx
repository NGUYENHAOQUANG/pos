import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Platform, StatusBar } from 'react-native';
import {
    useNavigation,
    useRoute,
    RouteProp,
    CompositeNavigationProp,
    CommonActions,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { ControlStackParamList } from '@/features/control/navigation/ControlNavigator';
import { ConnectDevice } from '@/features/control/components/devices/ConnectDevice';
import { colors } from '@/styles';
import { useControl } from '@/features/control/context/ControlContext';

// Define MainTabParams since it's not exported globally yet
type MainTabParamList = {
    Devices: {
        screen: string;
        params?: { connectedPondName?: string };
    };
    // ... other tabs can be added if needed
};

type ConnectDeviceScreenRouteProp = RouteProp<ControlStackParamList, 'ConnectDevice'>;

// Composite Property for Navigation
type ConnectDeviceScreenNavigationProp = CompositeNavigationProp<
    NativeStackNavigationProp<ControlStackParamList, 'ConnectDevice'>,
    BottomTabNavigationProp<MainTabParamList>
>;

export const ConnectDeviceScreens = () => {
    const navigation = useNavigation<ConnectDeviceScreenNavigationProp>();
    const route = useRoute<ConnectDeviceScreenRouteProp>();

    // Params are required in navigator, so we can access directly
    const { pondName } = route.params;
    const { connectDeviceToPond } = useControl();
    const [isFlashOn, setIsFlashOn] = useState(false);

    useEffect(() => {
        // Simulate camera permission check
        // In a real app with react-native-vision-camera, we would request permission here
        console.log('Camera permission requested: GRANTED');
    }, []);

    const handleClose = () => {
        navigation.goBack();
    };

    const handleConnect = (code: string) => {
        // Handle connection logic here
        console.log('Connected with code:', code);
        connectDeviceToPond(pondName, code);

        // Force reset the navigation stack to ensure we are exactly where we want to be
        navigation.dispatch(
            CommonActions.reset({
                index: 1,
                routes: [{ name: 'ControlList' }, { name: 'ControlDetail', params: { pondName } }],
            })
        );
    };

    const toggleFlash = () => {
        setIsFlashOn(!isFlashOn);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="black" />

            {/* Camera View Placeholder */}
            {/* In a real implementation, <Camera /> would go here */}
            <View style={styles.cameraPreview}>
                {/* Simulated Camera Feed Image or Dark Background */}
                {/* We just use a dark background to simulate low-light camera feed or waiting for stream */}
            </View>

            {/* Camera Overlay Content */}
            <View style={styles.overlayLayer}>
                {/* QR Frame - Visual Guide */}
                <View style={styles.centerContainer}>
                    <View style={styles.qrFrame}>
                        {/* We could add corner markers here if needed for more detail */}
                    </View>
                </View>
            </View>

            {/* Connect Device Bottom Sheet Modal */}
            <ConnectDevice
                visible={true} // Always visible when on this screen
                onClose={handleClose}
                pondName={pondName}
                onConnect={handleConnect}
                isFlashOn={isFlashOn}
                onToggleFlash={toggleFlash}
            />
        </View>
    );
};

const { width, height } = Dimensions.get('window');
const QR_FRAME_SIZE = width * 0.7;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    cameraPreview: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#111', // Dark placeholder
    },
    overlayLayer: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 1,
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 44,
    },
    // Remvoed topControls and flashButton styles as they are moved to component
    centerContainer: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: height * 0.15, // Scale position based on screen height (approx 15% from top)
    },
    qrFrame: {
        width: QR_FRAME_SIZE,
        height: QR_FRAME_SIZE,
        borderWidth: 1,
        borderColor: colors.borderDark,
        backgroundColor: 'transparent',
        borderRadius: 8,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 5,
    },
});
