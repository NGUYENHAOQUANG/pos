import { colors } from '@/styles/colors';

export interface EnvLog {
    date: string;
    pond: string;
    pH: number;
    do: number; // DO (mg/L)
    temp: number; // Nhiệt độ (°C)
    alk: number; // Độ kiềm (mg/L)
    clear: number; // Độ trong (cm)
    salt: number; // Độ mặn (ppt)
}

const generateData = (): EnvLog[] => {
    const data: EnvLog[] = [];
    const ponds = [
        { name: 'N01', baseValue: 6.0, volatility: 0.8 },
        { name: 'N02', baseValue: 5.5, volatility: 0.9 },
        { name: 'N03', baseValue: 4.2, volatility: 0.6 },
        { name: 'N04', baseValue: 6.3, volatility: 0.7 },
        { name: 'N05', baseValue: 5.8, volatility: 1.0 },
        { name: 'V01', baseValue: 3.8, volatility: 0.7 },
        { name: 'V02', baseValue: 5.2, volatility: 0.8 },
        { name: 'V03', baseValue: 3.4, volatility: 0.6 },
        { name: 'V04', baseValue: 3.6, volatility: 0.7 },
        { name: 'V05', baseValue: 4.0, volatility: 0.8 },
    ];

    // Generate dates from 01/11/2025 to 15/12/2025
    let currentDate = new Date(2025, 10, 1); // 1st Nov 2025
    const endDate = new Date(2026, 0, 15); // 15th Jan 2026

    while (currentDate <= endDate) {
        const dateStr = `${currentDate.getDate().toString().padStart(2, '0')}/${(
            currentDate.getMonth() + 1
        )
            .toString()
            .padStart(2, '0')}/${currentDate.getFullYear()}`;

        // Spike rules based on date
        const isSpike1 =
            currentDate.getDate() >= 17 &&
            currentDate.getDate() <= 19 &&
            currentDate.getMonth() === 10;
        const isDip = currentDate.getDate() === 9 && currentDate.getMonth() === 10;
        const isSpike2 =
            currentDate.getDate() >= 7 &&
            currentDate.getDate() <= 8 &&
            currentDate.getMonth() === 11;

        ponds.forEach(pond => {
            let val = pond.baseValue + (Math.random() - 0.5) * pond.volatility;

            if (isSpike1) {
                val += Math.random() * 2 + 1.5; // Spike up
            } else if (isDip) {
                val -= Math.random() * 1.5 + 1; // Dip down
            } else if (isSpike2) {
                val += Math.random() * 1.5 + 1; // Second spike
            }

            data.push({
                date: dateStr,
                pond: pond.name,
                pH: Math.round(val * 10) / 10,
                do: Math.round((val > 2 ? val - 1 : 1) * 10) / 10,
                temp: Math.round((24 + Math.random() * 10) * 10) / 10, // Range: 24 - 34
                alk: Math.round(140 + Math.random() * 80), // Range: 140 - 220
                clear: Math.round((25 + Math.random() * 15) * 10) / 10, // Range: 25 - 40
                salt: Math.round((15 + Math.random() * 15) * 10) / 10, // Range: 15 - 30
            });
        });

        currentDate.setDate(currentDate.getDate() + 1);
    }

    return data;
};

export const ENV_DATA: EnvLog[] = generateData();

export const POND_COLORS: Record<string, string> = {
    N01: colors.purple[600],
    N02: colors.orange[700],
    N03: colors.green[800],
    N04: colors.blue[700],
    N05: colors.magenta[900],
    V01: colors.cyan[800],
    V02: colors.red[600],
    V03: colors.geekblue[900],
    V04: colors.yellow[600],
    V05: colors.volcano[600],
};
