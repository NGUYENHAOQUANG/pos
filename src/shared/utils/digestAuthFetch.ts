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

export const downloadWithDigestAuth = async (url: string, savePath: string): Promise<boolean> => {
    try {
        // Parse credentials from URL
        const urlMatch = url.match(/http:\/\/([^:]+):([^@]+)@(.+)/);
        if (!urlMatch) return false;

        const username = urlMatch[1];
        const password = urlMatch[2];
        const cleanUrl = `http://${urlMatch[3]}`;

        // Extract URI path for digest calculation
        const pathMatch = cleanUrl.match(/http:\/\/[^/]+(\/[^?]*)/);
        const uri = pathMatch ? pathMatch[1] : '/';

        // Step 1: Send initial request to get 401 challenge
        const initialResponse = await fetch(cleanUrl, { method: 'GET' });

        if (initialResponse.status !== 401) {
            // If not 401, maybe auth not required - try to save directly
            if (initialResponse.ok) {
                const blob = await initialResponse.blob();
                const reader = new FileReader();
                return new Promise(resolve => {
                    reader.onload = async () => {
                        const base64 = (reader.result as string).split(',')[1];
                        if (base64) {
                            await RNFS.writeFile(savePath, base64, 'base64');
                            resolve(true);
                        } else {
                            resolve(false);
                        }
                    };
                    reader.onerror = () => resolve(false);
                    reader.readAsDataURL(blob);
                });
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

        // Step 5: Send authenticated request
        const authResponse = await fetch(cleanUrl, {
            method: 'GET',
            headers: {
                Authorization: authHeader,
            },
        });

        if (!authResponse.ok) return false;

        // Step 6: Save response as file
        const blob = await authResponse.blob();
        const reader = new FileReader();

        return new Promise(resolve => {
            reader.onload = async () => {
                try {
                    const base64 = (reader.result as string).split(',')[1];
                    if (base64) {
                        await RNFS.writeFile(savePath, base64, 'base64');
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                } catch {
                    resolve(false);
                }
            };
            reader.onerror = () => resolve(false);
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error('[DigestAuth] Error:', error);
        return false;
    }
};
