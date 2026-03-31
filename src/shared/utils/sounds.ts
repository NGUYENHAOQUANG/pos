/**
 * @file sounds.ts
 * @description Centralized sound playback utility for notification feedback.
 * Uses react-native-sound to play bundled audio files.
 *
 * Android: loads from android/app/src/main/res/raw/
 * iOS:     loads from app bundle (linked via react-native-asset)
 *
 * Usage:
 *   import { playSound } from '@/shared/utils/sounds';
 *   playSound('success');
 *   playSound('error');
 */
import { Platform } from 'react-native';
import Sound from 'react-native-sound';
import { useSettingsStore } from '@/features/menu/store/settingsStore';

/** Enable playback in silent mode (iOS) */
Sound.setCategory('Playback');

/** Sound type definition */
type SoundType = 'success' | 'error';

/** Pre-loaded sound cache to avoid re-loading on every play */
const soundCache: Record<SoundType, Sound | null> = {
    success: null,
    error: null,
};

/**
 * Load a sound file and cache it.
 * Android: pass filename without extension, basePath = null (loads from res/raw)
 * iOS: pass filename with extension, basePath = MAIN_BUNDLE
 */
const loadSound = (name: SoundType, fileName: string): void => {
    const androidName = fileName.replace('.mp3', '');
    const soundFile = Platform.OS === 'android' ? androidName : fileName;
    const basePath = Platform.OS === 'android' ? undefined : Sound.MAIN_BUNDLE;

    const sound = new Sound(soundFile, basePath, loadError => {
        if (loadError) {
            console.warn(`[Sound] Failed to load ${fileName}:`, loadError);
            soundCache[name] = null;
            return;
        }
        // Set volume to 80% for non-intrusive notification sounds
        sound.setVolume(0.8);
        soundCache[name] = sound;
        console.log(`[Sound] Loaded ${fileName} successfully`);
    });
};

/** Initialize sounds on module import */
loadSound('success', 'success.mp3');
loadSound('error', 'error.mp3');

/**
 * Play a notification sound
 * @param type - 'success' or 'error'
 */
export const playSound = (type: SoundType): void => {
    // Respect user settings
    if (!useSettingsStore.getState().soundEnabled) return;

    const sound = soundCache[type];
    if (!sound) {
        console.warn(`[Sound] Sound "${type}" not loaded, skipping`);
        return;
    }

    // Reset to beginning if already playing
    sound.stop(() => {
        sound.play(playSuccess => {
            if (!playSuccess) {
                console.warn(`[Sound] Playback failed for ${type}`);
            }
        });
    });
};
