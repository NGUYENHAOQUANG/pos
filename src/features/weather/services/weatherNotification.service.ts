import notifee, { AndroidImportance, AndroidStyle } from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ICurrentWeather, IDailyForecast } from '@/features/weather/types/weather.types';

const ALERT_COOLDOWN_HOURS = 4;
const CHANNEL_ID = 'weather-alerts';

// Storage keys for cooldowns
const STORAGE_KEYS = {
    temp_high: '@weather_alert_temp_high',
    temp_low: '@weather_alert_temp_low',
    rain_heavy: '@weather_alert_rain_heavy',
    rain_current: '@weather_alert_rain_current',
    wind: '@weather_alert_wind',
    thunderstorm: '@weather_alert_thunderstorm',
};

export class WeatherNotificationService {
    /**
     * Initialize notification channels and request permissions
     */
    static async initialize() {
        await notifee.requestPermission();

        // Create android channel
        await notifee.createChannel({
            id: CHANNEL_ID,
            name: 'Cảnh báo thời tiết',
            description: 'Thông báo về tình hình thời tiết bất lợi cho tôm',
            importance: AndroidImportance.HIGH,
        });
    }

    /**
     * Check if enough time has passed to send a warning again
     */
    private static async canSendAlert(type: keyof typeof STORAGE_KEYS): Promise<boolean> {
        try {
            const key = STORAGE_KEYS[type];
            const lastSentStr = await AsyncStorage.getItem(key);
            if (!lastSentStr) return true;

            const lastSent = parseInt(lastSentStr, 10);
            const now = Date.now();
            const hoursPassed = (now - lastSent) / (1000 * 60 * 60);

            return hoursPassed >= ALERT_COOLDOWN_HOURS;
        } catch (_e) {
            return true;
        }
    }

    /**
     * Mark an alert as sent recently
     */
    private static async markAlertSent(type: keyof typeof STORAGE_KEYS) {
        await AsyncStorage.setItem(STORAGE_KEYS[type], Date.now().toString());
    }

    /**
     * Display a local push notification
     */
    private static async triggerNotification(title: string, body: string) {
        await notifee.displayNotification({
            title: `${title}`,
            body,
            android: {
                channelId: CHANNEL_ID,
                importance: AndroidImportance.HIGH,
                smallIcon: 'ic_launcher', // fallback default icon
                pressAction: {
                    id: 'default',
                },
                style: {
                    type: AndroidStyle.BIGTEXT,
                    text: body,
                },
            },
        });
    }

    /**
     * Analyze weather and send push notification if necessary
     */
    static async checkAndNotify(current: ICurrentWeather, daily: readonly IDailyForecast[]) {
        // Temperature high
        if (current.temperature2m > 34) {
            if (await this.canSendAlert('temp_high')) {
                await this.triggerNotification(
                    'Cảnh báo nhiệt độ ao nuôi',
                    `Nhiệt độ hiện tại lên đến ${Math.round(
                        current.temperature2m
                    )}°C. Tôm có nguy cơ sốc nhiệt, hãy tăng cường quạt nước và bổ sung nước mát.`
                );
                await this.markAlertSent('temp_high');
            }
        }
        // Temperature low
        else if (current.temperature2m < 22) {
            if (await this.canSendAlert('temp_low')) {
                await this.triggerNotification(
                    'Cảnh báo nhiệt độ ao nuôi',
                    `Nhiệt độ xuống thấp ${Math.round(
                        current.temperature2m
                    )}°C. Tôm dễ bị stress và giảm ăn. Cần chú ý giảm lượng thức ăn hoặc bổ sung vitamin.`
                );
                await this.markAlertSent('temp_low');
            }
        }

        // Heavy rain predicted
        const todayForecast = daily[0];
        if (todayForecast && todayForecast.rainSum > 30) {
            if (await this.canSendAlert('rain_heavy')) {
                await this.triggerNotification(
                    'Dự báo có mưa lớn hôm nay',
                    `Tổng lượng mưa dự kiến: ${todayForecast.rainSum.toFixed(
                        1
                    )}mm. Hãy chuẩn bị vôi rải bờ và liên tục đo pH ao để tránh tôm bị sốc.`
                );
                await this.markAlertSent('rain_heavy');
            }
        }
        // Currently raining heavily
        else if (current.rain > 5) {
            if (await this.canSendAlert('rain_current')) {
                await this.triggerNotification(
                    'Đang có mưa lớn tại trại',
                    `Lượng mưa hiện hành: ${current.rain}mm/h. Chủ động kiềm tra mức nước, DO và pH liên tục.`
                );
                await this.markAlertSent('rain_current');
            }
        }

        // Thunderstorm
        if (current.weatherCode >= 95) {
            if (await this.canSendAlert('thunderstorm')) {
                await this.triggerNotification(
                    'Cảnh báo có Giông bão cực đoan',
                    'Chú ý tắt các thiết bị điện không cần thiết và gia cố mái che, bạt phủ quanh ao ngay lập tức.'
                );
                await this.markAlertSent('thunderstorm');
            }
        }

        // Wind speed
        if (current.windSpeed10m > 40) {
            if (await this.canSendAlert('wind')) {
                await this.triggerNotification(
                    'Cảnh báo gió lốc mạnh',
                    `Sức gió lên tới ${Math.round(
                        current.windSpeed10m
                    )} km/h. Vui lòng kiểm tra khẩn cấp hệ thống dây neo và bạt mái che.`
                );
                await this.markAlertSent('wind');
            }
        }
    }
}
