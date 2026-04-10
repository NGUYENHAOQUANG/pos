import { NewsItem } from '@/features/menu/types/news.types';

/** Map tab label to RSS feed URL */
const RSS_URLS: Record<string, string> = {
    'Tất cả': 'https://tepbac.com/feeds/news/moi.xml',
    'Tin tức thị trường': 'https://tepbac.com/feeds/news.xml',
    'Kỹ thuật': 'https://tepbac.com/feeds/technical.xml',
};

const DEFAULT_RSS_URL = RSS_URLS['Tất cả'];
const FALLBACK_IMAGE = 'https://picsum.photos/seed/shrimp/400/200';

const FETCH_HEADERS = {
    'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    Accept: 'application/rss+xml,application/xml;q=0.9',
};

const extractTag = (xml: string, tag: string): string | null => {
    const match = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`));
    return match ? match[1] : null;
};

const stripCdata = (text: string): string =>
    text.replace('<![CDATA[', '').replace(']]>', '').trim();

/**
 * Format a date string from RSS pubDate to DD/MM/YYYY.
 */
const formatDate = (pubDate: string): string => {
    const d = new Date(pubDate);
    if (isNaN(d.getTime())) return '';

    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}/${d.getFullYear()}`;
};

/**
 * Extract description from RSS item, handling both CDATA and plain text.
 */
const extractDescription = (itemXml: string): string => {
    const cdataMatch = itemXml.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/);
    if (cdataMatch) return cdataMatch[1].trim();

    const plainMatch = extractTag(itemXml, 'description');
    return plainMatch ? stripCdata(plainMatch) : '';
};

/**
 * Extract image URL from RSS item.
 */
const extractImage = (itemXml: string): string => {
    const match = itemXml.match(/<meta property="og:image" content="([^"]+)"/);
    return match ? match[1] : FALLBACK_IMAGE;
};

/**
 * Parse a single RSS <item> into a NewsItem, or null if invalid.
 */
const parseRssItem = (itemXml: string, index: number): NewsItem | null => {
    const title = extractTag(itemXml, 'title');
    const link = extractTag(itemXml, 'link');

    if (!title || !link) return null;

    const pubDate = extractTag(itemXml, 'pubDate');

    return {
        id: `news-${index}-${Date.now()}`,
        title: stripCdata(title),
        link,
        summary: extractDescription(itemXml),
        date: pubDate ? formatDate(pubDate) : '',
        image: extractImage(itemXml),
    };
};

/**
 * Fetch and parse news data from tepbac.com RSS feeds.
 */
export const fetchNewsData = async (type: string): Promise<NewsItem[]> => {
    const url = RSS_URLS[type] ?? DEFAULT_RSS_URL;

    const response = await fetch(url, { headers: FETCH_HEADERS });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const xml = await response.text();
    const results: NewsItem[] = [];

    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match: RegExpExecArray | null;
    let index = 0;

    while ((match = itemRegex.exec(xml)) !== null) {
        const item = parseRssItem(match[1], index++);
        if (item) results.push(item);
    }

    return results;
};
