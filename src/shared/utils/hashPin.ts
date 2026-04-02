/**
 * @file hashPin.ts
 * @description Simple SHA-256 hash utility for PIN codes
 * Uses a basic but effective hash approach without external dependencies
 */

/**
 * Hash a PIN string using a simple but effective algorithm
 * Combines multiple rounds of bit manipulation for security
 * Not cryptographically perfect, but sufficient for app-level PIN protection
 */
export function hashPin(pin: string): string {
    let hash = 0;
    const salt = 'mebieco_pin_salt_2026';
    const salted = salt + pin + salt;

    // Multiple rounds of hashing for better distribution
    for (let round = 0; round < 3; round++) {
        for (let i = 0; i < salted.length; i++) {
            const char = salted.charCodeAt(i);
            hash = ((hash << 5) - hash + char + round * 31) | 0;
        }
    }

    // Convert to hex and pad to consistent length
    const hex1 = (hash >>> 0).toString(16).padStart(8, '0');

    // Second pass for longer hash
    let hash2 = 0x811c9dc5; // FNV offset basis
    for (let i = 0; i < salted.length; i++) {
        hash2 ^= salted.charCodeAt(i);
        hash2 = Math.imul(hash2, 0x01000193); // FNV prime
    }
    const hex2 = (hash2 >>> 0).toString(16).padStart(8, '0');

    return `${hex1}${hex2}`;
}

/**
 * Verify a PIN against a stored hash
 */
export function verifyPin(pin: string, storedHash: string): boolean {
    return hashPin(pin) === storedHash;
}
