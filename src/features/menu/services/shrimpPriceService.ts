import { ShrimpPrice } from '@/features/menu/types/shrimpPrice.types';

const SCRAPE_URL = 'https://tepbac.com/gia-thuy-san/gia/tom';

const FETCH_HEADERS = {
    'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
};

const RELEVANT_KEYWORDS = ['tôm'];

const stripHtml = (html: string): string =>
    html
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

const parsePrice = (raw: string): { price: number; unit: string } => {
    const parts = raw.split('đ/');
    const numericStr = parts[0].trim().replace(/\./g, '');
    const unit = parts.length > 1 ? `đ/${parts[1].trim()}` : 'đ/kg';
    return { price: Number(numericStr), unit };
};

const parseTrend = (raw: string): { trend: ShrimpPrice['trend']; trendValue: string } => {
    if (raw.includes('▲')) {
        return { trend: 'up', trendValue: raw.replace('▲', '').trim() };
    }
    if (raw.includes('▼')) {
        return { trend: 'down', trendValue: raw.replace('▼', '').trim() };
    }
    return { trend: 'stable', trendValue: '' };
};

const parseNameAndDate = (raw: string): { name: string; dateInfo: string } => {
    const dateMatch = raw.match(/(\d+\s+(giờ|ngày|tuần|tháng)\s+trước)/i);
    const dateInfo = dateMatch?.[0] ?? '';

    const name = raw
        .replace(dateInfo, '')
        .replace(/^[A-Z0-9]+\s+/, '')
        .replace(/[\u{10000}-\u{10FFFF}]/gu, '')
        .trim();

    return { name, dateInfo };
};

const extractCells = (rowHtml: string): string[] => {
    const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/g;
    const cells: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = cellRegex.exec(rowHtml)) !== null) {
        cells.push(stripHtml(match[1]));
    }

    return cells;
};

const parseRow = (rowHtml: string, index: number): ShrimpPrice | null => {
    if (rowHtml.includes('<th')) return null;

    const cells = extractCells(rowHtml);
    if (cells.length < 4) return null;

    const { name, dateInfo } = parseNameAndDate(cells[0]);
    const size = cells[1] || '';
    const { price, unit } = parsePrice(cells[2]);
    const { trend, trendValue } = parseTrend(cells[3]);

    if (!name || !size || isNaN(price) || price <= 0) return null;

    const imgRegex = /<img[^>]+(?:data-src|src)="([^">]+)"/i;
    const imgMatch = rowHtml.match(imgRegex);
    let image: string | undefined = undefined;
    if (imgMatch && imgMatch[1]) {
        image = imgMatch[1].startsWith('http') ? imgMatch[1] : `https://tepbac.com${imgMatch[1]}`;
    }

    return {
        id: `shrimp-${index}-${size}`,
        name,
        size,
        price,
        unit,
        trend,
        trendValue,
        dateInfo,
        image,
    };
};

export const fetchShrimpPriceData = async (): Promise<ShrimpPrice[]> => {
    const response = await fetch(SCRAPE_URL, { headers: FETCH_HEADERS });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const results: ShrimpPrice[] = [];

    const tableRegex = /<table[^>]*>([\s\S]*?)<\/table>/g;
    let tableMatch: RegExpExecArray | null;
    let rowIndex = 0;

    while ((tableMatch = tableRegex.exec(html)) !== null) {
        const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/g;
        let rowMatch: RegExpExecArray | null;

        while ((rowMatch = rowRegex.exec(tableMatch[1])) !== null) {
            const parsed = parseRow(rowMatch[1], rowIndex++);
            if (parsed) results.push(parsed);
        }
    }

    return results.filter(item => {
        const lower = item.name.toLowerCase();
        return RELEVANT_KEYWORDS.some(keyword => lower.includes(keyword));
    });
};
