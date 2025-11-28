/**
 * @file management.types.ts
 * @description Management feature types
 * @author Auto
 * @created 2025-01-27
 */

export interface BreedingArea {
  id?: string;
  name: string;
  code: string;
  country: string;
  countryCode: string;
  address: string;
  latitude: number;
  longitude: number;
  imageUri?: string | null;
}

export interface CreateBreedingAreaFormData {
  name: string;
  code: string;
  country: string;
  countryCode: string;
  address: string;
  latitude: number;
  longitude: number;
  imageUri?: string | null;
}
