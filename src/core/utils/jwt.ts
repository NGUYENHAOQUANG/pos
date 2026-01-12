import { Buffer } from 'buffer';

export interface JWTPayload {
    sub?: string;
    name?: string;
    exp?: number;
    iat?: number;
    phone?: string;
    [key: string]: any;
}

export const decodeToken = (token: string): JWTPayload | null => {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;

        const payload = parts[1];
        // Base64Url decode
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        // Add padding if needed
        const pad = base64.length % 4;
        const paddedBase64 = pad ? base64 + '='.repeat(4 - pad) : base64;

        const jsonPayload = Buffer.from(paddedBase64, 'base64').toString('utf8');

        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Failed to decode token:', error);
        return null;
    }
};
