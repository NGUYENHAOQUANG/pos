/**
 * Serialize params object to query string.
 * Arrays are serialized as repeated keys: key=a&key=b
 * Null/undefined values are skipped.
 */
export function serializeParams(params: Record<string, unknown> | undefined): string {
    if (!params) return '';

    const parts: string[] = [];

    Object.entries(params).forEach(([key, value]) => {
        if (value == null) return;

        if (Array.isArray(value)) {
            value.forEach(item => {
                if (item != null) {
                    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(item))}`);
                }
            });
        } else {
            parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
        }
    });

    return parts.join('&');
}
