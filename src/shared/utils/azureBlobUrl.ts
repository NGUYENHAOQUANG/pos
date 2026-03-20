/**
 * @file azureBlobUrl.ts
 * @description Utility to generate Azure Blob Storage SAS tokens and download images.
 * Uses Account Key to generate proper Service SAS tokens via HMAC-SHA256.
 */
import CryptoJS from 'crypto-js';
import RNFS from 'react-native-fs';
import { ENV } from '@/core/config/env';

/**
 * Parse an Azure Blob URL into its components
 * Example: https://shrimpiotdblobs.blob.core.windows.net/mebieco-ai/dev/.../image.jpg
 */
interface AzureBlobParts {
    accountName: string;
    containerName: string;
    blobPath: string;
}

const parseAzureBlobUrl = (blobUrl: string): AzureBlobParts | null => {
    try {
        // Parse URL manually to avoid RN URL type issues
        // Format: https://<account>.blob.core.windows.net/<container>/<blob-path>
        const match = blobUrl.match(/https?:\/\/([^.]+)\.blob\.core\.windows\.net\/([^/]+)\/(.+)/);
        if (!match) return null;

        const accountName = match[1];
        const containerName = match[2];
        const blobPath = match[3];
        return { accountName, containerName, blobPath };
    } catch (_error) {
        console.error('[Azure Blob] Failed to parse URL:', blobUrl);
        return null;
    }
};

/**
 * Generate a Service SAS token for an Azure Blob using Account Key.
 * This creates a Blob-level SAS with read permission.
 */
const generateBlobSasToken = (blobUrl: string): string => {
    const parts = parseAzureBlobUrl(blobUrl);
    if (!parts) return '';

    const accountKey = ENV.AZURE_BLOB_SAS_KEY;
    if (!accountKey) return '';

    const { accountName, containerName, blobPath } = parts;

    // SAS parameters
    const signedVersion = '2022-11-02'; // sv
    const signedResource = 'b'; // sr = blob
    const signedPermissions = 'r'; // sp = read
    const signedProtocol = 'https'; // spr

    // Timestamps: start = now - 15min, expiry = now + 1 hour
    const now = new Date();
    const start = new Date(now.getTime() - 15 * 60 * 1000);
    const expiry = new Date(now.getTime() + 60 * 60 * 1000);
    const signedStart = start.toISOString().replace(/\.\d{3}Z$/, 'Z'); // st
    const signedExpiry = expiry.toISOString().replace(/\.\d{3}Z$/, 'Z'); // se

    // Canonicalized resource: /blob/<account>/<container>/<blob>
    const canonicalizedResource = `/blob/${accountName}/${containerName}/${blobPath}`;

    // String to sign for Service SAS (Blob)
    // Reference: https://learn.microsoft.com/en-us/rest/api/storageservices/create-service-sas
    const stringToSign = [
        signedPermissions, // sp
        signedStart, // st
        signedExpiry, // se
        canonicalizedResource,
        '', // signedIdentifier (si)
        '', // signedIP (sip)
        signedProtocol, // spr
        signedVersion, // sv
        signedResource, // sr
        '', // signedSnapshotTime
        '', // signedEncryptionScope
        '', // rscc (Cache-Control)
        '', // rscd (Content-Disposition)
        '', // rsce (Content-Encoding)
        '', // rscl (Content-Language)
        '', // rsct (Content-Type)
    ].join('\n');

    // Sign with HMAC-SHA256 using the Account Key
    const key = CryptoJS.enc.Base64.parse(accountKey);
    const signature = CryptoJS.HmacSHA256(stringToSign, key);
    const signatureBase64 = CryptoJS.enc.Base64.stringify(signature);

    // Build SAS query string
    const sasParams = new URLSearchParams({
        sv: signedVersion,
        sr: signedResource,
        sp: signedPermissions,
        st: signedStart,
        se: signedExpiry,
        spr: signedProtocol,
        sig: signatureBase64,
    });

    return sasParams.toString();
};

/**
 * Build an Azure Blob URL with a generated SAS token for authenticated access.
 */
export const buildAzureBlobSasUrl = (blobUrl: string): string => {
    if (!blobUrl) return '';

    const sasToken = generateBlobSasToken(blobUrl);
    if (!sasToken) {
        console.error('[Azure Blob] Failed to generate SAS token');
        return blobUrl;
    }

    const separator = blobUrl.includes('?') ? '&' : '?';
    return `${blobUrl}${separator}${sasToken}`;
};

/**
 * Download an image from Azure Blob Storage and return a local cache file URI.
 * Generates a proper SAS token from the Account Key for authentication.
 */
export const downloadAzureBlobImage = async (blobUrl: string): Promise<string> => {
    if (!blobUrl) return '';

    try {
        // Generate SAS URL
        const sasUrl = buildAzureBlobSasUrl(blobUrl);

        // Generate a unique filename from the URL
        const urlParts = blobUrl.split('/');
        const fileName = urlParts[urlParts.length - 1] || `blob_${Date.now()}.jpg`;
        const localPath = `${RNFS.CachesDirectoryPath}/ai_processed_${fileName}`;

        // Check if file already exists in cache
        const exists = await RNFS.exists(localPath);
        if (exists) {
            return `file://${localPath}`;
        }

        // Download with SAS token in URL
        const result = await RNFS.downloadFile({
            fromUrl: sasUrl,
            toFile: localPath,
        }).promise;

        if (result.statusCode === 200) {
            return `file://${localPath}`;
        }

        console.error('[Azure Blob] Download failed with status:', result.statusCode);
        return '';
    } catch (error) {
        console.error('[Azure Blob] Download error:', error);
        return '';
    }
};
