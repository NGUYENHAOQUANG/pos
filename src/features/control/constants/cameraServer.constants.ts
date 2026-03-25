/**
 * Camera server configuration for local RTSP to WebRTC/HLS conversion.
 *
 * Change GO2RTC_HOST to match your local machine's IP address
 * when running the camera-server demo.
 *
 * Set CAMERA_STREAM_MODE to control which player the app uses:
 * - 'rtsp'   : Use VLCPlayer directly (current, may lag on iOS)
 * - 'webrtc' : Use WebView + go2rtc web player (< 500ms latency)
 * - 'hls'    : Use react-native-video + HLS m3u8 (~3s latency)
 */

/** Stream mode type */
export type CameraStreamMode = 'rtsp' | 'webrtc' | 'hls' | 'mjpeg';

/**
 * Active camera streaming mode.
 * Switch between 'rtsp', 'webrtc', 'hls', or 'mjpeg' to change the player.
 */
export const CAMERA_STREAM_MODE: CameraStreamMode = 'mjpeg';

/**
 * go2rtc camera server host.
 * - Android emulator: use '10.0.2.2' (special IP to reach host machine)
 * - iOS simulator: use 'localhost' or '127.0.0.1'
 * - Real device: use your PC's LAN IP (e.g., '192.168.1.5')
 */
export const CAMERA_SERVER_HOST = '10.0.2.2';

/** Camera server Express API port (default: 3001) */
export const CAMERA_SERVER_PORT = 3001;

/** Camera server base URL */
export const CAMERA_SERVER_URL = `http://${CAMERA_SERVER_HOST}:${CAMERA_SERVER_PORT}`;

/** Register stream response from camera server */
export interface RegisterStreamResponse {
    success: boolean;
    streamId: string;
    webrtcPlayerUrl: string;
    hlsUrl: string;
    webrtcApiUrl: string;
}

/**
 * Register an RTSP stream with the camera server.
 * The server will auto-add it to go2rtc and return playable URLs.
 *
 * Flow: App sends RTSP URL → Server registers in go2rtc → Returns WebRTC/HLS URLs
 */
export const registerCameraStream = async (
    streamId: string,
    rtspUrl: string
): Promise<RegisterStreamResponse> => {
    const response = await fetch(`${CAMERA_SERVER_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ streamId, rtspUrl }),
    });

    if (!response.ok) {
        throw new Error(`Failed to register stream: ${response.status}`);
    }

    return response.json() as Promise<RegisterStreamResponse>;
};
