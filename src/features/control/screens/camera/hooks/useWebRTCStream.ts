import { useState, useEffect, useRef } from 'react';
import { RTCPeerConnection, RTCSessionDescription, MediaStream } from 'react-native-webrtc';

export const useWebRTCStream = (url: string) => {
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [statusText, setStatusText] = useState<string>('Khởi tạo...');
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [progress, setProgress] = useState<number>(0);
    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        let isMounted = true;

        const clearFakeProgress = () => {
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
                progressIntervalRef.current = null;
            }
        };

        const startFakeProgress = () => {
            setProgress(0);
            progressIntervalRef.current = setInterval(() => {
                if (!isMounted) {
                    clearFakeProgress();
                    return;
                }
                setProgress(prev => {
                    if (prev >= 99) return 99; // Dừng ở 99% nếu chưa load xong

                    let increment = 1;
                    if (prev < 60) increment = Math.floor(Math.random() * 10) + 5; // 5-15%
                    else if (prev < 85) increment = Math.floor(Math.random() * 5) + 2; // 2-7%
                    else increment = Math.floor(Math.random() * 2) + 1; // 1-2%

                    const next = prev + increment;
                    return next > 99 ? 99 : next;
                });
            }, 100);
        };

        const startWebRTC = async () => {
            try {
                startFakeProgress();

                if (isMounted) setStatusText('Khởi tạo dịch vụ WebRTC...');

                // Initialize PeerConnection
                const pc = new RTCPeerConnection({
                    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
                });
                peerConnection.current = pc;

                // Set up event listeners
                (pc as any).ontrack = (event: any) => {
                    if (isMounted && event.streams && event.streams[0]) {
                        console.log('WebRTC: ontrack received');
                        setStream(event.streams[0]);
                    }
                };

                (pc as any).onconnectionstatechange = () => {
                    console.log('WebRTC Connection State:', pc.connectionState);
                    if (!isMounted) return;
                    switch (pc.connectionState) {
                        case 'new':
                            setStatusText('Đang kết nối...');
                            break;
                        case 'connecting':
                            setStatusText('Đang thiết lập đường truyền...');
                            break;
                        case 'connected':
                            clearFakeProgress();
                            setStatusText('Đã kết nối luồng video');
                            setProgress(100);
                            setIsConnected(true);
                            break;
                        case 'disconnected':
                        case 'failed':
                        case 'closed':
                            clearFakeProgress();
                            setIsConnected(false);
                            if (pc.connectionState === 'failed') {
                                setError('Kết nối WebRTC thất bại');
                            }
                            break;
                    }
                };
                pc.addTransceiver('video', { direction: 'recvonly' });
                pc.addTransceiver('audio', { direction: 'recvonly' });

                // Create offer
                if (isMounted) setStatusText('Đang tạo Offer...');
                const offer = await pc.createOffer({});
                await pc.setLocalDescription(offer);

                const cleanUrl = url.trim();
                const signalingUrl = cleanUrl.endsWith('/whep') ? cleanUrl : `${cleanUrl}/whep`;

                // Send offer to signaling server
                if (isMounted) setStatusText('Đang yêu cầu kết nối...');
                const response = await fetch(signalingUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/sdp' },
                    body: offer.sdp,
                });

                if (!response.ok) {
                    throw new Error(`Signaling failed: ${response.status} ${response.statusText}`);
                }

                if (isMounted) setStatusText('Đang xử lý thiết lập...');
                const answerSdp = await response.text();

                // Set remote description
                const answer = new RTCSessionDescription({
                    type: 'answer',
                    sdp: answerSdp,
                });

                if (isMounted) setStatusText('Đang kết nối P2P...');
                await pc.setRemoteDescription(answer);
            } catch (err: any) {
                clearFakeProgress();
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
            clearFakeProgress();
            if (peerConnection.current) {
                peerConnection.current.close();
                peerConnection.current = null;
            }
        };
    }, [url]);

    return { stream, error, statusText, isConnected, progress };
};
