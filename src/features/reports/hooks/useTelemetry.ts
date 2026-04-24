/**
 * @file useTelemetry.ts
 * @description Hook to connect SignalR telemetry and receive real-time env data for a pond
 */
import { useEffect, useRef, useCallback, useState } from 'react';
import { telemetryService, TelemetryMeasurement } from '@/core/services/signalr.service';

/** Single data point received in real-time */
export interface TelemetryDataPoint {
    deviceId: string;
    timestamp: string;
    measurements: TelemetryMeasurement;
}

/** Connection state type */
type ConnectionState = 'connected' | 'disconnected' | 'reconnecting';

interface UseTelemetryOptions {
    /** Pond ID to subscribe to (pass undefined/null to skip) */
    pondId?: string | null;
    /** Device ID to subscribe to (pass undefined/null to skip) */
    deviceId?: string | null;
    /** Whether the hook is enabled (default: true) */
    enabled?: boolean;
}

interface UseTelemetryReturn {
    /** All received data points (latest first) */
    dataPoints: TelemetryDataPoint[];
    /** Latest single data point */
    latestPoint: TelemetryDataPoint | null;
    /** Connection state */
    connectionState: ConnectionState;
    /** Whether currently connected */
    isConnected: boolean;
    /** Clear accumulated data */
    clearData: () => void;
}

/**
 * Hook to subscribe to real-time telemetry data via SignalR.
 *
 * Usage:
 * ```ts
 * const { dataPoints, latestPoint, isConnected } = useTelemetry({ pondId: 'some-guid' });
 * ```
 */
export const useTelemetry = ({
    pondId,
    deviceId,
    enabled = true,
}: UseTelemetryOptions): UseTelemetryReturn => {
    const [dataPoints, setDataPoints] = useState<TelemetryDataPoint[]>([]);
    const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
    const mountedRef = useRef(true);

    const clearData = useCallback(() => {
        setDataPoints([]);
    }, []);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    // Connect and subscribe
    useEffect(() => {
        if (!enabled) return;

        const hasPond = pondId != null && pondId !== '';
        const hasDevice = deviceId != null && deviceId !== '';
        if (!hasPond && !hasDevice) return;

        // Clear old data when switching pond/device
        setDataPoints([]);

        let removeDataListener: (() => void) | undefined;
        let removeStateListener: (() => void) | undefined;

        const setup = async () => {
            // Add listeners before connecting
            removeDataListener = telemetryService.addDataListener(
                (devId, timestamp, measurements) => {
                    if (!mountedRef.current) return;

                    const point: TelemetryDataPoint = {
                        deviceId: devId,
                        timestamp,
                        measurements,
                    };

                    setDataPoints(prev => [point, ...prev]);
                }
            );

            removeStateListener = telemetryService.addStateListener(state => {
                if (!mountedRef.current) return;
                setConnectionState(state);
            });

            try {
                await telemetryService.connect();

                if (hasPond) {
                    await telemetryService.subscribeToPond(pondId!);
                }
                if (hasDevice) {
                    await telemetryService.subscribeToDevice(deviceId!);
                }
            } catch (err) {
                console.warn('[useTelemetry] Setup error:', err);
            }
        };

        setup();

        // Cleanup: unsubscribe when deps change or unmount
        return () => {
            if (hasPond) {
                telemetryService.unsubscribeFromPond(pondId!).catch(() => {});
            }
            if (hasDevice) {
                telemetryService.unsubscribeFromDevice(deviceId!).catch(() => {});
            }
            removeDataListener?.();
            removeStateListener?.();
        };
    }, [pondId, deviceId, enabled]);

    const latestPoint = dataPoints.length > 0 ? dataPoints[0] : null;

    return {
        dataPoints,
        latestPoint,
        connectionState,
        isConnected: connectionState === 'connected',
        clearData,
    };
};
