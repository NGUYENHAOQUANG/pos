/**
 * @file signalr.service.ts
 * @description SignalR Telemetry Hub - Real-time environment data connection
 * @created 2026-04-23
 */
import * as signalR from '@microsoft/signalr';
import { ENV } from '@/core/config/env';
import { useAuthStore } from '@/features/auth/store/authStore';

/** Strip API path suffix to get base domain for SignalR hub */
const getBaseUrl = (): string => {
    return ENV.API_URL.replace(/\/api\/v\d+$/, '');
};

/** SignalR Hub URL for telemetry */
const TELEMETRY_HUB_URL = `${getBaseUrl()}/hubs/telemetry`;

/** Reconnection delay pattern (ms) */
const RECONNECT_DELAYS = [0, 2000, 5000, 10000, 30000];

/** Payload structure received from the ReceiveEnvironmentData event */
export interface TelemetryPayload {
    timestamp: string; // ISO date string
    values: string; // JSON string of dynamic key-value pairs
}

/** Parsed measurement values (dynamic keys from IoT device) */
export interface TelemetryMeasurement {
    [metricKey: string]: number;
}

/** Callback type for telemetry data listener */
export type TelemetryDataCallback = (
    deviceId: string,
    timestamp: string,
    measurements: TelemetryMeasurement
) => void;

/** Connection state callback */
export type ConnectionStateCallback = (
    state: 'connected' | 'disconnected' | 'reconnecting'
) => void;

class TelemetryService {
    private connection: signalR.HubConnection | null = null;
    private dataListeners: Set<TelemetryDataCallback> = new Set();
    private stateListeners: Set<ConnectionStateCallback> = new Set();
    private subscribedPonds: Set<string> = new Set();
    private subscribedDevices: Set<string> = new Set();

    /** Get current JWT token from auth store */
    private getAccessToken(): string {
        return useAuthStore.getState().token || '';
    }

    /** Build or rebuild the SignalR connection */
    private buildConnection(): signalR.HubConnection {
        return new signalR.HubConnectionBuilder()
            .withUrl(TELEMETRY_HUB_URL, {
                accessTokenFactory: () => this.getAccessToken(),
                // Skip negotiate to avoid URL.pathname setter issue on React Native Hermes
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets,
            })
            .withAutomaticReconnect(RECONNECT_DELAYS)
            .configureLogging(signalR.LogLevel.Information)
            .build();
    }

    /** Start the SignalR connection */
    async connect(): Promise<void> {
        if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
            return; // Already connected
        }

        // Dispose old connection if exists
        if (this.connection) {
            try {
                await this.connection.stop();
            } catch {
                // Ignore stop errors
            }
        }

        this.connection = this.buildConnection();

        // Register event listeners
        this.connection.on(
            'ReceiveEnvironmentData',
            (deviceId: string, payload: TelemetryPayload) => {
                console.log('[Telemetry] RAW received:', { deviceId, payload });
                try {
                    const measurements: TelemetryMeasurement = JSON.parse(payload.values);
                    console.log('[Telemetry] PARSED measurements:', measurements);
                    this.dataListeners.forEach(cb => cb(deviceId, payload.timestamp, measurements));
                } catch (err) {
                    console.warn('[Telemetry] Failed to parse payload:', err);
                }
            }
        );

        // Connection state handlers
        this.connection.onreconnecting(() => {
            this.notifyState('reconnecting');
        });

        this.connection.onreconnected(async () => {
            this.notifyState('connected');
            // Re-subscribe to all ponds and devices after reconnection
            await this.resubscribeAll();
        });

        this.connection.onclose(() => {
            this.notifyState('disconnected');
        });

        try {
            await this.connection.start();
            this.notifyState('connected');
            console.log('[Telemetry] SignalR Connected!');
        } catch (err) {
            console.error('[Telemetry] SignalR Connection Error:', err);
            this.notifyState('disconnected');
            throw err;
        }
    }

    /** Disconnect and clean up */
    async disconnect(): Promise<void> {
        if (this.connection) {
            try {
                await this.connection.stop();
            } catch (err) {
                console.warn('[Telemetry] Error stopping connection:', err);
            }
            this.connection = null;
        }
        this.subscribedPonds.clear();
        this.subscribedDevices.clear();
    }

    /** Subscribe to a pond's telemetry data */
    async subscribeToPond(pondId: string): Promise<void> {
        if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
            console.warn('[Telemetry] Cannot subscribe - not connected');
            return;
        }
        try {
            await this.connection.invoke('SubscribeToPond', pondId);
            this.subscribedPonds.add(pondId);
        } catch (err) {
            console.error('[Telemetry] SubscribeToPond error:', err);
        }
    }

    /** Unsubscribe from a pond */
    async unsubscribeFromPond(pondId: string): Promise<void> {
        if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
            return;
        }
        try {
            await this.connection.invoke('UnsubscribeFromPond', pondId);
            this.subscribedPonds.delete(pondId);
        } catch (err) {
            console.error('[Telemetry] UnsubscribeFromPond error:', err);
        }
    }

    /** Subscribe to a device's telemetry data */
    async subscribeToDevice(deviceId: string): Promise<void> {
        if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
            console.warn('[Telemetry] Cannot subscribe - not connected');
            return;
        }
        try {
            await this.connection.invoke('SubscribeToDevice', deviceId);
            this.subscribedDevices.add(deviceId);
        } catch (err) {
            console.error('[Telemetry] SubscribeToDevice error:', err);
        }
    }

    /** Unsubscribe from a device */
    async unsubscribeFromDevice(deviceId: string): Promise<void> {
        if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
            return;
        }
        try {
            await this.connection.invoke('UnsubscribeFromDevice', deviceId);
            this.subscribedDevices.delete(deviceId);
        } catch (err) {
            console.error('[Telemetry] UnsubscribeFromDevice error:', err);
        }
    }

    /** Re-subscribe after reconnection */
    private async resubscribeAll(): Promise<void> {
        for (const pondId of this.subscribedPonds) {
            try {
                await this.connection?.invoke('SubscribeToPond', pondId);
            } catch (err) {
                console.warn('[Telemetry] Re-subscribe pond failed:', pondId, err);
            }
        }
        for (const deviceId of this.subscribedDevices) {
            try {
                await this.connection?.invoke('SubscribeToDevice', deviceId);
            } catch (err) {
                console.warn('[Telemetry] Re-subscribe device failed:', deviceId, err);
            }
        }
    }

    /** Add a data listener */
    addDataListener(callback: TelemetryDataCallback): () => void {
        this.dataListeners.add(callback);
        return () => this.dataListeners.delete(callback);
    }

    /** Add a connection state listener */
    addStateListener(callback: ConnectionStateCallback): () => void {
        this.stateListeners.add(callback);
        return () => this.stateListeners.delete(callback);
    }

    /** Notify all state listeners */
    private notifyState(state: 'connected' | 'disconnected' | 'reconnecting'): void {
        this.stateListeners.forEach(cb => cb(state));
    }

    /** Check if currently connected */
    get isConnected(): boolean {
        return this.connection?.state === signalR.HubConnectionState.Connected;
    }
}

/** Singleton instance */
export const telemetryService = new TelemetryService();
