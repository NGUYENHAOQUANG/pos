import { useState, useEffect, useRef } from 'react';
import { RTCPeerConnection, RTCSessionDescription, MediaStream } from 'react-native-webrtc';

export const useWebRTCStream = (url: string) => {
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);
    const peerConnection = useRef<RTCPeerConnection | null>(null);

    useEffect(() => {
        let isMounted = true;

        const startWebRTC = async () => {
            try {
                // Initialize PeerConnection
                const pc = new RTCPeerConnection({
                    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
                });
                peerConnection.current = pc;

                // Set up event listeners (cast to any because react-native-webrtc types miss ontrack)
                (pc as any).ontrack = (event: any) => {
                    if (isMounted && event.streams && event.streams[0]) {
                        setStream(event.streams[0]);
                    }
                };

                (pc as any).onconnectionstatechange = () => {
                    console.log('WebRTC Connection State:', pc.connectionState);
                    if (pc.connectionState === 'failed') {
                        setError('Kết nối WebRTC thất bại');
                    }
                };

                // Add transceivers for receiving video
                pc.addTransceiver('video', { direction: 'recvonly' });
                // pc.addTransceiver('audio', { direction: 'recvonly' }); // If audio is supported

                // Create offer
                const offer = await pc.createOffer({});
                await pc.setLocalDescription(offer);

                // Ensure URL points to the WHEP endpoint for Mediamtx
                const cleanUrl = url.trim();
                const signalingUrl = cleanUrl.endsWith('/whep') ? cleanUrl : `${cleanUrl}/whep`;

                // Send offer to signaling server (WHEP standard)
                const response = await fetch(signalingUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/sdp',
                    },
                    body: offer.sdp,
                });

                if (!response.ok) {
                    throw new Error(`Signaling failed: ${response.status} ${response.statusText}`);
                }

                const answerSdp = await response.text();

                // Set remote description
                const answer = new RTCSessionDescription({
                    type: 'answer',
                    sdp: answerSdp,
                });

                await pc.setRemoteDescription(answer);
            } catch (err: any) {
                if (isMounted) {
                    if (err.message === 'Network request failed') {
                        setError(
                            `Không thể kết nối đến server. Vui lòng kiểm tra lại địa chỉ IP/PORT hoặc mạng Wifi gốc.\n(URL đang gọi: ${url})`
                        );
                    } else {
                        setError(err.message || 'Không thể thiết lập WebRTC');
                    }
                }
            }
        };

        if (url) {
            startWebRTC();
        }

        return () => {
            isMounted = false;
            if (peerConnection.current) {
                peerConnection.current.close();
                peerConnection.current = null;
            }
        };
    }, [url]);

    return { stream, error };
};
