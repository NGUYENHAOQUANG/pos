/**
 * @file storage.service.ts
 * @description Storage Service - AsyncStorage wrapper. Adapter for Zustand persist middleware
 * @author Kindy
 * @created 2025-11-16
 * @updated 2026-01-12
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage adapter for Zustand persist
export const Storage = {
    setItem: async (key: string, value: string): Promise<void> => {
        try {
            await AsyncStorage.setItem(key, value);
        } catch (error) {
            console.warn('[Storage] Failed to set item:', key, error);
        }
    },
    getItem: async (key: string): Promise<string | null> => {
        try {
            const value = await AsyncStorage.getItem(key);
            return value ?? null;
        } catch (error) {
            console.warn('[Storage] Failed to get item:', key, error);
            return null;
        }
    },
    removeItem: async (key: string): Promise<void> => {
        try {
            await AsyncStorage.removeItem(key);
        } catch (error) {
            console.warn('[Storage] Failed to remove item:', key, error);
        }
    },
    clear: async (): Promise<void> => {
        try {
            await AsyncStorage.clear();
        } catch (error) {
            console.warn('[Storage] Failed to clear:', error);
        }
    },
};
