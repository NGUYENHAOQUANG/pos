import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GetImportReceiptsParams } from '../types/importReceipt.types';

interface ImportReceiptState {
    searchText: string;
    filters: Omit<GetImportReceiptsParams, 'Page' | 'PageSize' | 'ReceiptCode' | 'SearchText'>;
    page: number;
    pageSize: number;

    setSearchText: (text: string) => void;
    setFilter: (key: keyof ImportReceiptState['filters'], value: any) => void;
    setPage: (page: number) => void;
    setPageSize: (size: number) => void;
    resetFilters: () => void;

    getQueryParams: () => GetImportReceiptsParams;
}

const DEFAULT_PAGE_SIZE = 10;

export const useImportReceiptStore = create<ImportReceiptState>()(
    persist(
        immer((set, get) => ({
            searchText: '',
            filters: {},
            page: 1,
            pageSize: DEFAULT_PAGE_SIZE,

            setSearchText: (text: string) =>
                set(state => {
                    state.searchText = text;
                    state.page = 1;
                }),

            setFilter: (key, value) =>
                set(state => {
                    if (value === null || value === undefined || value === '') {
                        delete state.filters[key];
                    } else {
                        state.filters[key] = value;
                    }
                    state.page = 1;
                }),

            setPage: (page: number) =>
                set(state => {
                    state.page = page;
                }),

            setPageSize: (size: number) =>
                set(state => {
                    state.pageSize = size;
                    state.page = 1;
                }),

            resetFilters: () =>
                set(state => {
                    state.searchText = '';
                    state.filters = {};
                    state.page = 1;
                }),

            getQueryParams: () => {
                const state = get();
                return {
                    Page: state.page,
                    PageSize: state.pageSize,
                    ReceiptCode: state.searchText || undefined,
                    ...state.filters,
                };
            },
        })),
        {
            name: 'import-receipt-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: state => ({
                pageSize: state.pageSize,
            }),
        }
    )
);
