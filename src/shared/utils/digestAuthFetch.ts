import CryptoJS from 'crypto-js';
import RNFS from 'react-native-fs';

interface DigestChallenge {
    realm: string;
    nonce: string;
    qop?: string;
    opaque?: string;
}

const parseDigestChallenge = (header: string): DigestChallenge | null => {
    try {
        const realm = header.match(/realm="([^"]+)"/)?.[1] ?? '';
        const nonce = header.match(/nonce="([^"]+)"/)?.[1] ?? '';
        const qop = header.match(/qop="([^"]+)"/)?.[1];
        const opaque = header.match(/opaque="([^"]+)"/)?.[1];

        if (!nonce) return null;
        return { realm, nonce, qop, opaque };
    } catch {
        return null;
    }
};

const md5 = (str: string): string => CryptoJS.MD5(str).toString();

const generateCnonce = (): string => {
    return Math.random().toString(36).substring(2, 10);
};

/**
 * Download a file using HTTP Digest Authentication.
 * Uses RNFS.downloadFile instead of fetch/blob/FileReader for reliable
 * binary file handling on real Android devices (Hermes engine).
 */
export const downloadWithDigestAuth = async (url: string, savePath: string): Promise<boolean> => {
    try {
        // Parse credentials from URL (format: http://user:pass@host/path)
        const urlMatch = url.match(/http:\/\/([^:]+):([^@]+)@(.+)/);
        if (!urlMatch) return false;

        const username = urlMatch[1];
        const password = urlMatch[2];
        const cleanUrl = `http://${urlMatch[3]}`;

        // Extract URI path for digest calculation
        const pathMatch = cleanUrl.match(/http:\/\/[^/]+(\/[^?]*)/);
        const uri = pathMatch ? pathMatch[1] : '/';

        // Step 1: Send initial request to get 401 challenge
        const initialResponse = await fetch(cleanUrl, {
            method: 'GET',
            // Prevent following redirects and body download
            headers: { Range: 'bytes=0-0' },
        });

        if (initialResponse.status !== 401) {
            // If not 401, auth not required - download directly via RNFS
            if (initialResponse.ok) {
                const result = await RNFS.downloadFile({
                    fromUrl: cleanUrl,
                    toFile: savePath,
                    connectionTimeout: 10000,
                    readTimeout: 10000,
                }).promise;
                return result.statusCode === 200 && result.bytesWritten > 0;
            }
            return false;
        }

        // Step 2: Parse WWW-Authenticate header
        const wwwAuth = initialResponse.headers.get('WWW-Authenticate') || '';
        const challenge = parseDigestChallenge(wwwAuth);
        if (!challenge) return false;

        // Step 3: Calculate digest response
        const nc = '00000001';
        const cnonce = generateCnonce();

        const ha1 = md5(`${username}:${challenge.realm}:${password}`);
        const ha2 = md5(`GET:${uri}`);

        let response: string;
        if (challenge.qop) {
            response = md5(`${ha1}:${challenge.nonce}:${nc}:${cnonce}:auth:${ha2}`);
        } else {
            response = md5(`${ha1}:${challenge.nonce}:${ha2}`);
        }

        // Step 4: Build Authorization header
        let authHeader = `Digest username="${username}", realm="${challenge.realm}", nonce="${challenge.nonce}", uri="${uri}", response="${response}"`;

        if (challenge.qop) {
            authHeader += `, qop=auth, nc=${nc}, cnonce="${cnonce}"`;
        }
        if (challenge.opaque) {
            authHeader += `, opaque="${challenge.opaque}"`;
        }

        // Step 5: Download authenticated file via RNFS (native layer)
        // This avoids the unreliable fetch → blob → FileReader → base64 pipeline
        const downloadResult = await RNFS.downloadFile({
            fromUrl: cleanUrl,
            toFile: savePath,
            headers: {
                Authorization: authHeader,
            },
            connectionTimeout: 10000,
            readTimeout: 10000,
        }).promise;

        return downloadResult.statusCode === 200 && downloadResult.bytesWritten > 0;
    } catch (error) {
        console.error('[DigestAuth] Error:', error);
        return false;
    }
};
