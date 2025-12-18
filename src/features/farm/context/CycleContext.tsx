import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface DropdownItem {
  label: string;
  value: string;
}

export interface BreedOption extends DropdownItem {
  materialCode?: string;
  price?: number;
  supplier?: string;
}

export interface FormData {
  cycleName?: string;
  breedSource?: string;
  seasonSource?: string;
  stockingDate?: string | null;
  stockingQuantity?: number | null;
  age?: number | null;
  density?: string;
  estimatedCost?: string;
  notes?: string;
}

interface CycleContextValue {
  formData: FormData;
  updateField: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
  breedOptions: BreedOption[];
  seasonOptions: DropdownItem[];
  handleCreateSeason: () => void;
  selectedBreed: BreedOption | null;
  selectedSeason: DropdownItem | null;
}

const CycleContext = createContext<CycleContextValue | undefined>(undefined);

export const CycleProvider: React.FC<{ children: ReactNode; initial?: Partial<FormData> }> = ({
  children,
  initial = {},
}) => {
  const [formData, setFormData] = useState<FormData>({
    cycleName: '',
    breedSource: undefined,
    seasonSource: undefined,
    stockingDate: null,
    stockingQuantity: null,
    age: null,
    density: undefined,
    estimatedCost: undefined,
    notes: undefined,
    ...initial,
  });

  // Example breed options (replace with real data/fetch)
  const [breedOptions] = useState<BreedOption[]>([
    { label: 'Tôm thẻ chân trắng - SIS PL12', value: 'A', materialCode: 'SIS-PL12', price: 120, supplier: 'Shrimp Improvement Systems' },
    { label: 'Tôm sú - SIS PL13', value: 'B', materialCode: 'SIS-PL13', price: 150, supplier: 'Shrimp Improvement Systems' },
  ]);

  const [seasonOptions, setSeasonOptions] = useState<DropdownItem[]>([
    { label: 'Vụ nuôi 1', value: '1' },
    { label: 'Vụ nuôi 2', value: '2' },
    { label: 'Vụ nuôi 3', value: '3' },
  ]);

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleCreateSeason = () => {
    const newItem: DropdownItem = {
      label: `Vụ mới - CK${seasonOptions.length + 1}`,
      value: Date.now().toString(),
    };
    setSeasonOptions(prev => [...prev, newItem]);
    setFormData(prev => ({ ...prev, seasonSource: newItem.value }));
  };

  const selectedBreed = breedOptions.find(b => b.value === formData.breedSource) ?? null;
  const selectedSeason = seasonOptions.find(s => s.value === formData.seasonSource) ?? null;

  return (
    <CycleContext.Provider
      value={{ formData, updateField, breedOptions, seasonOptions, handleCreateSeason, selectedBreed, selectedSeason }}
    >
      {children}
    </CycleContext.Provider>
  );
};

export const useCycle = (): CycleContextValue => {
  const ctx = useContext(CycleContext);
  if (!ctx) throw new Error('useCycle must be used within CycleProvider');
  return ctx;
};